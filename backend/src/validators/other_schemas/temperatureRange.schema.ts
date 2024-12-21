import { JSONSchemaType } from "ajv";
import { VALIDATION_ERRORS } from "../../errors/errorMessages";

export type TemperatureRange = { min: number, max: number };

const temperatureRangeSchema: JSONSchemaType<TemperatureRange> = {
    type: 'object',
    properties: {
        min: {
            type: 'number',
            minimum: -100, // Adjust the minimum value as needed
            errorMessage: {
                minimum: `${VALIDATION_ERRORS.MIN} -100`,
                type: `${VALIDATION_ERRORS.TYPE} Number`,
            },
        },
        max: {
            type: 'number',
            maximum: 100, // Adjust the maximum value as needed
            errorMessage: {
                maximum: `${VALIDATION_ERRORS.MAX} 100`,
                type: `${VALIDATION_ERRORS.TYPE} Number`,
            },
        },
    },
    required: ['min', 'max'],
    additionalProperties: false,
};

export default temperatureRangeSchema;