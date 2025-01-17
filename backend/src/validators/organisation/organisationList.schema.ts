
import { ajv, JSONSchemaType, VALIDATION_ERRORS, } from "../../ajv-validation/ajvInstance"
import { PageInfo } from '../../helpers/commonTypes';
import { pageInfoSchema } from "../other_schemas/pageInfo.schema";

export interface OrganisationListSchema {
    pageInfo: PageInfo
    order?: "desc" | "asc" | null,
}

const organisationListSchema: JSONSchemaType<OrganisationListSchema> = {
    type: 'object',
    properties: {
        pageInfo: pageInfoSchema,
        order: {
            type: 'string',
            enum: ["desc", "asc"],
            nullable: true,
            errorMessage: {
                enum: `${VALIDATION_ERRORS.PATTERN} "desc" or "asc"`,
            },
        },
    },
    required: ["pageInfo"],
    additionalProperties: false,
};

export const validateOrganisationList = ajv.compile(organisationListSchema);