// You can place this Footer component in a new file, e.g. src/layout/Footer.tsx

import { memo } from "react";
import { Container, Row, Col } from "react-bootstrap";

const Footer = () => (
    <footer className="bg-light text-center text-lg-start mt-5 border-top shadow-sm">
        <Container fluid className="py-3">
            <Row className="align-items-center">
                <Col md={6} className="mb-2 mb-md-0 text-md-start text-center">
                    <span className="me-2">
                        Copyright © {new Date().getFullYear()} Smart Terrarium IoT
                    </span>
                    <span style={{ fontWeight: 500 }}>created by Smart Terrarium IoT</span>
                </Col>
                <Col md={6} className="text-md-end text-center">
                    <a href="#" className="text-dark me-3" aria-label="X (Twitter)">
                        <i className="bi bi-x-twitter" style={{ fontSize: "22px" }} />
                    </a>
                    <a href="#" className="text-dark me-3" aria-label="LinkedIn">
                        <i className="bi bi-linkedin" style={{ fontSize: "22px" }} />
                    </a>
                    <a href="#" className="text-dark" aria-label="GitHub">
                        <i className="bi bi-github" style={{ fontSize: "22px" }} />
                    </a>
                </Col>
            </Row>
        </Container>
    </footer>
);

export default memo(Footer);