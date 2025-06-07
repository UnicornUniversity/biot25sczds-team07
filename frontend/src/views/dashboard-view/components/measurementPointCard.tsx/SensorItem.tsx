import { memo } from "react";
import { Sensor } from "../../../../../API/requests/measurementPointsRequests";
import { Badge, Button, Col, Row } from "react-bootstrap";
import Tooltip from "../../../../components/Tooltip/Tooltip";
import { MeasurementPointCardModalVersion } from "./MeasurementPointCard";

interface Props {
    sensor: Sensor,
    setModalVersion: React.Dispatch<React.SetStateAction<MeasurementPointCardModalVersion>>,
    setEditedSensor: React.Dispatch<React.SetStateAction<Sensor | null>>,
}
const SensorItem = (props: Props) => {
    const {
        sensor, setEditedSensor,
        setModalVersion
    } = props;

    return (
        <Row className="p-2 rounded-2 border border-1">
            <Col sm={4} lg={3} className="d-flex align-items-center">
                <Badge
                    bg={sensor.quantity === "temperature" ? "danger" : "warning"}
                    className="text-uppercase me-3">
                    <i className={`bi bi-${sensor.quantity === "temperature" ? "thermometer" : "arrows-move"}`} />
                    {sensor.quantity}
                </Badge>
                <b> {sensor.name}</b>
            </Col>
            <Col lg={4} className="d-flex flex-row gap-3 justify-content-end align-items-center">
                <div>
                    <Tooltip
                        tooltipText="Send Data Interval (seconds)"
                    >
                        <Badge bg="primary">
                            <i className="bi bi-send me-2" />
                            {sensor.config.sendInterval} seconds
                        </Badge>
                    </Tooltip>

                    <Tooltip
                        tooltipText="Measure Data Interval (seconds)"
                    >
                        <Badge bg="primary">
                            <i className="bi bi-activity me-2" />
                            {sensor.config.measureInterval} seconds
                        </Badge>
                    </Tooltip>
                </div>

                <div>
                    <Badge bg="danger" className="">
                        <i className="bi bi-thermometer-sun me-2" /> When temp below: {sensor.config.temperatureLimits.heating}  °C
                    </Badge>

                    <Badge bg="info" className="">
                        <i className="bi bi-snow me-2" />  When temp above: {sensor.config.temperatureLimits.cooling} °C
                    </Badge>
                </div>
            </Col>

            <Col lg={5} className="d-flex gap-3 flex-row justify-content-end align-items-center">
                <Button
                    variant="warning"
                    onClick={() => {
                        setModalVersion('update-sensor');
                        setEditedSensor(sensor);
                    }}
                >
                    <i className="bi bi-pencil-fill" />
                    <span className="ms-1">Edit</span>
                </Button>
                <Button
                    variant="danger"
                    onClick={() => {
                        setModalVersion('delete-sensor');
                        setEditedSensor(sensor);
                    }}
                >
                    <i className="bi bi-trash" />
                    <span className="ms-1">Delete</span>
                </Button>
            </Col>
        </Row>
    );

}

export default memo(SensorItem);