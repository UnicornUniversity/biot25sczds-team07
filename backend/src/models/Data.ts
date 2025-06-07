import { SensorState } from "../types/customTypes"

export interface TemperatureData {
    timeStamp: number, // UNIX time of when data were measured
    temperature: number,
    state: SensorState
}


export interface SensorDataInfluxOutput {
    sensorId: string,
    sensorData: TemperatureData[];
    averageTemperature: number | null;
}