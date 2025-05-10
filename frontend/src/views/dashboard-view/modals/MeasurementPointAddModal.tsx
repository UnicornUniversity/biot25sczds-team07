import { useState } from "react";
import { Alert, Form } from "react-bootstrap";

import measurementPointsRequests, { AddMeasurementPointDtoIn, MeasurementPoint } from "../../../../API/requests/measurementPointsRequests";

import DefaultModal from "../../../components/modals/DefaultModal";
import { DashboardModalVersion } from "../Dashboard";

interface Props {
    modalVersion: 'add-measurement-point',
    setModalVersion: React.Dispatch<React.SetStateAction<DashboardModalVersion>>,
    acknowladgeAddedMeasurementPoint: (mp: MeasurementPoint) => void,

    selectedOrganisationId: string,
}

const MeasurementPointAddModal = (props: Props) => {
    const {
        modalVersion, setModalVersion,
        acknowladgeAddedMeasurementPoint,
        selectedOrganisationId
    } = props;

    const [isLoading, setIsLoading] = useState(false);
    const [alerts, setAlerts] = useState<string[]>([]);

    // const [validated, setValidated] = useState(false);
    const [newMeasurementPoint, setNewMeasurementPoint] = useState<AddMeasurementPointDtoIn>({
        organisationId: selectedOrganisationId,
        name: "",
        description: "",
    });

    const addMeasurementPointHandler = async () => {
        try {
            setIsLoading(true);
            if (!newMeasurementPoint.name || newMeasurementPoint.name.length < 3) {
                setAlerts(["Measurement point name must be at least 3 characters long."]);
                return;
            }

            const result = await measurementPointsRequests.addMeasurementPoint(newMeasurementPoint);
            if (result._id) {
                acknowladgeAddedMeasurementPoint(result);
                setModalVersion("");
                return;
            }
            setAlerts(["Error adding measurement point. Please try again."]);
        }
        catch (error) {
            console.error("Error measurement point: ", error);
            setAlerts(["Error measurement point. Please try again."]);
        }
        finally { setIsLoading(false); }
    }


    return (
        <DefaultModal
            title="Create Measurement Point"
            show={modalVersion === "add-measurement-point"}
            submitText="Create"
            submitButtonColor="warning"
            onSubmit={() => void addMeasurementPointHandler()}
            isLoading={isLoading}
            onHide={() => setModalVersion("")}
        >
            <Form>
                <Form.Group className="mb-3" controlId="name">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enter name"
                        isInvalid
                        minLength={3}
                        maxLength={50}
                        onChange={(e) => setNewMeasurementPoint({ ...newMeasurementPoint, name: e.target.value ?? "" })}
                    />
                </Form.Group>
                <Form.Group className="mb-3" controlId="description">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enter description (optional)"
                        maxLength={500}
                        onChange={(e) => setNewMeasurementPoint({ ...newMeasurementPoint, description: e.target.value ?? "" })}
                    />
                </Form.Group>
            </Form>


            {alerts.map((alert, index) => (
                <Alert key={index} variant="danger" className="mt-2">
                    {alert}
                </Alert>
            ))}
        </DefaultModal>
    );
}

export default MeasurementPointAddModal;