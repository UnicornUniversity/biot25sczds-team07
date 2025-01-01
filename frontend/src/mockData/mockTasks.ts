import { sprintsMock, SprintType } from "./mockProjectsAndSprints";

export type TaskPriorityType = "VL" | "L" | "N" | "VH"


export type TaskCreateType = {
    sprint: SprintType | null,
    assignedUserId: string,
    name: string,
    description: string,
    priority: TaskPriorityType,
    status: "TODO" | "IN_PROGRESS" | "DONE",
}
export type TaskType = TaskCreateType & {
    id: string,
}


const tasksSprint201: TaskType[] = [
    {
        id: "task101",
        sprint: sprintsMock[0],
        assignedUserId: "1", // Markéta
        name: "Set up Node.js project",
        description: "Initialize a **new Node.js project** and install required dependencies.",
        priority: "VH",
        status: "DONE",
    },
    {
        id: "task102",
        sprint: sprintsMock[0],
        assignedUserId: "2", // Pepa
        name: "Create database schema",
        description: "Design and implement the database schema for the application.",
        priority: "N",
        status: "DONE",
    },
    {
        id: "task103",
        sprint: sprintsMock[0],
        assignedUserId: "3", // Martin
        name: "Develop API endpoints",
        description: "Build the main API endpoints for user authentication and data retrieval.",
        priority: "N",
        status: "DONE",
    },
];

// Tasks for Sprint 202: Frontend Integration
const tasksSprint202: TaskType[] = [
    {
        id: "task201",
        sprint: sprintsMock[1],
        assignedUserId: "4", // Jan
        name: "Set up React project",
        description: "Initialize the React app and set up the project structure.",
        priority: "VH",
        status: "IN_PROGRESS",
    },
    {
        id: "task202",
        sprint: sprintsMock[1],
        assignedUserId: "5", // Katerina
        name: "Integrate backend API",
        description: "Connect the React app to the backend API and test data flow.",
        priority: "N",
        status: "TODO",
    },
    {
        id: "task203",
        sprint: sprintsMock[1],
        assignedUserId: "6", // Tomas
        name: "Build user interface components",
        description: "Create reusable UI components for the application.",
        priority: "N",
        status: "TODO",
    },
];

// Tasks for Sprint 203: Authentication
const tasksSprint203: TaskType[] = [
    {
        id: "task301",
        sprint: sprintsMock[2],
        assignedUserId: "2", // Pepa
        name: "Implement login feature",
        description: "Develop the login functionality with email and password validation.",
        priority: "VH",
        status: "TODO",
    },
    {
        id: "task302",
        sprint: sprintsMock[2],
        assignedUserId: "4", // Jan
        name: "Add registration flow",
        description: "Build the user registration form and integrate it with the backend.",
        priority: "N",
        status: "TODO",
    },
    {
        id: "task303",
        sprint: sprintsMock[2],
        assignedUserId: "5", // Katerina
        name: "Set up session management",
        description: "Configure session handling for authenticated users.",
        priority: "N",
        status: "TODO",
    },
];

// Tasks for Sprint 204: Notifications
const tasksSprint204: TaskType[] = [
    {
        id: "task401",
        sprint: sprintsMock[3],
        assignedUserId: "3", // Martin
        name: "Design notification system",
        description: "Plan the structure of the notification feature and its database integration.",
        priority: "N",
        status: "TODO",
    },
    {
        id: "task402",
        sprint: sprintsMock[3],
        assignedUserId: "6", // Tomas
        name: "Implement email notifications",
        description: "Develop the backend functionality for sending email notifications.",
        priority: "N",
        status: "TODO",
    },
    {
        id: "task403",
        sprint: sprintsMock[3],
        assignedUserId: "1", // Markéta
        name: "Create notification UI",
        description: "Design and implement the user interface for displaying notifications.",
        priority: "N",
        status: "TODO",
    },
];

// Tasks for Sprint 205: UI Mockups
const tasksSprint205: TaskType[] = [
    {
        id: "task501",
        sprint: sprintsMock[4],
        assignedUserId: "5", // Katerina
        name: "Create wireframes",
        description: "Design low-fidelity wireframes for all main pages.",
        priority: "N",
        status: "DONE",
    },
    {
        id: "task502",
        sprint: sprintsMock[4],
        assignedUserId: "6", // Tomas
        name: "Develop high-fidelity mockups",
        description: "Create detailed UI designs with branding and style guides.",
        priority: "VH",
        status: "DONE",
    },
    {
        id: "task503",
        sprint: sprintsMock[4],
        assignedUserId: "2", // Pepa
        name: "Prepare design documentation",
        description: "Document design decisions and share them with the team.",
        priority: "N",
        status: "DONE",
    },
];

// Tasks for Sprint 206: Responsive Layouts
const tasksSprint206: TaskType[] = [
    {
        id: "task601",
        sprint: sprintsMock[5],
        assignedUserId: "4", // Jan
        name: "Set up CSS framework",
        description: "Integrate and configure a CSS framework like Bootstrap.",
        priority: "N",
        status: "IN_PROGRESS",
    },
    {
        id: "task602",
        sprint: sprintsMock[5],
        assignedUserId: "3", // Martin
        name: "Build responsive grid system",
        description: "Implement a grid layout to support responsive design.",
        priority: "VH",
        status: "IN_PROGRESS",
    },
    {
        id: "task603",
        sprint: sprintsMock[5],
        assignedUserId: "1", // Markéta
        name: "Test responsive breakpoints",
        description: "Ensure the UI adapts properly to different screen sizes.",
        priority: "N",
        status: "TODO",
    },
];

export const tasksMock = [
    ...tasksSprint201,
    ...tasksSprint202,
    ...tasksSprint203,
    ...tasksSprint204,
    ...tasksSprint205,
    ...tasksSprint206,
]
