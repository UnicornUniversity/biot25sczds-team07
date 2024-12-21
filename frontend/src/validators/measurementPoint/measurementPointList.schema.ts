import { ajv, JSONSchemaType, VALIDATION_ERRORS, } from "../../ajv-validation/ajvInstance"
import { PageInfo, pageInfoSchema } from "../other_schemas/pageInfo.schema";

export interface MeasurementPointListSchema {
    organisationId: string,
    pageInfo: PageInfo,
    order?: "decs" | "asc"
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
    required: ['organisationId', 'pageInfo'],
    additionalProperties: false,
};

export const validateMeasurementPointList = ajv.compile(measurementPointListSchema);