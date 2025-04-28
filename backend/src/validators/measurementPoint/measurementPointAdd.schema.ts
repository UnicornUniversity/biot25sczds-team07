import { ajv, JSONSchemaType, VALIDATION_ERRORS, } from "../../ajv-validation/ajvInstance"
// import temperatureRangeSchema, { TemperatureRange } from "./temperatureRange.schema";

export interface AddMeasurementPoint {
    organisationId: string,
    name: string,
    description?: string,
}

const measurementPointSchema: JSONSchemaType<AddMeasurementPoint> = {
    type: 'object',
    properties: {
        organisationId: {
            type: 'string',
            format: 'objectId',
            errorMessage: {
                type: `${VALIDATION_ERRORS.FORMAT} ObjectId (Mongo)`,
            },
        },
        name: {
            type: 'string',
            nullable: false,
            minLength: 5,
            errorMessage: {
                minLength: `${VALIDATION_ERRORS.MIN_LENGTH} 5`,
                type: `${VALIDATION_ERRORS.TYPE} String`,
            },
        },
        description: {
            type: 'string',
            nullable: true,
            errorMessage: {
                type: `${VALIDATION_ERRORS.TYPE} String`,
            },
        },
        // interval: {
        //     type: 'number',
        //     nullable: false,
        //     minimum: 60,
        //     maximum: 86_400, // a day in seconds
        //     errorMessage: {
        //         type: `${VALIDATION_ERRORS.TYPE} Number`,
        //         minimum: `${VALIDATION_ERRORS.MIN} 60 (seconds)`,
        //         maximum: `${VALIDATION_ERRORS.MAX} 86 400 (1 day)`,
        //     },
        // },
    },
    required: ['organisationId', 'name'],
    additionalProperties: false,
};

export const validateMeasurementPointAdd = ajv.compile(measurementPointSchema);