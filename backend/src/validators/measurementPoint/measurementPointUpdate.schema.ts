import { ajv, JSONSchemaType, VALIDATION_ERRORS, } from "../../ajv-validation/ajvInstance"

export interface UpdateMeasurementPoint {
    id: string,
    name?: string,
    description?: string,
}

const measurementPointUpdateSchema: JSONSchemaType<UpdateMeasurementPoint> = {
    type: 'object',
    properties: {
        id: {
            type: 'string',
            format: 'objectId',
            errorMessage: {
                type: `${VALIDATION_ERRORS.FORMAT} ObjectId (Mongo)`,
            },
        },
        name: {
            type: 'string',
            nullable: true,
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
    },
    required: ['id'],
    additionalProperties: false,
};

export const validateMeasurementPointUpdate = ajv.compile(measurementPointUpdateSchema);