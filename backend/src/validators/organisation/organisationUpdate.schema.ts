
import { ajv, JSONSchemaType, VALIDATION_ERRORS, } from "../../ajv-validation/ajvInstance"
import { OrganisationUser } from "../../models/Organisation";
import { organisationUserSchema } from "../other_schemas/organisationUser.schema";
export interface OrganisationUpdateSchema {
    id: string,
    name?: string,
    description?: string,
    users?: OrganisationUser[],
}

const organisationUpdateSchema: JSONSchemaType<OrganisationUpdateSchema> = {
    type: 'object',
    properties: {
        id: {
            type: 'string',
            format: 'objectId',
            errorMessage: {
                type: `${VALIDATION_ERRORS.FORMAT} ObjectId (Mongo)`,
            },
        },
        name: {
            type: 'string',
            nullable: true,
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
        users: {
            type: 'array',
            items: organisationUserSchema,
            nullable: true,
            errorMessage: {
                type: `${VALIDATION_ERRORS.TYPE} Array<OrganisationUser>`,
            },
        },
    },
    required: ['id'],
    additionalProperties: false,
};

export const validateOrganisationUpdate = ajv.compile(organisationUpdateSchema);