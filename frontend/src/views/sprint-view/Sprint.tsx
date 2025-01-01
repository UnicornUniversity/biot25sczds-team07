import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Alert, Badge, Button, Col, Container, Row, Spinner } from "react-bootstrap";
import Table from 'react-bootstrap/Table';
// import { v4 as uuidv4 } from 'uuid';
import MDEditor from '@uiw/react-md-editor';

import CreateTaskModal from "./modals/CreateTaskModal";
import EditTaskModal from "./modals/EditTaskModal";

import { SprintType } from "../../models/SprintModel";
import { User } from "../../models/UserModel";

import { TaskType, TaskCreateType, TaskUpdateType, TaskStatus } from "../../models/TaskModel"

import { useTask } from "../../models/API/useTask";
import { useSprint } from "../../models/API/useSprint";
import { useUser } from "../../models/API/useUser";

// export const mockusers: User[] = [
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


const Sprint = () => {
    const { sprintId } = useParams();
    const navigate = useNavigate();

    const TaskApi = useTask();
    const SprintApi = useSprint();
    const userApi = useUser();

    const [sprint, setSprint] = useState<null | SprintType>(null);
    const [users, setUsers] = useState<User[]>([]);

    const [isLoading, setIsLoading] = useState({ tasks: true, action: false });
    const [projectSprints, setProjectSprints] = useState<SprintType[]>([]);
    const [modalVersion, setModalVersion] = useState<'' | 'create-task' | 'edit-task'>('');

    const [tasks, setTasks] = useState<TaskType[]>([]);
    const [editedTask, setEditedTask] = useState<null | TaskType>(null);

    const fetchAllData = async () => {
        if (!sprintId || sprintId.length < 5) {
            console.error("fetchAllData - error - Invalid sprintId: ", sprintId);
            return;
        }

        const sprint: SprintType = await SprintApi.getSprintById(sprintId);
        if (!sprint) {
            console.error("fetchAllData - error - Sprint with this sprintId doesnt exists: ", sprintId);
            return;
        }

        let fetchedSprintTasks: TaskType[] = await TaskApi.getTasks();
        fetchedSprintTasks = fetchedSprintTasks.filter((task) => task.sprintId === sprintId);
        // console.log(fetchedSprintTasks.filter((e)=>{e.sprint?._id === sprintId}));
        if (!Array.isArray(fetchedSprintTasks)) {
            console.error("failed to fetch tasks");
            return;
        }

        const projectSprints: SprintType[] = await SprintApi.getSprints();
        if (!Array.isArray(projectSprints)) {
            console.error("failed to fetch project sprints");
            return;
        }

        setSprint(sprint);
        setTasks(fetchedSprintTasks);
        setProjectSprints(projectSprints.filter((sp) => sp.projectId === sprint.projectId));
        setIsLoading({ tasks: false, action: false });
    }

    type selectNewSprintProps = { id?: string, index?: number };
    const selectNewSprint = ({ id, index }: selectNewSprintProps) => {
        // console.log("projectSPrints: ", projectSprints);
        // console.log("Index: ", index);
        if (typeof id === "undefined" && typeof index === "undefined") { return; }
        let newSprint: SprintType | undefined;
        if (id) {
            newSprint = projectSprints.find((sp) => sp._id === id);
        } else if (typeof index === "number") {
            newSprint = projectSprints[index];
            // console.log("newSPrint", newSprint);
        }
        if (!newSprint) { return; }
        navigate(`/sprint/${newSprint._id}`);
    }

    const addNewTask = async (task: TaskCreateType) => {
        try {
            const result: TaskType = await TaskApi.createTask(task);
            console.log("addNewTask - result: ", result);
            if (result._id) {
                setTasks([...tasks, result]);
                return true;
            }
            throw new Error("addNewTask - failed to create Task");
        } catch (err) {
            console.error("addNewTask - failed to create task - error: ", err);
            return false;
        }
    }

    // TODO - add better error handling (like in the method above)
    const submitTaskEdit = useCallback(async (task: TaskType) => {
        const updateTask: TaskUpdateType = {
            asignedUserId: task.asignedUserId,
            desc: task.description,
            name: task.name,
            priority: task.priority,
            sprintId: sprintId!,
            state: task.status,
            taskId: task._id
        }
        const result = await TaskApi.updateTask(updateTask);
        console.log("submitTaskEdit - result: ", result);
        if (result === 1) { // update was succesfull?? 
            const updatedTask = await TaskApi.getTaskById(updateTask.taskId);
            const newTasks = [...tasks];
            newTasks[tasks.findIndex((e) => e._id === updateTask.taskId)] = updatedTask;
            setTasks(newTasks);
            return true;
        }
        return false
    }, [tasks]);

    // TODO - add better error handling like in the method for adding Task
    const submitTaskDelete = useCallback(async (taskId: string) => {
        const result = await TaskApi.deleteTask(taskId);
        return result === 1;
    }, [setTasks])

    const updateTaskState = async (index: number) => {
        if (!sprint) {
            console.error("updateTaskState - sprint is null");
            return;
        }
        let newStatus: TaskStatus;
        const selectedTask = tasks[index];
        console.log("selectedTask: ", selectedTask);

        switch (selectedTask.status) {
            case "DONE": {
                newStatus = "TODO";
                break;
            }
            case "TODO": {
                newStatus = "IN_PROGRESS";
                break;
            }
            default: {
                newStatus = "DONE";
                break;
            }
        }

        const updateTask: TaskUpdateType = {
            asignedUserId: selectedTask.asignedUserId,
            desc: selectedTask.description,
            name: selectedTask.name,
            priority: selectedTask.priority,
            sprintId: sprintId!,
            state: newStatus,
            taskId: selectedTask._id
        };
        const result = await TaskApi.updateTask(updateTask);
        console.log("updateTaskState - result: ", result);
        if (result === 1) { // TODO - update will return TaskType instead of "0" or "1" => data format that i get from GET
            const updatedTask = await TaskApi.getTaskById(selectedTask._id);
            const newTasks = [...tasks];
            newTasks[index] = updatedTask;
            setTasks(newTasks);
        }
    };

    const getBadgeForPriority = (task: TaskType) => {
        switch (task.priority) {
            case "VH": { return (<Badge bg="warning" >Very High</Badge>) }
            case "N": { return (<Badge bg="primary" >Neutral</Badge>) }
            case "L": { return (<Badge bg="info" >Low</Badge>) }
            default: { return (<Badge bg="secondary" >Very Low</Badge>) }
        }
    }

    const indexOfSelectedSprint = useMemo(() => projectSprints.findIndex((sp) => sp._id === sprintId), [projectSprints, sprintId]);

    useEffect(() => {
        async function fetchUsers() {
            const result = await userApi.getUsers();
            setUsers(result);
        }
        fetchUsers();
    }, []);

    useEffect(() => {
        fetchAllData();
    }, [sprintId]);

    if (!sprint) {
        return (
            <Container>
                <Row className="mt-4">
                    {isLoading.tasks
                        ? (
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </Spinner>
                        )
                        : (
                            <Alert variant="warning">
                                <p className="fw-bold p-0 m-0">Sprint Not Found</p>
                            </Alert >
                        )
                    }
                </Row>
            </Container >
        )
    }

    return (
        <>
            {(modalVersion === "create-task") && (
                <CreateTaskModal
                    modalVersion={modalVersion} setModalVersion={setModalVersion}
                    projectId={sprint.projectId}
                    sprint={sprint}
                    addNewTask={addNewTask}
                />
            )}

            {(modalVersion === "edit-task" && editedTask) && (
                <EditTaskModal
                    modalVersion={modalVersion} setModalVersion={setModalVersion}
                    projectId={sprint.projectId}
                    sprint={sprint}
                    editedTask={editedTask}
                    submitTaskEdit={submitTaskEdit}
                    submitTaskDelete={submitTaskDelete}
                />
            )}


            <Container>
                <Row className="mt-4">
                    <Col xs={4} lg={3} className="d-flex  justify-content-end  align-items-center">
                        <Button
                            disabled={indexOfSelectedSprint < 1}
                            onClick={() => { selectNewSprint({ index: (indexOfSelectedSprint - 1) }) }}
                        >
                            <i className="bi bi-arrow-left" />
                        </Button>
                    </Col>
                    <Col xs={4} lg={6} className="d-flex justify-content-center  align-items-center">
                        <span className="mx-0 mx-sm-2 fw-bold display-6">{sprint.name}</span>
                    </Col>
                    <Col xs={4} lg={3} className="d-flex  justify-content-start  align-items-center">
                        <Button
                            disabled={indexOfSelectedSprint >= (projectSprints.length - 1)}
                            onClick={() => { selectNewSprint({ index: (indexOfSelectedSprint + 1) }) }}
                        >
                            <i className="bi bi-arrow-right" />
                        </Button>
                    </Col>
                </Row>



                <Row className="mt-4 h-25 " >
                    <div className="overflow-x-auto" >
                        <Table striped bordered hover style={{ minWidth: "600px" }}>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Description</th>
                                    <th>Priority</th>
                                    <th>Assignee</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tasks.map((item, index) => (
                                    <tr key={index}>
                                        <td>
                                            <Button
                                                variant="info"
                                                onClick={() => {
                                                    setEditedTask(item);
                                                    setModalVersion('edit-task');
                                                }}
                                            >
                                                {item.name}
                                            </Button>
                                        </td>
                                        <td>
                                            <MDEditor.Markdown
                                                source={item.description}
                                                style={{
                                                    whiteSpace: 'pre-wrap',
                                                    color: 'black',
                                                    backgroundColor: 'rgba(0,0,0,0)'
                                                }}
                                            />
                                        </td>
                                        <td>{getBadgeForPriority(item)}</td>
                                        <td>
                                            <span className="fw-bold">
                                                {users.find((user) => user._id === item.asignedUserId)?.username ?? ""}
                                            </span>
                                        </td>
                                        <td>
                                            <Button onClick={() => { updateTaskState(index); }}>
                                                {item.status}
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                </Row>

                <Row>
                    <Col sm={2} className="d-flex justify-content-start p-sm-0">
                        <Button onClick={() => setModalVersion('create-task')} variant="primary" size="lg">+ task</Button>
                    </Col>
                </Row>
            </Container >
        </>
    );
}

export default Sprint;