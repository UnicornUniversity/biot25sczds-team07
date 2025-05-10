import React, { useEffect, useState } from 'react';
import { Form, Button, Row, Col, Container, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';

import { useLoggedUserContext } from '../../customHooks/useLoggedUserContext';
import userRequests, { Policy, User } from '../../../API/requests/userRequests';

import { emailRegex } from '../../helpers';

const UserProfile = () => {
    const { userId } = useParams();
    const navigate = useNavigate();

    const { userData, setUserData } = useLoggedUserContext();

    const [isLoading, setIsLoading] = useState(false);
    const [alerts, setAlerts] = useState<{ variant: string, message: string }[]>([]);

    const [editedUser, setEditedUser] = useState<User | null>(userData);

    const formValid = {
        firstName: editedUser && editedUser.firstName.length > 3,
        lastName: editedUser && editedUser.lastName.length > 3,
        email: editedUser && emailRegex.test(editedUser.email ?? ""),
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation()

        if (!editedUser) { return; }
        if (!formValid.firstName) {
            setAlerts([
                ...alerts, {
                    variant: "warning",
                    message: "User First Name must be longer than 3 characters."
                }
            ]);
            return;
        }
        if (!formValid.lastName) {
            setAlerts([
                ...alerts, {
                    variant: "warning",
                    message: "User Last Name must be longer than 3 characters."
                }
            ]);
            return;
        }
        if (!formValid.email) {
            setAlerts([
                ...alerts, {
                    variant: "warning",
                    message: "Email must be in a valid format."
                }
            ]);
            return;
        }
        try {
            setIsLoading(true);
            const result = await userRequests.updateUser({
                _id: editedUser._id,
                firstName: editedUser.firstName,
                lastName: editedUser.lastName,
                email: editedUser.email,
            });
            if (!result || !result._id) {
                throw new Error("createOrganisation - addOrganisations - failed");
            }

            setAlerts([
                ...alerts, {
                    variant: "success",
                    message: "User updated successfully."
                }
            ]);
            setUserData(result);
        } catch (err) {
            console.error("Error updating organisation: ", err);
            setAlerts([
                ...alerts, {
                    variant: "danger",
                    message: "User update failed, try it again please."
                }
            ]);
        }
        finally { setIsLoading(false); }
    };

    useEffect(() => {
        if (typeof userId !== "string") { return; }
        // setEditedUser(users.find((user) => user.id === userId) ?? null)
    }, [userId]);

    return (
        <Container className=''>
            <h1 className='my-3'>User Profile</h1>
            {!editedUser
                ? (
                    <>
                        <Alert>User with this ID doesn't exists </Alert>
                        <Button onClick={() => navigate("/")}>Go back to Dashboard</Button>
                    </>
                )
                : (
                    <Form onSubmit={handleSubmit}>
                        <Row className="mb-3">
                            <Col>
                                <Form.Group as={Col} controlId="firstName">
                                    <Form.Label>First Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="name"
                                        value={editedUser.firstName}
                                        minLength={3}
                                        maxLength={60}
                                        onChange={(e) => setEditedUser({ ...editedUser, firstName: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group as={Col} controlId="lastName">
                                    <Form.Label>Last Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="name"
                                        value={editedUser.lastName}
                                        minLength={3}
                                        maxLength={60}
                                        onChange={(e) => setEditedUser({ ...editedUser, lastName: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row className="mb-3">
                            <Col>
                                <Form.Group as={Col} controlId="email">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="name"
                                        value={editedUser.email}
                                        minLength={3}
                                        maxLength={60}
                                        onChange={(e) => setEditedUser({ ...editedUser, firstName: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col sm={4}>
                                {(
                                    <Form.Group controlId="formRole" className="mb-3">
                                        <Form.Label>Role</Form.Label>
                                        <Form.Select
                                            disabled={!userData || userData.role !== Policy.Admin || userData?._id === editedUser._id}
                                            name="role"
                                            value={editedUser.role}
                                            onChange={(e) => {
                                                const value = Number(e.target.value);
                                                setEditedUser({ ...editedUser, role: value === Policy.Admin ? Policy.Admin : Policy.Member });
                                            }}
                                        >
                                            <option value={Policy.Admin}>Admin</option>
                                            <option value={Policy.Member}>Member</option>
                                        </Form.Select>
                                    </Form.Group>
                                )}
                            </Col>
                            <Col sm={4}>
                            </Col>
                            <Col sm={4} className='d-flex align-items-end justify-content-end'>
                                <Button variant="primary" type="submit">
                                    {isLoading && (
                                        <Spinner
                                            as="span"
                                            className='me-2'
                                            animation="border"
                                            size="sm"
                                            role="status"
                                            aria-hidden="true"
                                        />
                                    )}
                                    Save
                                </Button>
                            </Col>
                        </Row>


                    </Form>
                )
            }
            {alerts.length > 0 && (
                <div className="mt-3">
                    {alerts.map((alert, index) => (
                        <Alert key={index} variant={alert.variant} dismissible>
                            {alert.message}
                        </Alert>
                    ))}
                </div>
            )}
        </Container>
    );
};

export default UserProfile;