
import { ajv, JSONSchemaType, VALIDATION_ERRORS, } from "../../ajv-validation/ajvInstance"

export interface OrganisationGetSchema {
    id: string,
}

const organisationGetSchema: JSONSchemaType<OrganisationGetSchema> = {
    type: 'object',
    properties: {
        id: {
            type: 'string',
            format: 'objectId',
            errorMessage: {
                type: `${VALIDATION_ERRORS.TYPE} String`,
                format: `${VALIDATION_ERRORS.FORMAT} ObjectId (Mongo)`,
            },
        },
    },
    required: ['id'],
    additionalProperties: false,
};

export const validateOrganisationGet = ajv.compile(organisationGetSchema);