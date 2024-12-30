import { JSONSchemaType } from "ajv";
import { VALIDATION_ERRORS } from "../../errors/errorMessages";
import temperatureRangeSchema from "./temperatureRange.schema";
import { Senzor } from "../../models/MeasurementPoint";


const sensorSchema: JSONSchemaType<Senzor> = {
    type: 'object',
    properties: {
        sensorId: {
            type: 'string',
            errorMessage: {
                type: `${VALIDATION_ERRORS.TYPE} String`
            }
        },
        name: {
            type: 'string',
            maxLength: 5,
            errorMessage: {
                maxLength: `${VALIDATION_ERRORS.MIN_LENGTH} 5`,
                type: `${VALIDATION_ERRORS.TYPE} String`,
            },
        },
        quantity: {
            type: "string",
            enum: ["temperature", "acceleration"],
            maxLength: 100,
            errorMessage: {
                enum: `${VALIDATION_ERRORS.PATTERN} "temperature" or "acceleration"`,
                maxLength: `${VALIDATION_ERRORS.MAX_LENGTH} 100`,
                type: `${VALIDATION_ERRORS.TYPE} String`
            }
        },
        config: {
            type: 'object',
            properties: {
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
        },

    },
    required: ['sensorId', 'name', 'quantity', 'config'],
    additionalProperties: false,
};

export default sensorSchema;