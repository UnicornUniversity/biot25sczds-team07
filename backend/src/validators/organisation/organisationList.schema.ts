
import { ajv, AJV_PAGE_INFO_SCHEMA, JSONSchemaType, VALIDATION_ERRORS, } from "../../ajv-validation/ajvInstance"
import { Order, PageInfo } from "../other_schemas/pageInfo.schema";

export interface OrganisationListSchema {
    pageInfo?: PageInfo
    order?: Order,
}

const organisationListSchema: JSONSchemaType<OrganisationListSchema> = {
    type: 'object',
    properties: {
        pageInfo: {
            $ref: AJV_PAGE_INFO_SCHEMA, // Reference the registered schema
        },
        order: {
            type: 'string',
            enum: ["desc", "asc"],
            nullable: true,
            errorMessage: {
                enum: `${VALIDATION_ERRORS.PATTERN} "desc" or "asc"`,
            },
        },
    },
    required: [],
    additionalProperties: false,
};

export const validateOrganisationList = ajv.compile(organisationListSchema);