import { useState } from "react";
import { Alert } from "react-bootstrap";

import sensorRequests from "../../../../../../API/requests/sensorsRequests";
import { Sensor } from "../../../../../../API/requests/measurementPointsRequests";
import DefaultModal from "../../../../../components/modals/DefaultModal";
import { MeasurementPointCardModalVersion } from "../MeasurementPointCard";



interface Props {
    modalVersion: 'delete-sensor',
    setModalVersion: React.Dispatch<React.SetStateAction<MeasurementPointCardModalVersion>>,
    acknowladgeDeletedSensor: (sensorId: string) => void,
    sensor: Sensor,
    mpId: string;
}
const SensorDeleteModal = (props: Props) => {
    const {
        modalVersion, setModalVersion,
        acknowladgeDeletedSensor,
        sensor,
        mpId,
    } = props;

    const [isLoading, setIsLoading] = useState(false);
    const [alerts, setAlerts] = useState<string[]>([]);

    const deleteSensorHandler = async () => {
        setIsLoading(true);
        try {
            const result = await sensorRequests.deleteSensor({
                measurementPointId: mpId,
                sensorId: sensor.sensorId,
            });
            if (result) {
                setModalVersion("");
                setAlerts([]);
                acknowladgeDeletedSensor(sensor.sensorId);
                return;
            }
            setAlerts(["Error deleting sensor. Please try again."]);
        }
        catch (error) {
            console.error("Error deleting sensor: ", error);
            setAlerts(["Error deleting sensor. Please try again."]);
        }
        finally {
            setIsLoading(false);
        }
    }

    return (
        <DefaultModal
            title="Delete Sensor"
            show={modalVersion === "delete-sensor"}
            submitText="Delete"
            submitButtonColor="danger"
            onSubmit={() => void deleteSensorHandler()}
            isLoading={isLoading}
            onHide={() => setModalVersion("")}
        >

            <p>Are you sure that you want to delete Sensor: <b>{sensor.name}</b></p>
            <p>
                <b> Data measured under this sensorId wont be saved to the cloud anymore.</b>
                <br />
                This action cannot be undone.
            </p>

            {alerts.map((alert, index) => (
                <Alert key={index} variant="danger" className="mt-2">
                    {alert}
                </Alert>
            ))}
        </DefaultModal>

    );
}

export default SensorDeleteModal;