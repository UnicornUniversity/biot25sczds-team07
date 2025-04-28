import { ajv, JSONSchemaType, VALIDATION_ERRORS, } from "../../ajv-validation/ajvInstance"

export interface DeleteMeasurementPoint {
    organisationId: string,
    id: string,
}

const measurementPointRemoveSchema: JSONSchemaType<DeleteMeasurementPoint> = {
    type: 'object',
    properties: {
        id: {
            type: 'string',
            format: 'objectId',
            errorMessage: {
                type: `${VALIDATION_ERRORS.FORMAT} ObjectId (Mongo)`,
            },
        },
        organisationId: {
            type: 'string',
            format: 'objectId',
            errorMessage: {
                type: `${VALIDATION_ERRORS.FORMAT} ObjectId (Mongo)`,
            },
        },
    },
    required: ['id', 'organisationId'],
    additionalProperties: false,
};

export const validateMeasurementPointDelete = ajv.compile(measurementPointRemoveSchema);