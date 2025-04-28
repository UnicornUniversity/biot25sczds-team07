import { ObjectId } from "mongodb";
import { BaseEntity } from "./BaseEntity";
export interface SensorConfigurationDTO {
    sendInterval: number,
    measureInterval: number,
    temperatureLimits: {
        // °C
        cooling: number, // if temperature is above this number => start cooling
        heating: number // if temperature is below this number => start heating
    }
}
export interface SenzorConfiguration extends SensorConfigurationDTO {
    created: number,
}

export type MeasuredQuantity = "temperature" | "acceleration";
export interface Sensor {
    sensorId: string,
    name: string,
    quantity: MeasuredQuantity,
    config: SenzorConfiguration,
    created: number,
    edited?: number,
    deleted?: number
}

export default interface MeasurementPoint extends BaseEntity {
    organisationId: ObjectId,
    ownerId: string,
    name: string,
    description: string,
    jwtToken: string,
    sensors: Sensor[],
}
