
import { ajv, JSONSchemaType, VALIDATION_ERRORS, } from "../../../ajv-validation/ajvInstance"

export interface SensorGetConfigSchema {
    measurementPointId: string,
    sensorId: string,
    jwtToken: string,
}

const sensorGetConfigSchema: JSONSchemaType<SensorGetConfigSchema> = {
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
    },
    required: ["measurementPointId", "jwtToken", 'sensorId'],
    additionalProperties: false,
};

export const validateSensorGetConfig = ajv.compile(sensorGetConfigSchema);
