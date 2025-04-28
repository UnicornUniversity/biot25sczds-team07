import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
    const navigate = useNavigate();
    // const error = useRouteError();
    // console.error(error);

    const handleGoHome = () => {
        navigate('/');
    };

    // Helper function to safely retrieve error message
    // const getErrorMessage = (error: unknown): React.ReactNode => {
    //     if (typeof error === 'object' && error !== null) {
    //         const err = error as { statusText?: string; message?: string };
    //         return err.statusText || err.message || "An unknown error occurred";
    //     }
    //     return "An unknown error occurred";
    // };

    return (
        <Container className="text-center d-flex flex-column justify-content-center align-items-center vh-100">
            <Row>
                <Col>
                    <h1 className="display-1">404</h1>
                    <h2 className="mb-4">Page Not Found</h2>
                    <p className="lead">Oops! The page you're looking for doesn't exist.</p>
                    {/* <p>Dev error:
                        <i>{getErrorMessage(error)}</i>
                    </p> */}
                    <Button variant="primary" onClick={handleGoHome}>
                        Go Home
                    </Button>
                </Col>
            </Row>
        </Container>
    );
};

export default NotFoundPage;
