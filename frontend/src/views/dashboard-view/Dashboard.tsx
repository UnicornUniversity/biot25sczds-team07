import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge, Button, Col, Container, Row, Spinner, Table } from "react-bootstrap";
import dayjs from "dayjs";
import organisationRequests, { Organisation } from "../../../API/requests/organisationRequests";
import OrganisationCard from "./components/organisationCard/OrganisationCard";

export type DashboardModalVersion = 'create-organisation' | '';

const Dashboard = () => {
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(false);
    const [modalVersion, setModalVersion] = useState<DashboardModalVersion>('');

    const [organisations, setOrganisations] = useState<Organisation[]>([]);

    useEffect(() => {
        const fetchOrganisations = async () => {
            setIsLoading(true);
            try {
                const result = await organisationRequests.listOrganisation({
                    pageInfo: {
                        pageIndex: 0,
                        pageSize: 30,
                    },
                    order: "desc",
                });
                setOrganisations(result.organisations);
            }
            catch (err) {
                console.error("fetchOrganisations - error: ", err);
            }
            finally { setIsLoading(false); }
        };

        fetchOrganisations();
    }, []);

    return (
        <>
            {/* {(modalVersion === "create-sprint" && selectedProject) && (
                <CreateSprintModal
                    projectId={selectedProject._id}
                    modalVersion={modalVersion}
                    setModalVersion={setModalVersion}
                    addNewSprint={addNewSprint}
                />
            )} */}

            <Container className="mt-4">
                <h1>DASHBOARD</h1>

                {organisations.map((organisation) => (
                    <OrganisationCard
                        key={organisation._id}
                        organisation={organisation}
                    />
                ))}
            </Container>
        </>
    );
}

export default Dashboard;