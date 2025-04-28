import { ajv, JSONSchemaType, VALIDATION_ERRORS, } from "../../ajv-validation/ajvInstance"
import { TemperatureData } from "../../models/Data";
import temperatureDataSchema from "../other_schemas/temperatureData.scheme";

export interface DataAdd {
    measurementPointId: string,
    jwtToken: string,
    sensorId: string,
    tempData: TemperatureData[],
}

const dataAddScheme: JSONSchemaType<DataAdd> = {
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
        tempData: {
            type: 'array',
            items: temperatureDataSchema,
            errorMessage: {
                type: `${VALIDATION_ERRORS.TYPE} Array`,
            },
        },
    },
    required: ["measurementPointId", "jwtToken", 'sensorId', 'tempData'],
    additionalProperties: false,
};

export const validateAddData = ajv.compile(dataAddScheme);