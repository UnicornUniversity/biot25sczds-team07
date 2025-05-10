import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Button, Card, Col, Form, Row } from "react-bootstrap";

import { useLoggedUserContext } from "../src/customHooks/useLoggedUserContext";
import userRequests, { RegisterUserDtoIn } from "../API/requests/userRequests";
import { emailRegex } from "../src/helpers"


const Register = () => {
    const navigate = useNavigate();
    const { userData } = useLoggedUserContext();

    const [alerts, setAlerts] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const [validated, setValidated] = useState(false);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");


    // 8 characters long, 1 upperCase, 1 lowerCase, 1 digit, 1 special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    const formValid = {
        firstName: firstName.length > 3,
        lastName: lastName.length > 3,
        email: emailRegex.test(email),
        password: passwordRegex.test(password)
    }



    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation()
        setValidated(true);

        if (!Object.values(formValid).every((valid) => !!valid)) {
            console.log("formValid: ", formValid);
            return; // invalid form
        }
        try {
            setIsLoading(true);
            const addUserBody: RegisterUserDtoIn = {
                firstName,
                lastName,
                email,
                password,
                role: 1
            }

            const result = await userRequests.registerUser(addUserBody);
            if (!result._id) { throw new Error("Failed to register user"); }
            navigate("/")
        } catch (err) {
            console.error("handleSubmit - error: ", err);
            setAlerts([...alerts, "Failed to Register new User"]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-light flex-column">
            <Card style={{ width: "500px" }}>
                <Card.Header className="d-flex flex-row justify-content-between align-items-center mb-4 p-4">
                    <h2>Register Account</h2>
                    {/* Company Logo at the top */}
                    <img
                        src="./smart-terrarium-logo.png" // Place your logo file in 'public/logo.png' or update the path as needed
                        alt="Company Logo"
                        style={{
                            width: "120px",
                            borderRadius: "12px",
                            boxShadow: "0 2px 12px rgba(0,0,0,0.08)"
                        }}
                    />
                </Card.Header>
                <Card.Body>
                    <Form onSubmit={handleSubmit}>
                        <Row className="mb-2">
                            <Col>
                                <Form.Label htmlFor="inputFirstName">First Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    id="inputFirstName"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    minLength={3}
                                    isInvalid={validated && !formValid.firstName}
                                />
                            </Col>
                            <Col>
                                <Form.Label htmlFor="inputLastName">Last Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    id="inputLastName"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    minLength={3}
                                    isInvalid={validated && !formValid.lastName}
                                />
                            </Col>
                        </Row>

                        <Row className="mb-2">
                            <Col>
                                <Form.Label htmlFor="inputEmail">Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    id="inputEmail"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    isInvalid={validated && !formValid.email}
                                />
                            </Col>
                            <Col></Col>
                        </Row>

                        <Row className="mb-2">
                            <Col>
                                <Form.Label htmlFor="inputPassword">Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    id="inputPasswor5"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    aria-describedby="passwordHelpBlock"
                                    isInvalid={validated && !formValid.password}
                                />
                                <Form.Text id="passwordHelpBlock" muted>
                                    Your password must be 8-20 characters long, contain letters (at least one uppper and one lower), numbers,
                                    and at least one special character.
                                </Form.Text>
                            </Col>
                        </Row>

                        <Row className="mt-3">
                            <Col className="d-flex flex-row justify-content-between">
                                <Button
                                    variant="info"
                                    type="submit"
                                    onClick={() => { navigate(userData ? "/login" : "/") }}
                                >
                                    Switch to Login
                                </Button>

                                <Button
                                    disabled={isLoading}
                                    variant="primary"
                                    type="submit"
                                >
                                    {isLoading ? "Registering User..." : "Register"}
                                </Button>
                            </Col>
                        </Row>
                    </Form>

                    {alerts.map((alert, i) => (
                        <Alert key={`Register-error-alert-${i}`} variant="danger" dismissible className="mb-2">{alert}</Alert>
                    ))}


                </Card.Body>
            </Card>
        </div>
    );
};

export default Register;
