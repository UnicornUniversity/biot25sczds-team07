import { useState } from "react";
import { Row, Col, Form, Alert } from "react-bootstrap";

import sensorRequests, { AddSensorDtoIn } from "../../../../../../API/requests/sensorsRequests";
import { Sensor } from "../../../../../../API/requests/measurementPointsRequests";
import DefaultModal from "../../../../../components/modals/DefaultModal";
import { MeasurementPointCardModalVersion } from "../MeasurementPointCard";



interface Props {
    modalVersion: 'add-sensor',
    setModalVersion: React.Dispatch<React.SetStateAction<MeasurementPointCardModalVersion>>,
    acknowladgeNewSensors: (sensors: Sensor[]) => void,

    mpId: string;
}
const SensorAddModal = (props: Props) => {
    const {
        modalVersion, setModalVersion,
        acknowladgeNewSensors,
        mpId,
    } = props;

    const [isLoading, setIsLoading] = useState(false);
    const [alerts, setAlerts] = useState<string[]>([]);

    const [newSensor, setNewSensor] = useState<AddSensorDtoIn>({
        measurementPointId: mpId,
        name: "",
        quantity: "temperature",
        config: {
            sendInterval: 3600,
            measureInterval: 600,
            temperatureLimits: {
                cooling: 24, // if temperature is above this number => start cooling
                heating: 15 // if temperature is below this number => start heating
            }
        },
    });

    const addSensorHandler = async () => {
        setIsLoading(true);
        try {
            if (!newSensor.name || newSensor.name.length < 3) {
                setAlerts(["Sensor name must be at least 3 characters long."]);
                return;
            }

            const result = await sensorRequests.addSensor(newSensor);
            if (result) {
                setModalVersion("");
                setAlerts([]);
                acknowladgeNewSensors(result.sensors);
                return;
            }
            setAlerts(["Error adding sensor. Please try again."]);
        }
        catch (error) {
            console.error("Error adding sensor: ", error);
            setAlerts(["Error adding sensor. Please try again."]);
        }
        finally {
            setIsLoading(false);
        }
    }

    return (
        <DefaultModal
            title="Create Sensor"
            show={modalVersion === "add-sensor"}
            submitText="Create"
            submitButtonColor="success"
            onSubmit={() => void addSensorHandler()}
            isLoading={isLoading}
            onHide={() => setModalVersion("")}
        >


            <Form id="measurement-point-form">
                <Row>
                    <Col>
                        <Form.Group className="mb-3" controlId="name">
                            <Form.Label>Measured Quantity</Form.Label>
                            <Form.Select
                                defaultValue="temperature..."
                                disabled
                            >
                                <option>
                                    <i className="bi bi-thermometer me-1" />
                                    temperature
                                </option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group className="mb-3" controlId="name">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={newSensor.name}
                                placeholder="Enter Name"
                                minLength={3}
                                maxLength={80}
                                onChange={(e) => setNewSensor({ ...newSensor, name: e.target.value ?? "" })}
                            />
                        </Form.Group>
                    </Col>
                </Row>

                <Row>
                    <Col>
                        <Form.Group className="mb-3" controlId="name">
                            <Form.Label>Data Send Interval</Form.Label>
                            <Form.Control
                                type="number"
                                value={newSensor.config.sendInterval}
                                min={120}
                                onChange={(e) => {
                                    const updatedConfig = newSensor.config;
                                    updatedConfig.sendInterval = e.target.value ? parseInt(e.target.value) : 120;
                                    setNewSensor({ ...newSensor, config: updatedConfig });
                                }}
                            />
                            <Form.Text className="text-muted">
                                Measured data will be sent every {newSensor.config.sendInterval} seconds.
                            </Form.Text>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group className="mb-3" controlId="name">
                            <Form.Label>Measuring Interval</Form.Label>
                            <Form.Control
                                type="number"
                                value={newSensor.config.measureInterval}
                                min={60}
                                onChange={(e) => {
                                    const updatedConfig = newSensor.config;
                                    updatedConfig.measureInterval = e.target.value ? parseInt(e.target.value) : 60;
                                    setNewSensor({ ...newSensor, config: updatedConfig });
                                }}
                            />
                            <Form.Text className="text-muted">
                                Data will be measured every {newSensor.config.sendInterval} seconds.
                            </Form.Text>
                        </Form.Group>
                    </Col>
                </Row>

                <Row>
                    <Col>
                        <Form.Group className="mb-3" controlId="name">
                            <Form.Label>Heating</Form.Label>
                            <Form.Control
                                type="number"
                                value={newSensor.config.temperatureLimits.heating}
                                max={35}
                                onChange={(e) => {
                                    const updatedConfig = newSensor.config;
                                    updatedConfig.temperatureLimits.heating = e.target.value ? parseInt(e.target.value) : 35;
                                    setNewSensor({ ...newSensor, config: updatedConfig });
                                }}
                            />
                            <Form.Text className="text-muted">
                                Device starts heating when temperature drops bellow {newSensor.config.temperatureLimits.heating}°C.
                            </Form.Text>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group className="mb-3" controlId="name">
                            <Form.Label>Cooling</Form.Label>
                            <Form.Control
                                type="number"
                                value={newSensor.config.temperatureLimits.cooling}
                                max={35}
                                onChange={(e) => {
                                    const updatedConfig = newSensor.config;
                                    updatedConfig.temperatureLimits.cooling = e.target.value ? parseInt(e.target.value) : 35;
                                    setNewSensor({ ...newSensor, config: updatedConfig });
                                }}
                            />
                            <Form.Text className="text-muted">
                                Device starts cooling when temperature rises above {newSensor.config.temperatureLimits.cooling}°C.
                            </Form.Text>
                        </Form.Group>
                    </Col>
                </Row>
            </Form>

            {alerts.map((alert, index) => (
                <Alert key={index} variant="danger" className="mt-2">
                    {alert}
                </Alert>
            ))}
        </DefaultModal>

    );
}

export default SensorAddModal;