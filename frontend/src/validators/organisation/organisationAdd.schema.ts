
import { ajv, JSONSchemaType, VALIDATION_ERRORS, } from "../../ajv-validation/ajvInstance"
export interface OrganisationAddSchema {
    name: string,
    description?: string
}

const organisationAddSchema: JSONSchemaType<OrganisationAddSchema> = {
    type: 'object',
    properties: {
        name: {
            type: 'string',
            nullable: false,
            minLength: 5,
            maxLength: 255,
            errorMessage: {
                minLength: `${VALIDATION_ERRORS.MIN_LENGTH} 5 character`,
                maxLength: VALIDATION_ERRORS.MAX_LENGTH,
                type: `${VALIDATION_ERRORS.TYPE} String`,
            },
        },
        description: {
            type: 'string',
            nullable: true,
            // minLength: 5,
            maxLength: 511,
            errorMessage: {
                // minLength: `${VALIDATION_ERRORS.MIN_LENGTH} 5 character`,
                maxLength: `${VALIDATION_ERRORS.MAX_LENGTH} 511 characters`,
                type: `${VALIDATION_ERRORS.TYPE} String`,
            },
        },
    },
    required: ['name'],
    additionalProperties: false,
};

export const validateOrganisationAdd = ajv.compile(organisationAddSchema);