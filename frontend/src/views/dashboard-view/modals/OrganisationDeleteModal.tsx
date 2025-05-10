import { useState } from "react";
import organisationRequests, { Organisation } from "../../../../API/requests/organisationRequests";
import DefaultModal from "../../../components/modals/DefaultModal";
import { useOrganisationContext } from "../../../customHooks/useOrganisationsContext";
import { Alert } from "react-bootstrap";
import { DashboardModalVersion } from "../Dashboard";

interface Props {
    modalVersion: 'delete-organisation',
    setModalVersion: React.Dispatch<React.SetStateAction<DashboardModalVersion>>,
    editedOrganisation: Organisation,
}
const OrganisationDeleteModal = (props: Props) => {
    const {
        modalVersion, setModalVersion,
        editedOrganisation
    } = props;

    const { deleteOrganisation, selectOrganisation } = useOrganisationContext();

    const [isLoading, setIsLoading] = useState(false);
    const [alerts, setAlerts] = useState<string[]>([]);

    const deleteOrganisationHandler = async () => {
        try {
            setIsLoading(true);
            const result = await organisationRequests.deleteOrganisation(editedOrganisation._id);
            if (result) {
                selectOrganisation(null);
                deleteOrganisation(editedOrganisation._id);
                setModalVersion("");
                return;
            }
            setAlerts(["Error deleting organisation. Please try again."]);
        }
        catch (error) {
            console.error("Error deleting organisation: ", error);
            setAlerts(["Error deleting organisation. Please try again."]);
        }
        finally { setIsLoading(false); }
    }


    return (
        <DefaultModal
            title="Delete Organisation"
            show={modalVersion === "delete-organisation"}
            submitText="Delete Organisation"
            submitButtonColor="danger"
            onSubmit={deleteOrganisationHandler}
            isLoading={isLoading}
            onHide={() => setModalVersion("")}
        >
            <p>Are you sure that you want to delete organisation: <b>{editedOrganisation.name}</b></p>
            <p>
                <b>This will also delete all it's measurement points</b>, therefore your data will become unreachable. <br />
                This action cannot be undone.
            </p>

            {alerts.map((alert, index) => (
                <Alert key={index} variant="danger" className="mt-2" dismissible>
                    {alert}
                </Alert>
            ))}
        </DefaultModal>
    );
}

export default OrganisationDeleteModal;