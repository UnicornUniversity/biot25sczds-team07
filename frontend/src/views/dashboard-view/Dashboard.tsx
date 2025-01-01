import { Badge, Button, Col, Container, Row, Spinner, Table } from "react-bootstrap";
import { PieChart } from "@mui/x-charts";
import { useEffect, useState } from "react";
// import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

import { useMainContext } from "../../customHooks/useMainContext";

import { SprintType, SprintCreateType } from "../../models/SprintModel";
import { useSprint } from "../../models/API/useSprint";
import { useTask } from "../../models/API/useTask";

import CreateSprintModal from "./modals/CreateSprintModal";
import { TaskType } from "../../models/TaskModel";

// import { tasksMock } from "../../mockData/mockTasks";
// import { SprintType } from "../../mockData/mockProjectsAndSprints";

const Dashboard = () => {
    const { selectedProject } = useMainContext();

    const SprintApi = useSprint();
    const TaskApi = useTask();

    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(false);
    const [modalVersion, setModalVersion] = useState<'create-sprint' | ''>('');

    const [projectSprints, setProjectSprints] = useState<SprintType[]>([]);
    type ProjectStatisticType = {
        [key: string]: { // id of the sprint
            todo: number, progress: number, done: number,
        }
    }
    const [projectStatistics, setProjectStatistics] = useState<ProjectStatisticType>({});

    // interface SprintActionButtonProps { sprintIndex: number, }
    // const SprintActionButton = ({ sprintIndex }: SprintActionButtonProps) => {
    //     const sprint = projectSprints[sprintIndex];

    //     const updateSprintStatus = (newStatus: "DONE" | "ACTIVE" | "INACTIVE" | "PLANNED") => {
    //         // console.log("Updating sprint status to: ", newStatus);
    //         const globalSprintIndex = sprintsMock.findIndex((globalSprint) => globalSprint.id === sprint.id);
    //         // console.log("sprint.id: ", sprint.id);
    //         // console.log("global sprints: ", sprintsMock);
    //         // console.log("global sprint index: ", globalSprintIndex);
    //         if (globalSprintIndex !== -1) {
    //             // Update global sprintsMock
    //             sprintsMock[globalSprintIndex].status = newStatus;

    //             // Update local projectSprints
    //             const newProjectSprints = [...projectSprints];
    //             newProjectSprints[sprintIndex].status = newStatus;
    //             setProjectSprints(newProjectSprints);
    //         }
    //     };

    //     switch (sprint.status) {
    //         case "DONE": {
    //             return null; // No action for "DONE" sprints
    //         }
    //         case "ACTIVE": {
    //             return (
    //                 <Button
    //                     variant="primary"
    //                     onClick={() => updateSprintStatus("DONE")}
    //                 >
    //                     Finish
    //                 </Button>
    //             );
    //         }
    //         case "INACTIVE": {
    //             return (
    //                 <Button
    //                     variant="primary"
    //                     onClick={() => updateSprintStatus("ACTIVE")}
    //                 >
    //                     Start
    //                 </Button>
    //             );
    //         }
    //         case "PLANNED": {
    //             return (
    //                 <Button
    //                     variant="primary"
    //                     onClick={() => updateSprintStatus("ACTIVE")}
    //                 >
    //                     Start
    //                 </Button>
    //             );
    //         }
    //         default: {
    //             return null;
    //         }
    //     }
    // };

    const getSprintBadgeColor = (sprint: SprintType) => {
        switch (sprint.status) {
            case "DONE": { return "success"; }
            case "ACTIVE": { return "warning"; }
            default: { return "secondary"; }
        }
    }

    const addNewSprint = async (newSprint: SprintCreateType) => {
        try {
            console.log(newSprint);
            if (!selectedProject) { return false; }
            const resultSprint: SprintType = await SprintApi.createSprint(newSprint);
            if (!resultSprint._id) {
                throw new Error("Failed to create sprint");
            }
            // console.log("resultSprint: ", resultSprint);
            setProjectSprints([...projectSprints, resultSprint]);
            return true;
        } catch (err) {
            console.error("addNewSprint - error: ", err);
            return false;
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            if (!selectedProject) {
                throw new Error("fetchData - project is not selected");
            }
            try {
                setIsLoading(true);

                const allSprints: SprintType[] = await SprintApi.getSprints();
                if (!Array.isArray(allSprints)) {
                    throw new Error("Failed to get Project Sprints");
                }
                // console.log("fetchData - projecSprints: ", allSprints); // TODO - all sprints for now
                const projectSprints = allSprints.filter((sprint) => sprint.projectId === selectedProject._id);
                console.log("projectSprints: ", projectSprints);

                const tasks = await TaskApi.getTasks() as TaskType[];
                if (!Array.isArray(tasks)) {
                    throw new Error("Failed to get Tasks");
                }
                console.log("tasks: ", tasks);


                const newStats: ProjectStatisticType = {};

                projectSprints.forEach((sprint) => {
                    const sprintTasks = tasks.filter((task) => {
                        if (!task.sprintId) { return false; }
                        return task.sprintId === sprint._id;
                    });
                    console.log("sprintTasks: ", sprintTasks);

                    sprintTasks.forEach((sprintTask) => {
                        if (!newStats[sprint._id]) { newStats[sprint._id] = { done: 0, progress: 0, todo: 0 } };
                        const sprintStats = newStats[sprint._id];
                        // console.log("sprintStats: ", sprintStats);
                        if (sprintTask.status === "DONE") { sprintStats.done = sprintStats.done + 1; }
                        else if (sprintTask.status === "IN_PROGRESS") { sprintStats.progress = sprintStats.progress + 1; }
                        else { sprintStats.todo = sprintStats.todo + 1; }
                    })
                })


                console.log("newStas:", newStats);

                setProjectSprints(projectSprints);
                setProjectStatistics(newStats);
            }
            catch (err) {
                console.log("fetchData - error: ", err);
            }
            finally { setIsLoading(false); }
        }

        if (!selectedProject) {
            setProjectSprints([]);
            return;
        }
        fetchData();
    }, [selectedProject, setProjectSprints]);

    const allSprintsStats = { todo: 0, progress: 0, done: 0 };
    Object.values(projectStatistics).forEach((stats) => {
        allSprintsStats.todo = allSprintsStats.todo + stats.todo;
        allSprintsStats.progress = allSprintsStats.progress + stats.progress;
        allSprintsStats.done = allSprintsStats.done + stats.done;
    })

    const percantageOfProjectDone = allSprintsStats.done / (allSprintsStats.done + allSprintsStats.progress + allSprintsStats.todo) * 100;

    return (
        <>
            {(modalVersion === "create-sprint" && selectedProject) && (
                <CreateSprintModal
                    projectId={selectedProject._id}
                    modalVersion={modalVersion}
                    setModalVersion={setModalVersion}
                    addNewSprint={addNewSprint}
                />
            )}

            <Container className="mt-4">
                <h1>DASHBOARD</h1>

                {/* <p>PROJECT SPRINTS: {projectSprints.length}</p> */}

                <Row className="bg-light rounded-4 border border-2 border-secondary p-2">
                    <Col sm={12} lg={3} className="d-flex align-items-center justify-content-center">
                        <h2>Overview of tasks:</h2>
                    </Col>
                    <Col sm={12} lg={6} className="d-flex justify-content-center" >
                        {isLoading
                            ? (
                                <Spinner animation="border" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </Spinner>
                            )
                            : (
                                <PieChart
                                    series={[
                                        {
                                            data: [
                                                { id: "todo", value: allSprintsStats.todo, label: 'TODO' },
                                                { id: "progress", value: allSprintsStats.progress, label: 'In Progress' },
                                                { id: "done", value: allSprintsStats.done, label: 'Done' },
                                            ],
                                        },
                                    ]}
                                    width={500}
                                    height={200}
                                />
                            )
                        }
                    </Col>
                    <Col sm={12} lg={3} className="d-flex align-items-center justify-content-center">
                        <span className="display-4 fw-bold" >
                            {!isNaN(percantageOfProjectDone) && `${percantageOfProjectDone.toFixed(0)}% Done`}
                        </span>
                    </Col>
                </Row>

                <Row className="mt-4">
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>SprintType Name</th>
                                <th className="text-center">TODO (tasks)</th>
                                <th className="text-center">In progress (tasks)</th>
                                <th className="text-center">Done (tasks)</th>
                                <th >Status</th>
                                <th>From-To</th>
                            </tr>
                        </thead>
                        <tbody>
                            {projectSprints.map((sprint) => {
                                const sprintStats = projectStatistics[sprint._id] ?? { todo: 0, progress: 0, done: 0 };
                                return (
                                    <tr key={sprint._id}>
                                        <td>
                                            <Button
                                                variant="info"
                                                onClick={() => navigate(`/sprint/${sprint._id}`)}
                                            >
                                                {sprint.name}
                                            </Button>
                                        </td>
                                        <td className="text-center">
                                            <span className="fw-bold">{sprintStats.todo}</span>
                                        </td>
                                        <td className="text-center">
                                            <span className="fw-bold">{sprintStats.progress}</span>
                                        </td>
                                        <td className="text-center" >
                                            <span className="fw-bold">{sprintStats.done}</span>
                                        </td>
                                        <td><Badge bg={getSprintBadgeColor(sprint)}>{sprint.status}</Badge></td>
                                        {/* startDate and endDate doesnt have timestamp  */}
                                        <td> {dayjs(sprint.startDate).format("DD.MM.YYYY")} - {dayjs(sprint.endDate).format("DD.MM.YYYY")} </td>
                                        {/* <td>
                                        <SprintActionButton sprintIndex={i} />
                                    </td> */}
                                    </tr>
                                )
                            })}
                        </tbody>
                    </Table>
                </Row>

                <Row>
                    <Col lg={2} className="d-flex justify-content-start p-0">
                        <Button onClick={() => setModalVersion('create-sprint')} variant="primary" size="lg">+ Sprint</Button>
                    </Col>
                </Row>
            </Container>
        </>
    );
}

export default Dashboard;