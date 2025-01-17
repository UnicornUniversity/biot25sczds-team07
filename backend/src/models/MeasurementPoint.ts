import { ObjectId } from "mongodb";
import { TemperatureRange } from "../validators/other_schemas/temperatureRange.schema";

export type SenzorConfiguration = {
    epochCreated: number,
    interval: number,
    temperatureLimits: {
        cooling: TemperatureRange,
        idle: TemperatureRange,
        heating: TemperatureRange,
    }
}

export type Senzor = {
    name: string,
    quantity: "temperature" | "acceleration"
    sensorId: string,
    config: SenzorConfiguration
}

export default class MeasurementPoint {
    constructor(
        public organisationId: ObjectId,
        public name: string,
        public description: string,
        public influxMeasurement: string,
        public creatorId: string,
        public sensors: Senzor[],
        public createdEpoch: number,
        public updatedEpoch: number,
        public _id?: ObjectId
    ) { }
}