import React, { useEffect, useState } from 'react';
import { Form, Button, Row, Col, Container, Alert } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import {User} from "../../models/UserModel"
import { useLoggedUserContext } from '../../customHooks/useLoggedUserContext';

const UserProfile = () => {
    const { userId } = useParams();
    const navigate = useNavigate();

    const { userData } = useLoggedUserContext();
    const [editedUser, setEditedUser] = useState<User | null>(userData);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Implement the save logic here, e.g., sending the updated user data to the server
        console.log('User data saved:', editedUser);
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
                            <Form.Group as={Col} controlId="formName">
                                <Form.Label>Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="name"
                                    value={editedUser.name}
                                    onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                                />
                            </Form.Group>
                            <Form.Group as={Col} controlId="formSurname">
                                <Form.Label>Surname</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="surname"
                                    value={editedUser.surname}
                                    onChange={(e) => setEditedUser({ ...editedUser, surname: e.target.value })}
                                />
                            </Form.Group>
                            <Form.Group as={Col} controlId="formUsername">
                                <Form.Label>Username</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="username"
                                    value={editedUser.username}
                                    onChange={(e) => setEditedUser({ ...editedUser, username: e.target.value })}
                                />
                            </Form.Group>
                        </Row>
                        {/* <Form.Group controlId="formPassword" className="mb-3">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                name="password"
                                value={editedUser.password}
                                onChange={handleChange}
                            />
                        </Form.Group> */}
                        {/* TODO - if currentLogedUser role === "ADMIN" */}
                        <Row>
                            <Col sm={4}>
                                { (
                                    <Form.Group controlId="formRole" className="mb-3">
                                        <Form.Label>Role</Form.Label>
                                        <Form.Select
                                            disabled={userData?._id === editedUser._id}
                                            name="role"
                                            value={editedUser.role}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value === "ADMIN" || value === "MEMBER") {
                                                    setEditedUser({ ...editedUser, role: value });
                                                }
                                            }}
                                        >
                                            <option value="ADMIN">Admin</option>
                                            <option value="MEMBER">Member</option>
                                        </Form.Select>
                                    </Form.Group>
                                )}
                            </Col>
                            <Col sm={4}>
                            </Col>
                            <Col sm={4} className='d-flex align-items-end justify-content-end'>
                                <Button variant="primary" type="submit">
                                    Save
                                </Button>
                            </Col>
                        </Row>


                    </Form>
                )
            }
        </Container>
    );
};

export default UserProfile;