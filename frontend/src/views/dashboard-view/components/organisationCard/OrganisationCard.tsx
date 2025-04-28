import { Card } from "react-bootstrap";
import { Organisation } from "../../../../../API/requests/organisationRequests";

interface Props {
    organisation: Organisation,
}
const OrganisationCard = (props: Props) => {
    const { organisation } = props;
    return (
        <Card style={{ width: '18rem' }}>
            <Card.Body>
                <Card.Title>{organisation.name}</Card.Title>
                {/* <Card.Subtitle className="mb-2 text-muted">Card Subtitle</Card.Subtitle> */}
                <Card.Text>
                    <span className="fw-bold">Description:</span> {organisation.description}
                </Card.Text>

                <Card.Link href="#">Card Link</Card.Link>
                <Card.Link href="#">Another Link</Card.Link>
            </Card.Body>
        </Card>
    );
}

export default OrganisationCard;