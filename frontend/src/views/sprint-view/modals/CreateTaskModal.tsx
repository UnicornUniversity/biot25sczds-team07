import React, { SetStateAction, useState, useEffect } from "react";
import { Form, Row, Col, Alert } from "react-bootstrap";

import DefaultModal from "../../../components/modals/DefaultModal";

import { useUser } from "../../../models/API/useUser";

import { TaskCreateType, TaskPriority } from "../../../models/TaskModel";

import { User } from "../../../models/UserModel";
import { SprintType } from "../../../models/SprintModel";
import { TaskPriorityType } from "../../../mockData/mockTasks";
// import { users } from "../../../mockData/mockUsers";
// import { SprintType } from "../../../mockData/mockProjectsAndSprints";

interface Props {
    modalVersion: '' | 'create-task', setModalVersion: React.Dispatch<SetStateAction<'' | 'edit-task' | 'create-task'>>,
    projectId: string,
    sprint: SprintType,
    addNewTask: (newTask: TaskCreateType) => Promise<boolean>,
}


// const mockusers: User[] = [
//     {
//         _id: "1",
//         role: "ADMIN",
//         name: "Alice",
//         surname: "Johnson",
//         profile_picPath: null, // Replace with an actual path or URL
//         password: "securePass123!",
//         username: "alice.johnson",
//     },
//     {
//         _id: "2",
//         role: "MEMBER",
//         name: "Bob",
//         surname: "Smith",
//         profile_picPath: null, // Replace with an actual path or URL
//         password: "bobSecret456#",
//         username: "bob.smith",
//     },
//     {
//         _id: "3",
//         role: "MEMBER",
//         name: "Charlie",
//         surname: "Brown",
//         profile_picPath: null, // Replace with an actual path or URL
//         password: "charlieP@ss789",
//         username: "charlie.brown",
//     },

// ];

const CreateTaskModal = (props: Props) => {
    const {
        modalVersion, setModalVersion,
        sprint,
        addNewTask,
    } = props;


    const UserApi = useUser();

    const [validated, setValidated] = useState(false);
    const [alerts, setAlerts] = useState<string[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [newTask, setNewTask] = useState({
        sprintId: sprint._id,
        name: "",
        description: "",
        assignedUserId: "",
        priority: "",
        status: ""
    })

    const validInputs = {
        name: newTask.name.length > 5,
        description: typeof newTask.description === "string",
        assignedUserId: !!newTask.assignedUserId,
        priority: !!newTask.priority,
    }

    // console.log("valid inputs: ", validInputs);


    const handleSubmitNewTask = async () => {
        setValidated(true);

        const newAlerts: string[] = [];
        if (!validInputs.name) {
            newAlerts.push("Invalid name - must be longer than 5 characters.");
        }
        if (!validInputs.description) {
            newAlerts.push("Invalid description - must be text.");
        }
        if (!validInputs.assignedUserId) {
            newAlerts.push("Invalid Assignee - must have user assigned.");
        }
        if (!validInputs.priority) {
            newAlerts.push("Invalid priority - priority must be selected.");
        }
        if (newAlerts.length > 0) {
            setAlerts(newAlerts);
            return;
        }

        try {
            setIsLoading(true);
            const createTask: TaskCreateType = {
                sprintId: newTask.sprintId,
                asignedUserId: newTask.assignedUserId,
                name: newTask.name,
                desc: newTask.description,
                priority: newTask.priority as TaskPriorityType,
                state: "TODO",
            }
            const result = await addNewTask(createTask);
            if (!result) {
                throw new Error("Failed to create new Task");
            }
            setModalVersion('');
        } catch (err) {
            console.error("handleSubmitNewTask - error: ", err);
            setAlerts([...newAlerts, "Failed to create new Task"]);

        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        UserApi.getUsers().then((e) => { setUsers(e) });
    }, []);




    return (
        <DefaultModal
            show={modalVersion === "create-task"}
            onSubmit={() => handleSubmitNewTask()}
            isLoading={isLoading}
            onHide={() => setModalVersion('')}
            submitText="Add Task"
        // submitFormId={formId}
        >
            <Form id={"create-new-task-form"} noValidate onSubmit={handleSubmitNewTask} className="gap-2">
                <Form.Group as={Row} controlId="inputSprint">
                    <Form.Label column sm={4}>
                        Sprint: {sprint.name}
                    </Form.Label>
                    <Col sm={8}>
                        <Form.Control
                            type="text"
                            disabled
                            value="SPRINT 1"
                        />
                    </Col>
                </Form.Group>

                <Form.Group as={Row} className="mt-2" controlId="inputTaskName">
                    <Form.Label column sm={4}>
                        Name:
                    </Form.Label>
                    <Col sm={8}>
                        <Form.Control
                            required
                            type="text"
                            placeholder="Enter task's name"
                            value={newTask.name}
                            onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                            isValid={validated && validInputs.name}
                            isInvalid={validated && !validInputs.name}
                        />
                    </Col>
                </Form.Group>

                <Form.Group as={Row} className="mt-2" controlId="inputTaskDescription">
                    <Form.Label column sm={4}>
                        Description:
                    </Form.Label>
                    <Col sm={8}>
                        <Form.Control
                            as="textarea"
                            aria-label="description of the task"
                            value={newTask.description}
                            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                            isValid={validated && validInputs.description}
                            isInvalid={validated && !validInputs.description}
                        />
                    </Col>
                </Form.Group>

                <Form.Group as={Row} controlId="selectAssignee" className="mt-2">
                    <Form.Label column sm={4}>
                        Assignee:
                    </Form.Label>
                    <Col sm={8}>
                        <Form.Select
                            required
                            onChange={(e) => setNewTask({ ...newTask, assignedUserId: e.target.value })}
                            isValid={validated && validInputs.assignedUserId}
                            isInvalid={validated && !validInputs.assignedUserId}
                        >
                            <option value="">Select Assignee</option>
                            {users!.map((user) => {
                                if (user._id === "currentlyLoggedUserId") { return null } // TODO - add check of logged user
                                return (
                                    <option key={user._id} value={user._id}>
                                        {user.username}
                                    </option>
                                )
                            })}
                        </Form.Select>
                    </Col>
                </Form.Group>

                <Form.Group as={Row} controlId="selectPriority" className="mt-2">
                    <Form.Label column sm={4}>
                        Priority:
                    </Form.Label>
                    <Col sm={8}>
                        <Form.Select
                            required
                            onChange={(e) => setNewTask({ ...newTask, priority: (e.target.value as TaskPriority) })}
                            isValid={validated && validInputs.priority}
                            isInvalid={validated && !validInputs.priority}
                        >
                            <option value="">Select Priority</option>
                            <option value="VH">Very Hight</option>
                            <option value="N">Neutral</option>
                            <option value="L">Low</option>
                            <option value="VL">Very Low</option>
                        </Form.Select>
                    </Col>
                </Form.Group>

            </Form>

            {alerts.map((alert, i) => (
                <Alert key={`alert-${i}}`} variant="danger" className="mt-2" dismissible>{alert}</Alert>
            ))}
        </DefaultModal>
    );
}

export default CreateTaskModal;