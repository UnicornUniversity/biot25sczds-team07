import { useState } from "react";
import organisationRequests, { Organisation } from "../../../../API/requests/organisationRequests";
import DefaultModal from "../../../components/modals/DefaultModal";
import { useOrganisationContext } from "../../../customHooks/useOrganisationsContext";
import { Alert, Col, Form, Row } from "react-bootstrap";
import { DashboardModalVersion } from "../Dashboard";

interface Props {
    modalVersion: 'update-organisation',
    setModalVersion: React.Dispatch<React.SetStateAction<DashboardModalVersion>>,
    editedOrganisation: Organisation,
}

const OrganisationUpdateModal = (props: Props) => {
    const {
        modalVersion, setModalVersion,
        editedOrganisation
    } = props;

    const { updateOrganisation, selectOrganisation } = useOrganisationContext();

    const [isLoading, setIsLoading] = useState(false);
    const [alerts, setAlerts] = useState<string[]>([]);

    const [edittingOrganisation, setNewOrganisation] = useState(editedOrganisation);

    const updateOrganisationHandler = async () => {
        if (!edittingOrganisation.name || edittingOrganisation.name.length < 3) {
            console.error("handleSubmitNewProject - edittingOrganisation is null: ", edittingOrganisation);
            setAlerts([...alerts, "Organisation name must be longer than 3 characters"]);
            return;
        }
        try {
            setIsLoading(true);
            const result = await organisationRequests.updateOrganisation({
                id: edittingOrganisation._id,
                name: edittingOrganisation.name,
                description: edittingOrganisation.description,
            });
            if (!result || !result._id) {
                throw new Error("createOrganisation - addOrganisations - failed");
            }
            updateOrganisation(result);
            selectOrganisation(result);
            setModalVersion("");
        } catch (err) {
            console.error("Error updating organisation: ", err);
            setAlerts(["Error updating organisation. Please try again."])
        }
        finally { setIsLoading(false); }
    }

    return (
        <DefaultModal
            title="Upravit organizaci"
            show={modalVersion === "update-organisation"}
            submitText="Uložit změny"
            submitButtonColor="warning"
            onSubmit={updateOrganisationHandler}
            isLoading={isLoading}
            onHide={() => setModalVersion("")}
        >
            <Form>
                <Form.Group as={Row}>
                    <Form.Label column sm={4}>
                        Name
                    </Form.Label>
                    <Col sm={8}>
                        <Form.Control
                            type="text"
                            placeholder="Name..."
                            minLength={3}
                            maxLength={60}
                            value={edittingOrganisation.name}
                            onChange={(e) => setNewOrganisation({ ...edittingOrganisation, name: e.target.value })}
                        />
                    </Col>
                </Form.Group>

                <Form.Group as={Row} className="mt-4">
                    <Form.Label column sm={4}>
                        Description
                    </Form.Label>
                    <Col sm={8}>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="Description (optional)..."
                            value={edittingOrganisation.description}
                            onChange={(e) => setNewOrganisation({ ...edittingOrganisation, description: e.target.value })}
                        />
                    </Col>
                </Form.Group>
            </Form>

            {alerts.length > 0 && (
                <div className="mt-3">
                    {alerts.map((alert, index) => (
                        <Alert key={index} variant="danger" dismissible>
                            {alert}
                        </Alert>
                    ))}
                </div>
            )}
        </DefaultModal>
    );
}

export default OrganisationUpdateModal;