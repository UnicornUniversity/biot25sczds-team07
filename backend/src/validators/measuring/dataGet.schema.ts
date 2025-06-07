
import { ajv, JSONSchemaType, VALIDATION_ERRORS, } from "../../ajv-validation/ajvInstance"

export interface DataGet {
    fromEpoch: number,
    toEpoch: number,
    measurementPointId: string,
    sensorId?: string;
}

const dataGetSchema: JSONSchemaType<DataGet> = {
    type: 'object',
    properties: {
        fromEpoch: {
            type: 'number',
            minimum: 1,
            errorMessage: {
                type: `${VALIDATION_ERRORS.TYPE} Number`,
            },
        },
        toEpoch: {
            type: 'number',
            minimum: 2,
            errorMessage: {
                type: `${VALIDATION_ERRORS.TYPE} Number`,
            },
        },
        measurementPointId: {
            type: 'string',
            format: 'objectId',
            errorMessage: {
                type: `${VALIDATION_ERRORS.FORMAT} String`,
                format: `${VALIDATION_ERRORS.FORMAT} objectId`,
            },
        },
        sensorId: {
            type: 'string',
            format: 'objectId',
            nullable: true, // sensorId is optional
            errorMessage: {
                type: `${VALIDATION_ERRORS.FORMAT} String`,
                format: `${VALIDATION_ERRORS.FORMAT} objectId`,
            },
        },
    },
    required: ["fromEpoch", "toEpoch", "measurementPointId"],
    additionalProperties: false,
};

export const validateGetData = ajv.compile(dataGetSchema);