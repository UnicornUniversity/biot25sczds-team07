import { ajv, JSONSchemaType, VALIDATION_ERRORS, } from "../../ajv-validation/ajvInstance"
import { Policy } from "../../models/Organisation";
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
            minLength: 15,
            errorMessage: {
                minLength: `${VALIDATION_ERRORS.MIN_LENGTH} 15`,
                type: `${VALIDATION_ERRORS.TYPE} String (Hash)`,
            },
        },
        role: {
            type: 'integer',
            enum: [0, 1],
            errorMessage: {
                type: `${VALIDATION_ERRORS.TYPE} integer`,
                enum: `${VALIDATION_ERRORS.ENUM} Policy (0 for Admin, 1 for User)`,
            },
        },
    },
    required: ['firstName', 'lastName', 'email', 'password', 'role'],
    additionalProperties: false,
};

export const validateUserAdd = ajv.compile(userAddSchema);