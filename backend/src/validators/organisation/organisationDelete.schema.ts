import { ajv, JSONSchemaType, VALIDATION_ERRORS, } from "../../ajv-validation/ajvInstance"
export interface OrganisationDeleteSchema {
    id: string,
}

const organisationDeleteSchema: JSONSchemaType<OrganisationDeleteSchema> = {
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

export const validateOrganisationDelete = ajv.compile(organisationDeleteSchema);