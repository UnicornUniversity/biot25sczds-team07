import { JSONSchemaType } from "ajv";
import { VALIDATION_ERRORS } from "../../errors/errorMessages";
import { OrganisationUser } from "../../models/Organisation";

export const organisationUserSchema: JSONSchemaType<OrganisationUser> = {
    type: 'object',
    properties: {
        policy: {
            type: 'integer',
            enum: [0, 1],
            errorMessage: {
                type: `${VALIDATION_ERRORS.TYPE} integer`,
                enum: `${VALIDATION_ERRORS.ENUM} Policy (0 for Admin, 1 for Member)`,
            },
        },
        id: {
            type: 'string',
            format: 'objectId',
            errorMessage: {
                type: `${VALIDATION_ERRORS.TYPE} string`,
                format: `${VALIDATION_ERRORS.FORMAT} ObjectId (Mongo)`,
            },
        },
    },
    required: ['policy', 'id'],
    additionalProperties: false,
    // errorMessage: {
    // required: {
    //     policy: `${VALIDATION_ERRORS.REQUIRED} policy`,
    //     id: `${VALIDATION_ERRORS.REQUIRED} id`,
    // },
    // additionalProperties: `${VALIDATION_ERRORS.ADDITIONAL_PROPERTIES} not allowed`,
    // }
}