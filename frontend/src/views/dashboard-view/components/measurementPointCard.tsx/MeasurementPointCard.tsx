import { memo, useCallback, useState } from "react";
import { Button, Col, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

import { MeasurementPoint, Sensor } from "../../../../../API/requests/measurementPointsRequests";

import { DashboardModalVersion } from "../../Dashboard";
import SensorItem from "./SensorItem";
import TemperatureChart from "../../../../components/charts/TemperatureChart";

import SensorAddModal from "./modals/SensorAddModal";
import SensorUpdateModal from "./modals/SensorUpdateModal";
import SensorDeleteModal from "./modals/SensorDeleteModal";


export type MeasurementPointCardModalVersion = 'add-sensor' | 'update-sensor' | 'delete-sensor' | '';
interface Props {
    measurementPoint: MeasurementPoint,
    setModalVersion: React.Dispatch<React.SetStateAction<DashboardModalVersion>>,
    setEditedMeasurementPoint: React.Dispatch<React.SetStateAction<MeasurementPoint | null>>,
}
const MeasurementPointCard = (props: Props) => {
    const {
        measurementPoint,
        setModalVersion,
        setEditedMeasurementPoint
    } = props;

    const navigate = useNavigate();

    // const [isLoading, setIsLoading] = useState(false);[]
    // const [alerts, setAlerts] = useState<string[]>([]);
    const [localModalVersion, setLocalModalVersion] = useState<MeasurementPointCardModalVersion>('');


    const [sensors, setSensors] = useState<Sensor[]>(measurementPoint.sensors || []);
    const [selectedSensor, setSelectedSensor] = useState<Sensor | null>(null);

    const acknowladgeNewSensors = useCallback((sensors: Sensor[]) => {
        setSensors(sensors);
        setSelectedSensor(null);
    }, []);

    const acknowladgeDeletedSensor = useCallback((sensorId: string) => {
        setSensors(sensors.filter((sensor) => sensor.sensorId !== sensorId));
        setSelectedSensor(null);
    }, [sensors]);

    return (
        <>
            {localModalVersion === 'add-sensor' && (
                <SensorAddModal
                    modalVersion={localModalVersion}
                    setModalVersion={setLocalModalVersion}
                    mpId={measurementPoint._id}
                    acknowladgeNewSensors={acknowladgeNewSensors}
                />
            )}
            {(localModalVersion === 'update-sensor' && selectedSensor) && (
                <SensorUpdateModal
                    modalVersion={localModalVersion}
                    setModalVersion={setLocalModalVersion}
                    mpId={measurementPoint._id}
                    sensor={selectedSensor}
                    acknowladgeNewSensors={acknowladgeNewSensors}
                />
            )}
            {(localModalVersion === 'delete-sensor' && selectedSensor) && (
                <SensorDeleteModal
                    modalVersion={localModalVersion}
                    setModalVersion={setLocalModalVersion}
                    mpId={measurementPoint._id}
                    sensor={selectedSensor}
                    acknowladgeDeletedSensor={acknowladgeDeletedSensor}
                />
            )}

            <Row className="shadow border border-3 border-secondary  rounded-3 mb-3 p-3">
                <Col sm={10}>
                    <h4 className="text-primary">{measurementPoint.name}</h4>
                    <p className="text-muted">MeasurementPoint ID: {measurementPoint._id}</p>
                    <p>{measurementPoint.description}</p>
                </Col>
                <Col sm={2} className="d-flex flex-row justify-content-end gap-2 align-items-start">
                    <Button
                        variant="warning"
                        onClick={() => {
                            setModalVersion('update-measurement-point');
                            setEditedMeasurementPoint(measurementPoint);
                        }}
                    >
                        <i className="bi bi-pencil-fill" />
                        <span className="ms-1">Edit</span>
                    </Button>
                    <Button
                        variant="danger"
                        onClick={() => {
                            setModalVersion('delete-measurement-point');
                            setEditedMeasurementPoint(measurementPoint);
                        }}
                    >
                        <i className="bi bi-trash" />
                        <span className="ms-1">Delete</span>
                    </Button>
                </Col>


                <Col sm={12} className="d-flex flex-column gap-4">
                    <hr className="mb-0" />
                    <div>
                        <div className="d-flex justify-content-between">
                            <p>
                                <strong>Temperature data recorded in last 24h:</strong>
                            </p>
                            <Button
                                variant="primary"
                                onClick={() => navigate(`/data?mpId=${measurementPoint._id}`)}

                            >
                                <i className="bi bi-graph-up-arrow me-2" />
                                View Data
                            </Button>
                        </div>

                        <TemperatureChart data={[]} />
                    </div>
                    <div>
                        <div className="d-flex mb-2 flex-row justify-content-between align-items-center">
                            <p>   <strong className="">Measurement Point Sensors:</strong></p>
                            <Button
                                variant="success"
                                onClick={() => setLocalModalVersion('add-sensor')}
                            >
                                <i className="bi bi-plus" />
                                <span className="ms-1">Add Sensor</span>
                            </Button>
                        </div>

                        <div className="d-flex flex-column gap-2">
                            {sensors.map((sensor) => (
                                <SensorItem
                                    sensor={sensor}
                                    setModalVersion={setLocalModalVersion}
                                    setEditedSensor={setSelectedSensor}
                                />
                            ))}
                        </div>
                    </div>
                </Col>
            </Row>
        </>

    );
}

export default memo(MeasurementPointCard);