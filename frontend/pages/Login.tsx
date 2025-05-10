import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Button, Card, Col, Form, Row } from "react-bootstrap";

import { useLoggedUserContext } from "../src/customHooks/useLoggedUserContext";

const Login = () => {
    const navigate = useNavigate();

    const { loginUser } = useLoggedUserContext();

    const [alerts, setAlerts] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            setIsLoading(true);
            const result = await loginUser({ email, password });
            if (!result || !Object.hasOwn(result, "_id")) {
                throw new Error("login - loginUser - failed");
            }
            navigate("/");
        } catch (err) {
            console.log("login - error: ", err);
            setAlerts([...alerts, "Login Failed"]);
        }
        finally { setIsLoading(false); }
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-light flex-column">

            <Card style={{ width: "500px" }}>
                <Card.Header className="d-flex flex-row justify-content-between align-items-center mb-4 p-4">
                    <h2>Sign In</h2>
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
                    <Form onSubmit={handleSubmit} >
                        <Row >
                            <Col>
                                <Form.Label htmlFor="inputEmail">Email</Form.Label>
                                <Form.Control
                                    type="text"
                                    id="inputEmail"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </Col>
                        </Row>

                        <Row className="mt-2" >
                            <Col>
                                <Form.Label htmlFor="inputPassword">Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    id="inputPasswor5"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    aria-describedby="passwordHelpBlock"
                                />
                            </Col>
                        </Row>

                        <Row className="mt-3" >
                            <Col className="d-flex justify-content-between">
                                <Button
                                    variant="secondary"
                                    type="submit"
                                    onClick={() => { navigate("/register") }}
                                >
                                    Register
                                </Button>

                                <Button
                                    disabled={isLoading}
                                    variant="primary"
                                    type="submit"
                                >
                                    {isLoading ? "Logging User..." : "Login"}
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

export default Login;
