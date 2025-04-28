import { ajv, JSONSchemaType, VALIDATION_ERRORS, } from "../../ajv-validation/ajvInstance"

export interface GetMeasurementPointJwtToken {
    _id: string,
}

const getMeasurementPointJwtTokenSchema: JSONSchemaType<GetMeasurementPointJwtToken> = {
    type: 'object',
    properties: {
        _id: {
            type: 'string',
            format: 'objectId',
            errorMessage: {
                type: `${VALIDATION_ERRORS.FORMAT} ObjectId (Mongo)`,
            },
        },
    },
    required: ['_id'],
    additionalProperties: false,
};

export const validateMeasurementPointGetJwtToken = ajv.compile(getMeasurementPointJwtTokenSchema);