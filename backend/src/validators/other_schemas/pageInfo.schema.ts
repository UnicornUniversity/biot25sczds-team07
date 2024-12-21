import { JSONSchemaType } from "ajv";
import { VALIDATION_ERRORS } from "../../errors/errorMessages";

export type PageInfo = {
    pageIndex: number,
    pageSize: number
}

export const pageInfoSchema: JSONSchemaType<PageInfo> = {
    type: 'object',
    properties: {
        pageIndex: {
            type: 'number',
            minimum: 0,
            errorMessage: {
                type: `${VALIDATION_ERRORS.TYPE} Number`,
            },
        },
        pageSize: {
            type: 'number',
            minimum: 1,
            maximum: 100,
            errorMessage: {
                type: `${VALIDATION_ERRORS.TYPE} Number`,
            },
        },
    },
    required: ['pageIndex', 'pageSize'],
    additionalProperties: false,
}
