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

    // useEffect(() => {
    //     const getUserById = async (token: string, userId: string) => {
    //         try {
    //             console.log(`Token: ${token} + userId: ${userId}`);
    //             // TODO - get user by ID => use JWT token from local storage
    //             // const user: User = await useUser().
    //         } catch (err) {
    //             console.error("getUserById - error: ", err);
    //         }

    //     }

    //     const token = localStorage.getItem("JWTtoken");
    //     const userId = localStorage.getItem("userId");
    //     if ((typeof token === "string" && token.length > 2) && (typeof userId === "string" && userId.length > 2)) {
    //         getUserById(token, userId);
    //     }
    // }, []);

    return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-light flex-column">

            <Card style={{ width: "500px" }}>
                <Card.Header className="text-center mb-4">
                    <h2>Sign In</h2>
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
