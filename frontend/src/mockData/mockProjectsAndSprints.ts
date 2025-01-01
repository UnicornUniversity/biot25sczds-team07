import { Dayjs } from "dayjs";

export type ProjectType = {
    id: string,
    name: string,
    userIds: string[],
    projectOwnerId: string,
}

export type SprintType = {
    id: string,
    project: ProjectType,
    name: string,
    status: "ACTIVE" | "PLANNED" | "INACTIVE" | "DONE",
    startDateEpoch: number,
    endDateEpoch: number
}
export type NewSprintType = {
    projectId: string,
    name: string,
    fromDate: Dayjs,
    toDate: Dayjs,
}



// Example projects
export const projectsMock: ProjectType[] = [
    {
        id: "101",
        name: "Sprint Planner Core",
        userIds: ["1", "2", "3"],
        projectOwnerId: "1",
    },
    {
        id: "102",
        name: "Mobile App Development",
        userIds: ["4", "5", "6"],
        projectOwnerId: "4",
    },
    {
        id: "103",
        name: "Website Redesign",
        userIds: ["2", "3", "5"],
        projectOwnerId: "2",
    },
];

// Example sprints
export const sprintsMock: SprintType[] = [
    // Sprints for Project 101
    {
        id: "201",
        project: projectsMock[0],
        name: "Sprint 1: Backend Setup",
        status: "DONE",
        startDateEpoch: 1698969600, // Nov 2, 2023
        endDateEpoch: 1699574400, // Nov 9, 2023
    },
    {
        id: "202",
        project: projectsMock[0],
        name: "Sprint 2: Frontend Integration",
        status: "ACTIVE",
        startDateEpoch: 1699574400, // Nov 10, 2023
        endDateEpoch: 1700185600, // Nov 17, 2023
    },
    // Sprints for Project 102
    {
        id: "203",
        project: projectsMock[1],
        name: "Sprint 1: Authentication",
        status: "PLANNED",
        startDateEpoch: 1700870400, // Nov 24, 2023
        endDateEpoch: 1701561600, // Dec 1, 2023
    },
    {
        id: "204",
        project: projectsMock[1],
        name: "Sprint 2: Notifications",
        status: "PLANNED",
        startDateEpoch: 1701561600, // Dec 2, 2023
        endDateEpoch: 1702252800, // Dec 9, 2023
    },
    // Sprints for Project 103
    {
        id: "205",
        project: projectsMock[2],
        name: "Sprint 1: UI Mockups",
        status: "DONE",
        startDateEpoch: 1698364000, // Oct 27, 2023
        endDateEpoch: 1698969600, // Nov 2, 2023
    },
    {
        id: "206",
        project: projectsMock[2],
        name: "Sprint 2: Responsive Layouts",
        status: "ACTIVE",
        startDateEpoch: 1699574400, // Nov 10, 2023
        endDateEpoch: 1700185600, // Nov 17, 2023
    },
];