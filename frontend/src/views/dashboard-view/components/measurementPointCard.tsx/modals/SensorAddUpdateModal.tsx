import { useState } from "react";
import { Row, Col, Form, Alert } from "react-bootstrap";

import sensorRequests from "../../../../../../API/requests/sensorsRequests";
import { MeasuredQuantity, Sensor } from "../../../../../../API/requests/measurementPointsRequests";
import DefaultModal from "../../../../../components/modals/DefaultModal";
import { MeasurementPointCardModalVersion } from "../MeasurementPointCard";
import { parseIntervalToHMS } from "../../../../../helpers";


const constraints = {
    minNameLength: 3,
}

interface Props {
    modalVersion: 'add-sensor' | 'update-sensor',
    setModalVersion: React.Dispatch<React.SetStateAction<MeasurementPointCardModalVersion>>,
    acknowladgeNewSensors: (sensors: Sensor[]) => void,

    mpId: string;
    sensor?: Sensor; // Optional for update sensor modal
}
const SensorAddUpdateModal = (props: Props) => {
    const {
        modalVersion, setModalVersion,
        acknowladgeNewSensors,
        mpId,
        sensor
    } = props;

    const [isLoading, setIsLoading] = useState(false);
    const [alerts, setAlerts] = useState<string[]>([]);
    const [validated, setValidated] = useState(false);

    const [sensorObject, setSensorObject] = useState({
        name: sensor?.name ?? "",
        quantity: sensor?.quantity ?? "temperature",
        measureInterval: sensor?.config.measureInterval
            ? parseIntervalToHMS(sensor.config.measureInterval)
            : { hours: 0, minutes: 1, seconds: 30 },
        sendInterval: sensor?.config.measureInterval
            ? parseIntervalToHMS(sensor.config.sendInterval)
            : { hours: 0, minutes: 30, seconds: 0 },
        cooling: sensor?.config.temperatureLimits.cooling ?? 24, // if temperature is above this number => start cooling
        heating: sensor?.config.temperatureLimits.heating ?? 15, // if temperature is below this number => start heating
    });

    console.log("sensorObject: ", sensorObject);
    const valid = {
        name: sensorObject.name.length > 2,
        quantity: ["temperature", "acceleration"].includes(sensorObject.quantity),
        sendInterval: Object.values(sensorObject.sendInterval).some((val) => val > 0),
        measureInterval: Object.values(sensorObject.sendInterval).some((val) => val > 0),
        cooling: !isNaN(Number(sensorObject.cooling)),
        heating: !isNaN(Number(sensorObject.heating)),
    }

    const submitHandler = async () => {
        setValidated(true);
        if (Object.values(valid).some((val) => !val)) {
            console.log("Form is not valid: ", valid);
            return;
        }
        const sendInterval = sensorObject.sendInterval.hours * 3600 + sensorObject.sendInterval.minutes * 60 + sensorObject.sendInterval.seconds;
        const measureInterval = sensorObject.measureInterval.hours * 3600 + sensorObject.measureInterval.minutes * 60 + sensorObject.measureInterval.seconds;


        if (measureInterval <= 60) {
            setAlerts(["Measure Interval must be longer than 60 seconds."])
            return;
        }
        if (measureInterval >= sendInterval) {
            setAlerts(["Measure Interval cannot be longer or same period as send interval"]);
            return;
        }

        setIsLoading(true);
        try {
            const requestBody = {
                measurementPointId: mpId,
                name: sensorObject.name,
                quantity: sensorObject.quantity as MeasuredQuantity,
                config: {
                    sendInterval,
                    measureInterval,
                    temperatureLimits: {
                        cooling: sensorObject.cooling,
                        heating: sensorObject.heating
                    }
                },
            }
            const result = (modalVersion === "add-sensor")
                ? await sensorRequests.addSensor(requestBody)
                : await sensorRequests.updateSensor({
                    ...requestBody,
                    sensorId: sensor?.sensorId as string,
                })

            console.log("Sensor add/update result: ", result.sensors);
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
            title={modalVersion === "add-sensor" ? "Create Sensor" : "Update Sensor"}
            show={true}
            submitText={modalVersion === "add-sensor" ? "Create" : "Update"}
            submitButtonColor={modalVersion === "add-sensor" ? "success" : "warning"}
            onSubmit={() => void submitHandler()}
            isLoading={isLoading}
            size="lg"
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
                                    {/* <i className="bi bi-thermometer me-1" /> */}
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
                                value={sensorObject.name}
                                placeholder="Enter Name"
                                isInvalid={validated && !valid.name}
                                minLength={constraints.minNameLength}
                                maxLength={80}
                                onChange={(e) => setSensorObject({ ...sensorObject, name: e.target.value ?? "" })}
                            />
                            <Form.Control.Feedback type="invalid">
                                Name must be at least {constraints.minNameLength} characters long.
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                </Row>

                <Row>
                    <Col>
                        <Form.Group className="" controlId="name">
                            <Form.Label>Heating</Form.Label>
                            <Form.Control
                                type="number"
                                value={sensorObject.heating}
                                max={sensorObject.cooling - 1}
                                min={-150}
                                onChange={(e) => {
                                    let heating = Number(e.target.value);
                                    if (heating < -150) { heating = -150; }
                                    else if (heating >= (sensorObject.cooling)) { heating = sensorObject.cooling - 1; }
                                    setSensorObject({
                                        ...sensorObject,
                                        heating,
                                    })
                                }}
                            />
                        </Form.Group>
                        <Form.Text className="text-muted">
                            Device starts heating when temperature drops bellow {sensorObject.heating}°C.
                        </Form.Text>
                    </Col>

                    <Col>
                        <Form.Group className="" controlId="name">
                            <Form.Label>Cooling</Form.Label>
                            <Form.Control
                                type="number"
                                value={sensorObject.cooling}
                                min={-10}
                                max={300}
                                onChange={(e) => {
                                    let cooling = Number(e.target.value);
                                    if (cooling < -10) { cooling = -10; }
                                    else if (cooling <= (sensorObject.heating)) { cooling = sensorObject.heating + 1; }
                                    setSensorObject({
                                        ...sensorObject,
                                        cooling,
                                    })
                                }}
                            />
                            <Form.Text className="text-muted">
                                Device starts cooling when temperature rises above {sensorObject.cooling}°C.
                            </Form.Text>
                        </Form.Group>
                    </Col>
                </Row>

                <hr />

                <Row className="mt-3">
                    <Col className="">
                        <div className="mb-2">
                            <b>Send Data</b>
                        </div>
                        <div className="d-flex flex-row gap-2">
                            <Form.Group className="" controlId="send-hours">
                                <Form.Label>Hours</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={sensorObject.sendInterval.hours}
                                    min={0}
                                    max={48}
                                    onChange={(e) => setSensorObject({
                                        ...sensorObject,
                                        sendInterval: { ...sensorObject.sendInterval, hours: Number(e.target.value) }
                                    })}
                                />
                            </Form.Group>

                            <Form.Group className="" controlId="send-minutes">
                                <Form.Label>Minuts</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={sensorObject.sendInterval.minutes}
                                    min={0}
                                    max={59}
                                    onChange={(e) => setSensorObject({
                                        ...sensorObject,
                                        sendInterval: { ...sensorObject.sendInterval, minutes: Number(e.target.value) }
                                    })}
                                />
                            </Form.Group>

                            <Form.Group className="" controlId="send-seconds">
                                <Form.Label>Seconds</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={sensorObject.sendInterval.seconds}
                                    min={0}
                                    max={59}
                                    onChange={(e) => setSensorObject({
                                        ...sensorObject,
                                        sendInterval: { ...sensorObject.sendInterval, seconds: Number(e.target.value) }
                                    })}
                                />

                            </Form.Group>
                        </div>
                    </Col>

                    <Col className="">
                        <div className="mb-2">
                            <b>Measuring Interval</b>
                        </div>
                        <div className="d-flex flex-row gap-2 ">
                            <Form.Group className="" controlId="measure-hours">
                                <Form.Label>Hours</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={sensorObject.measureInterval.hours}
                                    max={24}
                                    onChange={(e) => setSensorObject({
                                        ...sensorObject,
                                        measureInterval: { ...sensorObject.measureInterval, hours: Number(e.target.value) }
                                    })}
                                />
                            </Form.Group>


                            <Form.Group className="" controlId="measure-minutes">
                                <Form.Label>Minutes</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={sensorObject.measureInterval.minutes}
                                    max={59}
                                    onChange={(e) => setSensorObject({
                                        ...sensorObject,
                                        measureInterval: { ...sensorObject.measureInterval, minutes: Number(e.target.value) }
                                    })}
                                />
                            </Form.Group>

                            <Form.Group className="" controlId="measure-seconds">
                                <Form.Label>Seconds</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={sensorObject.measureInterval.seconds}
                                    max={59}
                                    onChange={(e) => setSensorObject({
                                        ...sensorObject,
                                        measureInterval: { ...sensorObject.measureInterval, seconds: Number(e.target.value) }
                                    })}
                                />
                            </Form.Group>
                        </div>
                    </Col>
                </Row>

            </Form>

            {
                alerts.map((alert, index) => (
                    <Alert key={index} variant="danger" className="mt-2">
                        {alert}
                    </Alert>
                ))
            }
        </DefaultModal >

    );
}

export default SensorAddUpdateModal;