import { Dispatch, useState } from "react";
import { Alert, Col, Form, Row } from "react-bootstrap";

import DefaultModal from "../../../components/modals/DefaultModal";

import { useOrganisationContext } from "../../../customHooks/useOrganisationsContext";
import organisationRequests, { AddOrganisationDtoIn } from "../../../../API/requests/organisationRequests";

interface Props {
    modalVersion: 'create-organisation',
    setModalVersion: Dispatch<string>,
}

const CreateOrganisation = (props: Props) => {
    const { modalVersion, setModalVersion } = props;

    const { addOrganisations } = useOrganisationContext();

    const [isLoading, setIsLoading] = useState(false);
    const [alerts, setAlerts] = useState<string[]>([]);
    const [newOrganisation, setNewOrganisation] = useState<AddOrganisationDtoIn>({
        name: "",
        description: "",
    });

    const handleSubmitNewOrganisation = async () => {
        if (!newOrganisation.name || newOrganisation.name.length < 3) {
            console.error("handleSubmitNewProject - newOrganisation is null: ", newOrganisation);
            setAlerts([...alerts, "Organisation name must be longer than 3 characters"]);
            return;
        }
        try {
            setIsLoading(true);
            const result = await organisationRequests.addOrganisation(newOrganisation);
            if (!result || !result._id) {
                throw new Error("createOrganisation - addOrganisations - failed");
            }
            addOrganisations([result]); // TODO insert new organisation into the list
            setModalVersion("");
        } catch (err) {
            console.error("handleSubmitNewProject - error: ", err);
            setAlerts([...alerts, "Failed to create new Organisation"]);
        }
        finally { setIsLoading(false); }
    }


    if (modalVersion !== 'create-organisation') { return null; }
    return (
        <DefaultModal
            show={modalVersion === "create-organisation"}
            onHide={() => setModalVersion('')}
            onSubmit={handleSubmitNewOrganisation}
            submitText="Create Organisation"
            title={"Create Organisation"}
            isLoading={isLoading}
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
                            value={newOrganisation.name}
                            onChange={(e) => setNewOrganisation({ ...newOrganisation, name: e.target.value })}
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
                            value={newOrganisation.description}
                            onChange={(e) => setNewOrganisation({ ...newOrganisation, description: e.target.value })}
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

export default CreateOrganisation;