import { ajv, JSONSchemaType, VALIDATION_ERRORS, } from "../../ajv-validation/ajvInstance"

export interface MeasurementPointRemoveSchema {
    id: string,
}

const measurementPointRemoveSchema: JSONSchemaType<MeasurementPointRemoveSchema> = {
    type: 'object',
    properties: {
        id: {
            type: 'string',
            format: 'objectId',
            errorMessage: {
                type: `${VALIDATION_ERRORS.FORMAT} ObjectId (Mongo)`,
            },
        },
    },
    required: ['id'],
    additionalProperties: false,
};

export const validateMeasurementPointDelete = ajv.compile(measurementPointRemoveSchema);