import { useState } from "react";
import { Alert } from "react-bootstrap";

import DefaultModal from "../../../components/modals/DefaultModal";
import { DashboardModalVersion } from "../Dashboard";
import measurementPointsRequests, { MeasurementPoint } from "../../../../API/requests/measurementPointsRequests";

interface Props {
    modalVersion: 'delete-measurement-point',
    setModalVersion: React.Dispatch<React.SetStateAction<DashboardModalVersion>>,
    editedMeasurementPoint: MeasurementPoint,
    acknowladgeDeletedMeasurementPoint: (mpId: string) => void,
}
const MeasurementPointDeleteModal = (props: Props) => {
    const {
        modalVersion, setModalVersion,
        editedMeasurementPoint,
        acknowladgeDeletedMeasurementPoint
    } = props;

    const [isLoading, setIsLoading] = useState(false);
    const [alerts, setAlerts] = useState<string[]>([]);

    const deleteMeasurementPointHandler = async () => {
        try {
            setIsLoading(true);
            const result = await measurementPointsRequests.deleteMeasurementPoint({
                id: editedMeasurementPoint._id,
                organisationId: editedMeasurementPoint.organisationId,
            });
            if (result) {
                acknowladgeDeletedMeasurementPoint(editedMeasurementPoint._id);
                setModalVersion("");
                return;
            }
            setAlerts(["Error deleting Measurement Point. Please try again."]);
        }
        catch (error) {
            console.error("Error Measurement Point: ", error);
            setAlerts(["ErrorMeasurement Point. Please try again."]);
        }
        finally { setIsLoading(false); }
    }


    return (
        <DefaultModal
            title="Delete Measurement Point"
            show={modalVersion === "delete-measurement-point"}
            submitText="Delete"
            submitButtonColor="danger"
            onSubmit={deleteMeasurementPointHandler}
            isLoading={isLoading}
            onHide={() => setModalVersion("")}
        >
            <p>Are you sure that you want to delete Measurement Point: <b>{editedMeasurementPoint.name}</b></p>
            <p>
                <b>This will also delete all data collected under this measurement point</b>, therefore your data they will become unreachable. <br />
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

export default MeasurementPointDeleteModal;