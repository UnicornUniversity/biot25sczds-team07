
import { ajv, JSONSchemaType, VALIDATION_ERRORS, } from "../../../ajv-validation/ajvInstance"
import { SensorConfigurationDTO } from "../../../models/MeasurementPoint";
import sensorConfigSchema from "./sensorConfig.schema";

export interface SensorUpdateConfigSchema {
    measurementPointId: string,
    sensorId: string,
    jwtToken: string,
    config: SensorConfigurationDTO,
}

const sensorUpdateConfigSchema: JSONSchemaType<SensorUpdateConfigSchema> = {
    type: 'object',
    properties: {
        measurementPointId: {
            type: 'string',
            format: 'objectId',
            errorMessage: {
                type: `${VALIDATION_ERRORS.FORMAT} String`,
                format: `${VALIDATION_ERRORS.FORMAT} objectId`,
            },
        },
        jwtToken: {
            type: 'string',
            errorMessage: {
                type: `${VALIDATION_ERRORS.FORMAT} String`,
            },
        },
        sensorId: {
            type: 'string',
            format: 'objectId',
            errorMessage: {
                type: `${VALIDATION_ERRORS.FORMAT} String`,
                format: `${VALIDATION_ERRORS.FORMAT} objectId`,
            },
        },
        config: sensorConfigSchema
    },
    required: ["measurementPointId", "jwtToken", 'sensorId', "config"],
    additionalProperties: false,
};

export const validateUpdateSensorConfigSchema = ajv.compile(sensorUpdateConfigSchema);