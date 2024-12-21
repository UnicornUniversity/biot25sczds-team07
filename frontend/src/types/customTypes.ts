export type User = {
    id: string;
    role: string;
    policies: string[];
}

export type ErrorMap = {
    [key: string]: string | string[]
}