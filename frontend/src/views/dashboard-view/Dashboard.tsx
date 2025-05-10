import { useEffect, useState } from "react";
import { Alert, Button, Col, Container, Row, Spinner } from "react-bootstrap";

import { Organisation } from "../../../API/requests/organisationRequests";
import measurementPointsRequests, { MeasurementPoint } from "../../../API/requests/measurementPointsRequests";
import { useOrganisationContext } from "../../customHooks/useOrganisationsContext";

import OrganisationDeleteModal from "./modals/OrganisationDeleteModal";
import OrganisationUpdateModal from "./modals/OrganisationUpdateModal";
import MeasurementPointAddModal from "./modals/MeasurementPointAddModal";
import MeasurementPointDeleteModal from "./modals/MeasurementPointDeleteModal";
import MeasurementPointUpdateModal from "./modals/MeasurementPointUpdateModal";

import MeasurementPointCard from "./components/measurementPointCard.tsx/MeasurementPointCard";

export type DashboardModalVersion = 'update-organisation' | 'delete-organisation' | 'add-measurement-point' | 'update-measurement-point' | 'delete-measurement-point' | '';

const Dashboard = () => {
    const { selectedOrganisation } = useOrganisationContext();

    const [isLoading, setIsLoading] = useState(false);
    const [modalVersion, setModalVersion] = useState<DashboardModalVersion>('');
    const [alerts, setAlerts] = useState<{ type: string, message: string }[]>([]);

    const [measurementPoints, setMeasurementPoints] = useState<MeasurementPoint[]>([]);
    const [editedMeasurementPoint, setEditedMeasurementPoint] = useState<MeasurementPoint | null>(null);

    const acknowladgeAddedMeasurementPoint = (measurementPoint: MeasurementPoint) => {
        setMeasurementPoints([...measurementPoints, measurementPoint]);
    }
    const acknowladgeUpdatedMeasurementPoint = (measurementPoint: MeasurementPoint) => {
        setMeasurementPoints((prevMeasurementPoints) => {
            const index = prevMeasurementPoints.findIndex((mp) => mp._id === measurementPoint._id);
            if (index === -1) { return prevMeasurementPoints; }
            const newMeasurementPoints = [...prevMeasurementPoints];
            newMeasurementPoints[index] = measurementPoint;
            return newMeasurementPoints;
        });
    }
    const acknowladgeDeletedMeasurementPoint = (measurementPointId: string) => {
        setMeasurementPoints((prevMeasurementPoints) => {
            const index = prevMeasurementPoints.findIndex((mp) => mp._id === measurementPointId);
            if (index === -1) { return prevMeasurementPoints; }
            const newMeasurementPoints = [...prevMeasurementPoints];
            newMeasurementPoints.splice(index, 1);
            return newMeasurementPoints;
        });
    }


    useEffect(() => {
        const fetchMeasurementPoints = async (selectedOrganisation: Organisation) => {
            try {
                setIsLoading(true);
                const response = await measurementPointsRequests.listMeasurementPoints({
                    organisationId: selectedOrganisation._id,
                    pageInfo: {
                        pageIndex: 0,
                        pageSize: 100,
                    },
                })
                setMeasurementPoints(response.measurementPoints);
            } catch (err) {
                console.error("Error fetching measurement points:", err);
                setAlerts((prevAlerts) => [
                    ...prevAlerts,
                    { type: 'danger', message: 'Error fetching measurement points' }
                ]);
            }
            finally { setIsLoading(false); }
        }

        if (!selectedOrganisation) {
            setMeasurementPoints([]);
            return;
        }
        fetchMeasurementPoints(selectedOrganisation);
    }, [selectedOrganisation]);

    if (!selectedOrganisation) {
        return (
            <Container className="mt-4">
                <h1>Dashboard</h1>
                <Alert variant="warning"> <b>Please select an organisation</b> to view the dashboard.</Alert>
            </Container>
        );
    }

    return (
        <>
            {/* ORGANISATION MODALS */}
            {modalVersion === 'update-organisation' && (
                <OrganisationUpdateModal
                    modalVersion={modalVersion}
                    setModalVersion={setModalVersion}
                    editedOrganisation={selectedOrganisation}
                />
            )}
            {modalVersion === 'delete-organisation' && (
                <OrganisationDeleteModal
                    modalVersion={modalVersion}
                    setModalVersion={setModalVersion}
                    editedOrganisation={selectedOrganisation}
                />
            )}

            {/* MEASUREMENT POINT MODALS */}
            {modalVersion == 'add-measurement-point' && (
                <MeasurementPointAddModal
                    modalVersion={modalVersion}
                    setModalVersion={setModalVersion}
                    acknowladgeAddedMeasurementPoint={acknowladgeAddedMeasurementPoint}
                    selectedOrganisationId={selectedOrganisation._id}
                />
            )}
            {(modalVersion === 'update-measurement-point' && editedMeasurementPoint) && (
                <MeasurementPointUpdateModal
                    modalVersion={modalVersion}
                    setModalVersion={setModalVersion}
                    editedMeasurementPoint={editedMeasurementPoint}
                    acknowladgeUpdatedMeasurementPoint={acknowladgeUpdatedMeasurementPoint}
                />
            )}
            {(modalVersion === 'delete-measurement-point' && editedMeasurementPoint) && (
                <MeasurementPointDeleteModal
                    modalVersion={modalVersion}
                    setModalVersion={setModalVersion}
                    editedMeasurementPoint={editedMeasurementPoint}
                    acknowladgeDeletedMeasurementPoint={acknowladgeDeletedMeasurementPoint}
                />
            )}

            <Container className="mt-4">
                <Row>
                    <Col sm={10}>
                        <h1>{selectedOrganisation.name}</h1>
                        <p className="text-muted">Organisation ID: {selectedOrganisation._id}</p>
                        <p>{selectedOrganisation.description}</p>
                    </Col>
                    <Col sm={2} className="d-flex justify-content-end gap-2 align-items-start">
                        <Button
                            variant="warning"
                            onClick={() => setModalVersion('update-organisation')}
                        >
                            <i className="bi bi-pencil-fill" />
                            <span className="ms-1">Edit</span>
                        </Button>
                        <Button
                            variant="danger"
                            onClick={() => setModalVersion('delete-organisation')}
                        >
                            <i className="bi bi-trash" />
                            <span className="ms-1">Delete</span>
                        </Button>
                    </Col>
                </Row>

                {alerts.length > 0 && (
                    <Row className="mt-4">
                        <Col sm={12}>
                            {alerts.map((alert, index) => (
                                <Alert
                                    key={index}
                                    variant={alert.type}
                                    dismissible
                                >
                                    {alert.message}
                                </Alert>
                            ))}
                        </Col>
                    </Row>
                )}

                <Row className="mt-4">
                    <Col sm={9}>
                        <h2>Measurement Points</h2>
                        {isLoading && (
                            <Spinner animation="border" variant="primary" />
                        )}
                    </Col>
                    <Col sm={3} className="d-flex justify-content-end align-items-start">
                        <Button
                            variant="success"
                            onClick={() => setModalVersion('add-measurement-point')}
                        >
                            <i className="bi bi-plus" />
                            <span className="ms-1">Add Measurement Point</span>
                        </Button>
                    </Col>

                    <Col sm={12} className="d-flex flex-column gap-3">
                        {measurementPoints.map((measurementPoint) => (
                            <MeasurementPointCard
                                key={measurementPoint._id}
                                measurementPoint={measurementPoint}
                                setModalVersion={setModalVersion}
                                setEditedMeasurementPoint={setEditedMeasurementPoint}
                            />
                        ))}
                    </Col>
                </Row>

            </Container >
        </>
    );
}

export default Dashboard;