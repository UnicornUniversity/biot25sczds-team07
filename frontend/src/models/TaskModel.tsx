
import { User } from "../models/UserModel"

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type TaskPriority = "VL" | "L" | "N" | "VH";

export type TaskType = {
    _id: string;
    sprintId: string;
    asignedUserId: string;
    name: string;
    description: string;
    priority: "VL" | "L" | "N" | "VH"; // very low, low, normal, high, very high
    status: TaskStatus;
}

export type TaskCreateType = {
    sprintId: string;
    asignedUserId: string;
    name: string;
    desc: string;
    priority: TaskPriority;
    state: TaskStatus;
}

export type TaskUpdateType = {
    taskId: string;
    sprintId: string;
    asignedUserId: string;
    name: string;
    desc: string;
    priority: TaskPriority;
    state: TaskStatus;
}

export type DBEditTaskID = {
    taskId: string;
    sprintId: string;
    asignedUserId: User;
    name: string;
    desc: string;
    priority: TaskPriority;
    state: TaskStatus;
}

