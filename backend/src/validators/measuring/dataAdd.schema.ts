import { ajv, JSONSchemaType, VALIDATION_ERRORS, } from "../../ajv-validation/ajvInstance"
import { TemperatureData } from "../../models/Data";
import temperatureDataSchema from "../other_schemas/temperatureData.scheme";

export interface DataAdd {
    sensorId: string,
    tempData: TemperatureData[],
}

const dataAddScheme: JSONSchemaType<DataAdd> = {
    type: 'object',
    properties: {
        sensorId: {
            type: 'string',
            format: 'uuid',
            errorMessage: {
                type: `${VALIDATION_ERRORS.FORMAT} String`,
                format: `${VALIDATION_ERRORS.FORMAT} UUID`,
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
    required: ['sensorId', 'tempData'],
    additionalProperties: false,
};

export const validateAddData = ajv.compile(dataAddScheme);