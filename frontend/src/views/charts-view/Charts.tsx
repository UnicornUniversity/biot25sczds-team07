import { useEffect, useState } from 'react'
import { useOrganisationContext } from '../../customHooks/useOrganisationsContext';
import { Alert, Button, Col, Container, Form, FormGroup, Row, Spinner } from 'react-bootstrap';
import measurementPointsRequests, { MeasurementPoint } from '../../../API/requests/measurementPointsRequests';
import dayjs from 'dayjs';
import dataRequests, { SensorDataInfluxOutput } from '../../../API/requests/dataRequests';
import { useSearchParams } from 'react-router-dom';

import SensorChart from './components/SensorChart';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";


const Charts = () => {
    // const { userData } = useLoggedUserContext();
    const [searchParams] = useSearchParams();
    const measurementPointIdFromQuery = searchParams.get("measurementPointId");
    console.log("Measurement Point ID from query:", measurementPointIdFromQuery);

    const { selectedOrganisation } = useOrganisationContext();
    const [isLoading, setIsLoading] = useState({ measurementPoints: false, data: !!measurementPointIdFromQuery });

    const [orgMeasurementPoints, setOrgMeasurementPoints] = useState<MeasurementPoint[]>([]);
    const [selectedMpId, setSelectedMpId] = useState(measurementPointIdFromQuery ?? "");

    const [fromDayjs, setFromDayjs] = useState<dayjs.Dayjs>(dayjs().subtract(1, 'day'));
    const [toDayjs, setToDayjs] = useState<dayjs.Dayjs>(dayjs());
    const [datePickerOpen, setDatePickerOpen] = useState<0 | 1 | 2>(0);

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
            setIsLoading({ ...isLoading, measurementPoints: true, });
            try {
                const result = await measurementPointsRequests.listMeasurementPoints({ organisationId });
                setOrgMeasurementPoints(result.measurementPoints);

                if (measurementPointIdFromQuery && result.measurementPoints.some(mp => mp._id === measurementPointIdFromQuery)) {
                    setSelectedMpId(measurementPointIdFromQuery);
                }
            } catch (error) {
                console.error("Error fetching measurement points:", error);
            }
            finally {
                setIsLoading({ ...isLoading, measurementPoints: false, });
            }
        }

        if (!selectedOrganisation) {
            setSelectedMpId("");
            return;
        }
        fetchMeasurementPoints(selectedOrganisation._id);
    }, [selectedOrganisation, measurementPointIdFromQuery])

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
            <h1>Measured Data</h1>

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
                <Col md={9} className='d-flex flex-column justify-content-end '>
                    {!selectedOrganisation && (
                        <Alert variant='info'>
                            Please select an organisation to view the charts.
                        </Alert>
                    )}
                    {(selectedOrganisation && !selectedMpId) && (
                        <Alert variant='info'>
                            Please select an Measurement Point to view the charts.
                        </Alert>
                    )}
                </Col>

                <Col sm={6} className='d-flex flex-row justify-content-between gap-2 '>
                    <div className='d-flex flex-row gap-2'>
                        <div className='d-flex flex-column' style={{ position: "relative" }}>
                            <Form.Label htmlFor='dateFrom'>From Date:</Form.Label>
                            <Button color="primary" onClick={() => setDatePickerOpen(1)} >
                                <i className="bi bi-calendar-fill me-2" />
                                {fromDayjs.format("DD.MM.YYYY")}
                            </Button>
                            {datePickerOpen === 1 && (
                                <>
                                    <div
                                        style={{
                                            position: "fixed",
                                            top: 0,
                                            left: 0,
                                            width: "100vw",
                                            height: "100vh",
                                            zIndex: 999,
                                            background: "transparent",
                                        }}
                                        onClick={() => setDatePickerOpen(0)}
                                    />
                                    <div style={{
                                        position: "absolute",
                                        zIndex: 1000,
                                        top: "100%",
                                        left: 0,
                                        background: "#fff",
                                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                                        borderRadius: "8px"
                                    }}>
                                        <DatePicker
                                            selected={fromDayjs.toDate()}
                                            maxDate={toDayjs.subtract(1, "day").toDate()}
                                            onSelect={(date) => {
                                                if (!date) return;
                                                setFromDayjs(dayjs(date));
                                                setDatePickerOpen(0);
                                            }}
                                            inline
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                        <div className='d-flex flex-column' style={{ position: "relative" }}>
                            <Form.Label htmlFor='dateTo'>To Date:</Form.Label>
                            <Button color="primary" onClick={() => setDatePickerOpen(2)}                        >
                                <i className="bi bi-calendar-fill me-2" />
                                {toDayjs.format("DD.MM.YYYY")}
                            </Button>
                            {datePickerOpen === 2 && (
                                <>
                                    <div
                                        style={{
                                            position: "fixed",
                                            top: 0,
                                            left: 0,
                                            width: "100vw",
                                            height: "100vh",
                                            zIndex: 999,
                                            background: "transparent",
                                        }}
                                        onClick={() => setDatePickerOpen(0)}
                                    />
                                    <div style={{
                                        position: "absolute",
                                        zIndex: 1000,
                                        top: "100%",
                                        left: 0,
                                        background: "#fff",
                                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                                        borderRadius: "8px"
                                    }}>
                                        <DatePicker
                                            selected={toDayjs.toDate()}
                                            minDate={fromDayjs.add(1, "day").toDate()}
                                            onSelect={(date) => {
                                                if (!date) return;
                                                setToDayjs(dayjs(date));
                                                setDatePickerOpen(0);
                                            }}
                                            inline
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <Button
                        className=' align-self-end'
                        color="primary"
                        onClick={() => fetchData()}
                    >
                        <i className="bi bi-bar-chart-fill me-2" />
                        View Data
                    </Button>
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
                    {isLoading.data && (<Spinner className="ms-1" as="span" size="sm" aria-hidden="true" animation="border" role="status" />)}
                    {selectedMpId && orgMeasurementPoints.length > 0 && !isLoading.data && measurementData.length < 1 && (
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
                        return (
                            <SensorChart
                                key={sensorData.sensorId}
                                fromDayJs={fromDayjs}
                                toDayJs={toDayjs}
                                sensor={sensor} sensorData={sensorData}
                            />
                        )
                    })}
                </Col>
            </Row>
        </Container>
    )
}

export default Charts