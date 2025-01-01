export type SprintStateType = "ACTIVE" | "PLANNED" | "INACTIVE" | "DONE"

export type SprintType = {
    _id: string,
    projectId: string;
    name: string;
    status: SprintStateType;
    startDate: string;
    endDate: string;
}
export type SprintCreateType = {
    projectId: string;
    name: string;
    state: SprintStateType;
    dtFrom: string; // 2024-11-10 => YYYY-MM-DD
    dtEnd: string;
}
