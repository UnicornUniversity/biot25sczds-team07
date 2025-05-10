import { ajv, AJV_PAGE_INFO_SCHEMA, JSONSchemaType, VALIDATION_ERRORS, } from "../../ajv-validation/ajvInstance"
import { Order, PageInfo } from "../other_schemas/pageInfo.schema";

export interface MeasurementPointListSchema {
    organisationId: string,
    pageInfo?: PageInfo,
    order?: Order
}

const measurementPointListSchema: JSONSchemaType<MeasurementPointListSchema> = {
    type: 'object',
    properties: {
        organisationId: {
            type: 'string',
            format: 'objectId',
            errorMessage: {
                type: `${VALIDATION_ERRORS.FORMAT} ObjectId (Mongo)`,
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
    required: ['organisationId'],
    additionalProperties: false,
};

export const validateMeasurementPointList = ajv.compile(measurementPointListSchema);