import { JSONSchemaType } from "ajv";
import { VALIDATION_ERRORS } from "../../errors/errorMessages";
import { TemperatureData } from "../../models/Data";

const temperatureDataSchema: JSONSchemaType<TemperatureData> = {
    type: 'object',
    properties: {
        dateTime: {
            type: 'string',
            format: 'date-time',
            errorMessage: {
                type: `${VALIDATION_ERRORS.TYPE} String`,
                format: `${VALIDATION_ERRORS.FORMAT} Date-Time`,
            },
        },
        epoch: {
            type: 'number',
            minimum: 1,
            errorMessage: {
                type: `${VALIDATION_ERRORS.TYPE} Number`,
                minimum: `${VALIDATION_ERRORS.MIN} 1(sec) - Unix/Epoch time`
            },
        },
        temperature: {
            type: 'number',
            minimum: -20,
            maximum: 80,
            errorMessage: {
                type: `${VALIDATION_ERRORS.TYPE} Number`,
                minimum: `${VALIDATION_ERRORS.MIN} -20`,
                maximum: `${VALIDATION_ERRORS.MAX} 80`
            },
        },
    },
    required: ['dateTime', 'epoch', 'temperature'],
    additionalProperties: false,
};

export default temperatureDataSchema;