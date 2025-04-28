
import { ajv, JSONSchemaType, VALIDATION_ERRORS, } from "../../../ajv-validation/ajvInstance"

export interface SensorDeleteSchema {
    measurementPointId: string,
    sensorId: string,
}

const sensorDeleteSchema: JSONSchemaType<SensorDeleteSchema> = {
    type: 'object',
    properties: {
        measurementPointId: {
            type: 'string',
            format: 'objectId',
            errorMessage: {
                type: `${VALIDATION_ERRORS.TYPE} String`,
                format: `${VALIDATION_ERRORS.FORMAT} objectId`
            },
        },
        sensorId: {
            type: 'string',
            format: 'objectId',
            errorMessage: {
                type: `${VALIDATION_ERRORS.TYPE} String`,
                format: `${VALIDATION_ERRORS.FORMAT} objectId`
            },
        },
    },
    required: ["measurementPointId", 'sensorId'],
    additionalProperties: false,
};

export const validateDeleteSensorSchema = ajv.compile(sensorDeleteSchema);