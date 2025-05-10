
import { ajv, AJV_PAGE_INFO_SCHEMA, JSONSchemaType, VALIDATION_ERRORS, } from "../../ajv-validation/ajvInstance"
import { Order, PageInfo } from "../other_schemas/pageInfo.schema";

export interface UserListSchema {
    findEmailString: string,
    pageInfo?: PageInfo
    order?: Order,
}

const userListSchema: JSONSchemaType<UserListSchema> = {
    type: 'object',
    properties: {
        findEmailString: {
            type: 'string',
            minLength: 3,
            errorMessage: {
                minLength: `${VALIDATION_ERRORS.MIN_LENGTH} 3`,
            },
        },
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
    required: ["findEmailString"],
    additionalProperties: false,
};

export const validateUserList = ajv.compile(userListSchema);