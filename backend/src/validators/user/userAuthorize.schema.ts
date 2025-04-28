import { ajv, JSONSchemaType, VALIDATION_ERRORS, } from "../../ajv-validation/ajvInstance"

export interface AuthorizeUser {
    email?: string,
    password?: string,
    token?: string,
}

const userAuthorizeSchema: JSONSchemaType<AuthorizeUser> = {
    type: 'object',
    properties: {
        email: {
            type: 'string',
            format: 'email',
            nullable: true,
            errorMessage: {
                type: `${VALIDATION_ERRORS.TYPE} String (Email)`,
            },
        },
        password: {
            type: 'string',
            nullable: true,
            errorMessage: {
                type: `${VALIDATION_ERRORS.TYPE} String (Hash)`,
            },
        },
        token: {
            type: 'string',
            nullable: true,
            errorMessage: {
                type: `${VALIDATION_ERRORS.TYPE} String (JWT token)`,
            },
        },
    },
    additionalProperties: false,
};

export const validateUserAuthorize = ajv.compile(userAuthorizeSchema);