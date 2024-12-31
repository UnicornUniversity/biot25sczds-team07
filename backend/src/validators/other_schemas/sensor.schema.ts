import { JSONSchemaType } from "ajv";
import { VALIDATION_ERRORS } from "../../errors/errorMessages";
import { Senzor } from "../../models/MeasurementPoint";
import sensorConfigSchema from "./sensorConfig.schema";


const sensorSchema: JSONSchemaType<Senzor> = {
    type: 'object',
    properties: {
        sensorId: {
            type: 'string',
            format: 'uuid',
            errorMessage: {
                type: `${VALIDATION_ERRORS.TYPE} String`,
                format: `${VALIDATION_ERRORS.FORMAT} UUID`,
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
        config: sensorConfigSchema,
    },
    required: ['sensorId', 'name', 'quantity', 'config'],
    additionalProperties: false,
};

export default sensorSchema;