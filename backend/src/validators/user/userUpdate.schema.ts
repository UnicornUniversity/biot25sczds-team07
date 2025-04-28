import { ajv, JSONSchemaType, VALIDATION_ERRORS, } from "../../ajv-validation/ajvInstance"
import { UpdateUser } from "../../models/User";
import { userPolicySchema } from "./userPolicy.schema";

const userUpdateSchema: JSONSchemaType<UpdateUser> = {
    type: 'object',
    properties: {
        _id: {
            type: 'string',
            format: 'objectId',
            errorMessage: {
                format: `${VALIDATION_ERRORS.FORMAT} ObjectId (Mongo)`,
            },
        },
        firstName: {
            type: 'string',
            nullable: true,
            minLength: 3,
            errorMessage: {
                minLength: `${VALIDATION_ERRORS.MIN_LENGTH} 3`,
                type: `${VALIDATION_ERRORS.TYPE} String`,
            },
        },
        lastName: {
            type: 'string',
            nullable: true,
            minLength: 3,
            errorMessage: {
                minLength: `${VALIDATION_ERRORS.MIN_LENGTH} 3`,
                type: `${VALIDATION_ERRORS.TYPE} String`,
            },
        },
        email: {
            type: 'string',
            format: 'email',
            nullable: true,
            errorMessage: {
                type: `${VALIDATION_ERRORS.TYPE} String (Email)`,
            },
        },
        // password: {
        //     type: 'string',
        //     nullable: true,
        //     minLength: 15,
        //     errorMessage: {
        //         minLength: `${VALIDATION_ERRORS.MIN_LENGTH} 15`,
        //         type: `${VALIDATION_ERRORS.TYPE} String (Hash)`,
        //     },
        // },
        role: {
            ...userPolicySchema,
            nullable: true,
        },
    },
    required: ['_id'],
    additionalProperties: false,
};

export const validateUserUpdate = ajv.compile(userUpdateSchema);