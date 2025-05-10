import { useState } from "react";
import { Row, Col, Form, Alert } from "react-bootstrap";

import sensorRequests from "../../../../../../API/requests/sensorsRequests";
import { Sensor } from "../../../../../../API/requests/measurementPointsRequests";
import DefaultModal from "../../../../../components/modals/DefaultModal";
import { MeasurementPointCardModalVersion } from "../MeasurementPointCard";



interface Props {
    modalVersion: 'update-sensor',
    setModalVersion: React.Dispatch<React.SetStateAction<MeasurementPointCardModalVersion>>,
    acknowladgeNewSensors: (sensors: Sensor[]) => void,
    sensor: Sensor,
    mpId: string;
}
const SensorUpdateModal = (props: Props) => {
    const {
        modalVersion, setModalVersion,
        acknowladgeNewSensors,
        sensor,
        mpId,
    } = props;

    const [isLoading, setIsLoading] = useState(false);
    const [alerts, setAlerts] = useState<string[]>([]);

    const [updatedSensor, setUpdatedSensor] = useState<Sensor>(sensor);

    const updateSensorHandler = async () => {
        setIsLoading(true);
        try {
            if (!updatedSensor.name || updatedSensor.name.length < 3) {
                setAlerts(["Sensor name must be at least 3 characters long."]);
                return;
            }

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { created, ...updatedConfig } = updatedSensor.config;
            const result = await sensorRequests.updateSensor({
                measurementPointId: mpId,
                sensorId: updatedSensor.sensorId,
                name: updatedSensor.name,
                quantity: updatedSensor.quantity,
                config: updatedConfig,
            });
            if (result) {
                setModalVersion("");
                setAlerts([]);
                acknowladgeNewSensors(result.sensors);
                return;
            }
            setAlerts(["Error updating sensor. Please try again."]);
        }
        catch (error) {
            console.error("Error updating sensor: ", error);
            setAlerts(["Error updating sensor. Please try again."]);
        }
        finally {
            setIsLoading(false);
        }
    }

    return (
        <DefaultModal
            title="Update Sensor"
            show={modalVersion === "update-sensor"}
            submitText="Update"
            submitButtonColor="warning"
            onSubmit={() => void updateSensorHandler()}
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
                                value={updatedSensor.name}
                                placeholder="Enter Name"
                                minLength={3}
                                maxLength={80}
                                onChange={(e) => setUpdatedSensor({ ...updatedSensor, name: e.target.value ?? "" })}
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
                                value={updatedSensor.config.sendInterval}
                                min={120}
                                onChange={(e) => {
                                    const updatedConfig = updatedSensor.config;
                                    updatedConfig.sendInterval = e.target.value ? parseInt(e.target.value) : 120;
                                    setUpdatedSensor({ ...updatedSensor, config: updatedConfig });
                                }}
                            />
                            <Form.Text className="text-muted">
                                Measured data will be sent every {updatedSensor.config.sendInterval} seconds.
                            </Form.Text>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group className="mb-3" controlId="name">
                            <Form.Label>Measuring Interval</Form.Label>
                            <Form.Control
                                type="number"
                                value={updatedSensor.config.measureInterval}
                                min={60}
                                onChange={(e) => {
                                    const updatedConfig = updatedSensor.config;
                                    updatedConfig.measureInterval = e.target.value ? parseInt(e.target.value) : 60;
                                    setUpdatedSensor({ ...updatedSensor, config: updatedConfig });
                                }}
                            />
                            <Form.Text className="text-muted">
                                Data will be measured every {updatedSensor.config.sendInterval} seconds.
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
                                value={updatedSensor.config.temperatureLimits.heating}
                                max={35}
                                onChange={(e) => {
                                    const updatedConfig = updatedSensor.config;
                                    updatedConfig.temperatureLimits.heating = e.target.value ? parseInt(e.target.value) : 35;
                                    setUpdatedSensor({ ...updatedSensor, config: updatedConfig });
                                }}
                            />
                            <Form.Text className="text-muted">
                                Device starts heating when temperature drops bellow {updatedSensor.config.temperatureLimits.heating}°C.
                            </Form.Text>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group className="mb-3" controlId="name">
                            <Form.Label>Cooling</Form.Label>
                            <Form.Control
                                type="number"
                                value={updatedSensor.config.temperatureLimits.cooling}
                                max={35}
                                onChange={(e) => {
                                    const updatedConfig = updatedSensor.config;
                                    updatedConfig.temperatureLimits.cooling = e.target.value ? parseInt(e.target.value) : 35;
                                    setUpdatedSensor({ ...updatedSensor, config: updatedConfig });
                                }}
                            />
                            <Form.Text className="text-muted">
                                Device starts cooling when temperature rises above {updatedSensor.config.temperatureLimits.cooling}°C.
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

export default SensorUpdateModal;