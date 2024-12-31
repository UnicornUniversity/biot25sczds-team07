import { JSONSchemaType } from "ajv";
import { VALIDATION_ERRORS } from "../../errors/errorMessages";
import temperatureRangeSchema from "./temperatureRange.schema";
import { SenzorConfiguration } from "../../models/MeasurementPoint";


const sensorConfigSchema: JSONSchemaType<SenzorConfiguration> = {
    type: 'object',
    properties: {
        epochCreated: {
            type: 'number',
            nullable: false,
            minimum: 1,
            errorMessage: {
                type: `${VALIDATION_ERRORS.TYPE} Number`,
                minimum: `${VALIDATION_ERRORS.MIN} 1sec - Unix/Epoch time`,
            },
        },
        interval: {
            type: 'number',
            nullable: false,
            minimum: 60,
            maximum: 86_400, // a day in seconds
            errorMessage: {
                type: `${VALIDATION_ERRORS.TYPE} Number`,
                minimum: `${VALIDATION_ERRORS.MIN} 60 (seconds)`,
                maximum: `${VALIDATION_ERRORS.MAX} 86 400 (1 day)`,
            },
        },
        temperatureLimits: {
            type: 'object',
            properties: {
                cooling: temperatureRangeSchema,
                idle: temperatureRangeSchema,
                heating: temperatureRangeSchema,
            },
            required: ['cooling', 'heating', 'idle']
        }
    },
    required: ['interval', 'temperatureLimits'],
    additionalProperties: false,
};

export default sensorConfigSchema;