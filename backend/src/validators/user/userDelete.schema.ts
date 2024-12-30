import { ajv, JSONSchemaType, VALIDATION_ERRORS, } from "../../ajv-validation/ajvInstance"

export interface DeleteUser {
    id: string,
}

const userDeleteSchema: JSONSchemaType<DeleteUser> = {
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

export const validateUserDelete = ajv.compile(userDeleteSchema);