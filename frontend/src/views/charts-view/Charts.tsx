import { useEffect, useState } from 'react'
import { useOrganisationContext } from '../../customHooks/useOrganisationsContext';
import { useLoggedUserContext } from '../../customHooks/useLoggedUserContext';
import { Alert, Button, Col, Container, Form, FormGroup, Row, Spinner } from 'react-bootstrap';
import measurementPointsRequests, { MeasurementPoint } from '../../../API/requests/measurementPointsRequests';
import dayjs from 'dayjs';
import dataRequests, { SensorDataInfluxOutput } from '../../../API/requests/dataRequests';
import { useSearchParams } from 'react-router-dom';
import TemperatureChart from '../../components/charts/TemperatureChart';

const Charts = () => {
    const { userData } = useLoggedUserContext();
    const [searchParams] = useSearchParams();
    const measurementPointIdFromQuery = searchParams.get("measurementPointId");

    const { selectedOrganisation } = useOrganisationContext();

    const [alerts, setAlerts] = useState<{ type: string, message: string }[]>([]);
    const [isLoading, setIsLoading] = useState({ measurementPoints: false, data: false });

    const [orgMeasurementPoints, setOrgMeasurementPoints] = useState<MeasurementPoint[]>([]);
    const [selectedMpId, setSelectedMpId] = useState(measurementPointIdFromQuery ?? "");

    const [fromDayjs, setFromDayjs] = useState<dayjs.Dayjs>(dayjs().subtract(1, 'day'));
    const [toDayjs, setToDayjs] = useState<dayjs.Dayjs>(dayjs());

    const [measurementData, setMeasurementData] = useState<SensorDataInfluxOutput[]>([]); // Replace 'any' with the actual type of your measurement data

    const fetchData = async (fromUnix?: number, toUnix?: number) => {
        if (!selectedOrganisation || !selectedMpId) {
            console.info("No organisation or measurement point selected, skipping data fetch.");
            return;
        }
        const fromEpoch = fromUnix ?? fromDayjs.unix();
        const toEpoch = toUnix ?? toDayjs.unix();

        setIsLoading((prev) => ({ ...prev, data: true }));
        try {
            const result = await dataRequests.retrieveData({
                fromEpoch,
                toEpoch,
                measurementPointId: selectedMpId,
            })
            setMeasurementData(result);
        } catch (err) {
            console.error("Error fetching data:", err);
        }
        finally {
            setIsLoading((prev) => ({ ...prev, data: false }));
        }
    }

    const pickDefaultInterval = (amount: number, unit: dayjs.ManipulateType) => {
        const toDate = dayjs();
        const fromDate = dayjs().subtract(amount, unit);
        setToDayjs(toDate);
        setFromDayjs(fromDate);
        fetchData(fromDate.unix(), toDate.unix());
    }

    useEffect(() => {
        const fetchMeasurementPoints = async (organisationId: string) => {
            setIsLoading({ measurementPoints: true, data: false });
            try {
                const result = await measurementPointsRequests.listMeasurementPoints({ organisationId });
                setOrgMeasurementPoints(result.measurementPoints);
            } catch (error) {
                console.error("Error fetching measurement points:", error);
            }
            finally {
                setIsLoading({ measurementPoints: false, data: false });
            }
        }

        if (!selectedOrganisation) {
            setSelectedMpId("");
            return;
        }
        fetchMeasurementPoints(selectedOrganisation._id);
    }, [selectedOrganisation])

    useEffect(() => {
        if (!selectedMpId || !selectedOrganisation) {
            setMeasurementData([]);
            return;
        }
        console.log("Fetching data for selected measurement point:", selectedMpId);
        void fetchData();
    }, [selectedOrganisation, selectedMpId])



    return (
        <Container className='mt-4'>
            <h1>Meaured Data</h1>

            <Row className='fw-bold border border-2 mb-3 p-3 rounded'>
                <Col md={3}>
                    <FormGroup className='mb-3'>
                        <Form.Label htmlFor='measurementPoint'>Measurement Point (Data Source) </Form.Label>
                        <Form.Select
                            disabled={!!(selectedOrganisation && !isLoading.measurementPoints && orgMeasurementPoints.length < 1)}
                            id='measurementPoint'
                            name='measurementPoint'
                            value={selectedMpId}
                            onChange={(e) => setSelectedMpId(e.target.value)}
                        >
                            {(selectedOrganisation && !isLoading.measurementPoints && orgMeasurementPoints.length < 1)
                                ? (
                                    <option value="">Selected organisation doesnt have any measurement points</option>
                                )
                                : (
                                    <>
                                        <option value="">Select measurement point</option>
                                        {orgMeasurementPoints.map((mp) => (
                                            <option key={mp._id} value={mp._id}>{mp.name}</option>
                                        ))}
                                    </>
                                )}
                        </Form.Select>
                    </FormGroup>
                </Col>
                <Col md={9}>
                    {!selectedOrganisation && (
                        <Alert variant='info'>
                            Please select an organisation to view the charts.
                        </Alert>
                    )}
                </Col>

                <Col sm={6}>
                    <Form.Label htmlFor='dateRange'>Interval of Displayed Data</Form.Label>

                </Col>
                <Col sm={6}>
                    <Form.Label>Quick Interval Select</Form.Label>
                    <div className='d-flex flex-row gap-2'>
                        <Button
                            className=''
                            variant='primary'
                            disabled={isLoading.data || !selectedMpId}
                            onClick={() => pickDefaultInterval(1, "day")}
                        >
                            Last 24h
                        </Button>

                        <Button
                            className=''
                            variant='primary'
                            disabled={isLoading.data || !selectedMpId}
                            onClick={() => pickDefaultInterval(1, "week")}
                        >
                            Last Week
                        </Button>

                        <Button
                            className=''
                            variant='primary'
                            disabled={isLoading.data || !selectedMpId}
                            onClick={() => pickDefaultInterval(1, "month")}
                        >
                            Last Month
                        </Button>
                    </div>
                </Col>
            </Row>


            <Row className='mb-4'>
                <Col>
                    {isLoading.data && (<Spinner animation='border' variant='primary' className='mx-auto' />)}
                    {selectedMpId && !isLoading.data && measurementData.length < 1 && (
                        <Alert variant='info' className='mx-auto'>
                            No data available for the selected measurement point in the specified time range.
                        </Alert>
                    )}
                </Col>
            </Row>

            <Row className='mb-4'>
                <Col className='d-flex flex-column gap-2'>
                    {measurementData.map((sensorData) => {
                        const sensor = orgMeasurementPoints.find((mp) => mp._id === selectedMpId)?.sensors.find((s) => s.sensorId === sensorData.sensorId);
                        if (!sensor) {
                            console.warn(`Sensor with ID ${sensorData.sensorId} not found in measurement point ${selectedMpId}`);
                            return null;
                        }
                        if (!sensorData || sensorData.sensorData.length < 1) {
                            return (
                                <div className='border border-1 p-3 rounded'>
                                    <p className="text-info">
                                        <strong className="">Sensor {sensor.name}</strong>
                                    </p>
                                    <Alert variant="warning" className="mb-3">
                                        <span key={sensor.sensorId}>No data available for sensor (measured quantity: {sensor.quantity}) in the last 24h.</span>
                                    </Alert>
                                </div>
                            );
                        }
                        return (
                            <div className='border border-1 p-3 rounded my-2' key={sensorData.sensorId}>
                                <Button
                                    className='mb-2 me-auto'
                                    style={{ alignSelf: "flex-start" }}
                                    variant='primary'
                                    onClick={() => console.log("implemented export functionality")}
                                >
                                    Expor Data
                                </Button>

                                <p className="text-info">
                                    <strong className="">Sensor {sensor.name}</strong>
                                </p>
                                <TemperatureChart showStats key={sensor.sensorId} data={sensorData} />
                            </div>
                        );
                    })}
                </Col>
            </Row>
        </Container>
    )
}

export default Charts