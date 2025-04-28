import { Dispatch, useState, useEffect } from "react";
import { Col, Form, Row } from "react-bootstrap";

import DefaultModal from "../../../components/modals/DefaultModal";
import { useMainContext } from "../../../customHooks/useMainContext";

// import { users } from "../../../mockData/mockUsers";

import { ProjectIn } from "../../../models/ProjectModel"
import { useLoggedUserContext } from '../../../customHooks/useLoggedUserContext';


interface Props {
    modalVersion: 'create-organisation', setModalVersion: Dispatch<string>,
}


const CreateProjectModal = (props: Props) => {
    const { userData } = useLoggedUserContext();
    const { modalVersion, setModalVersion } = props;

    const [validated, setValidated] = useState(false);
    const { } = useMainContext();


    const handleSubmitNewProject = async (event: React.FormEvent<HTMLFormElement>) => {
        if (!userData) {
            console.error("handleSubmitNewProject - userData is null: ", userData);
            return;
        }

        const form = event.currentTarget;
        event.preventDefault();
        if (form.checkValidity() === false) {
            event.stopPropagation();
            setValidated(true);
            return; // Stop processing if the form is invalid
        }
        setValidated(true);

        // Get the project name
        const projectName = (form.elements.namedItem("inputProjectName") as HTMLInputElement)?.value;

        // Get the selected team members (value and label)
        const checkboxes = form.querySelectorAll('input[name="teamMember"]:checked');
        const selectedTeamMembers = Array.from(checkboxes).map((checkbox) => {
            const input = checkbox as HTMLInputElement;
            return input.value;
        });

        // Add the new project to the state
        const newProject: ProjectIn = {

            name: projectName || "",
            userIds: selectedTeamMembers || [],
            projectOwner: userData._id!, // Replace with the actual owner ID if necessary
        };

        const createdProject = projectApi.createProject(newProject);
        if (typeof createdProject === "number" && createdProject === 1) {
            const allProjects = await projectApi.getProjects();
            setProjects(allProjects);
        }
        setModalVersion("")
    }


    if (modalVersion !== 'create-organisation') { return null; }
    return (
        <DefaultModal
            show={modalVersion === "create-organisation"}
            onHide={() => setModalVersion('')}
            onSubmit={() => { }}
            submitText="Create Organisation"
            title={"Create Organisation"}
        >
            <Form onSubmit={handleSubmitNewProject}>
                <Form.Group as={Row} controlId="inputProjectName">
                    <Form.Label column sm={4}>
                        Project's name
                    </Form.Label>
                    <Col sm={8}>
                        <Form.Control type="text" placeholder="Enter project name" />
                    </Col>
                </Form.Group>

                <Form.Group as={Row} controlId="inputProjectTeam" className="mt-4">
                    <Form.Label column sm={4}>
                        Team members:
                    </Form.Label>
                    <Col sm={8} className="h-75 d-inline-block overflow-y-scroll">
                        {users.map((user) => (
                            <Form.Check
                                key={user._id}
                                label={user.username}
                                name="teamMember"
                                value={user._id}
                                type="checkbox"
                            />
                        ))}
                    </Col>
                </Form.Group>
            </Form>

        </DefaultModal>
    );
}

export default CreateProjectModal;