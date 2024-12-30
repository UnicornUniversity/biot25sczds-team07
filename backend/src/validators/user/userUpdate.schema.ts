import { ajv, JSONSchemaType, VALIDATION_ERRORS, } from "../../ajv-validation/ajvInstance"
import { Policy } from "../../models/Organisation";
// import temperatureRangeSchema, { TemperatureRange } from "./temperatureRange.schema";


export interface UpdateUser {
    id: string
    firstName?: string,
    lastName?: string,
    email?: string,
    password?: string,
    role?: Policy,
}

const userUpdateSchema: JSONSchemaType<UpdateUser> = {
    type: 'object',
    properties: {
        id: {
            type: 'string',
            format: 'objectId',
            errorMessage: {
                type: `${VALIDATION_ERRORS.FORMAT} ObjectId (Mongo)`,
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
        password: {
            type: 'string',
            nullable: true,
            minLength: 15,
            errorMessage: {
                minLength: `${VALIDATION_ERRORS.MIN_LENGTH} 15`,
                type: `${VALIDATION_ERRORS.TYPE} String (Hash)`,
            },
        },
        role: {
            type: 'integer',
            enum: [0, 1],
            nullable: true,
            errorMessage: {
                type: `${VALIDATION_ERRORS.TYPE} integer`,
                enum: `${VALIDATION_ERRORS.ENUM} Policy (0 for Admin, 1 for User)`,
            },
        },
    },
    required: ['id'],
    additionalProperties: true,
};

export const validateUserUpdate = ajv.compile(userUpdateSchema);