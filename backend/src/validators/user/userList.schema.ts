
import { ajv, JSONSchemaType, VALIDATION_ERRORS, } from "../../ajv-validation/ajvInstance"
import { PageInfo } from '../../helpers/commonTypes';
import { pageInfoSchema } from "../other_schemas/pageInfo.schema";

export interface UserListSchema {
    findEmailString: string,
    pageInfo: PageInfo
    order?: "decs" | "asc" | null,
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
        pageInfo: pageInfoSchema,
        order: {
            type: 'string',
            enum: ["decs", "asc"],
            nullable: true,
            errorMessage: {
                enum: `${VALIDATION_ERRORS.PATTERN} "decs" or "asc"`,
            },
        },
    },
    required: ["findEmailString", "pageInfo"],
    additionalProperties: false,
};

export const validateUserList = ajv.compile(userListSchema);