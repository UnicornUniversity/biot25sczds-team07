import { ajv, JSONSchemaType, VALIDATION_ERRORS, } from "../../ajv-validation/ajvInstance"
import { Policy } from "../../models/Organisation";
import { userPolicySchema } from "./userPolicy.schema";
// import temperatureRangeSchema, { TemperatureRange } from "./temperatureRange.schema";


export interface AddUser {
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    role: Policy,
}

const userAddSchema: JSONSchemaType<AddUser> = {
    type: 'object',
    properties: {
        firstName: {
            type: 'string',
            nullable: false,
            minLength: 3,
            errorMessage: {
                minLength: `${VALIDATION_ERRORS.MIN_LENGTH} 3`,
                type: `${VALIDATION_ERRORS.TYPE} String`,
            },
        },
        lastName: {
            type: 'string',
            nullable: false,
            minLength: 3,
            errorMessage: {
                minLength: `${VALIDATION_ERRORS.MIN_LENGTH} 3`,
                type: `${VALIDATION_ERRORS.TYPE} String`,
            },
        },
        email: {
            type: 'string',
            format: 'email',
            nullable: false,
            errorMessage: {
                type: `${VALIDATION_ERRORS.TYPE} String (Email)`,
            },
        },
        password: {
            type: 'string',
            nullable: false,
            minLength: 3, // TODO - in production make higher
            errorMessage: {
                minLength: `${VALIDATION_ERRORS.MIN_LENGTH} 3`,
                type: `${VALIDATION_ERRORS.TYPE} String`,
            },
        },
        role: userPolicySchema,
    },
    required: ['firstName', 'lastName', 'email', 'password', 'role'],
    additionalProperties: false,
};

export const validateUserAdd = ajv.compile(userAddSchema);