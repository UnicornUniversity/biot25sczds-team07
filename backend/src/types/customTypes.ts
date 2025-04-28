
export enum SensorState {
    IDLE = 1,
    COOLING = 2,
    HEATING = 3,
}

export type ErrorMap = Record<string, string | string[]>