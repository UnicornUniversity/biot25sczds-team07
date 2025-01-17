import { ajv, JSONSchemaType, VALIDATION_ERRORS, } from "../../ajv-validation/ajvInstance"
import { PageInfo, pageInfoSchema } from "../other_schemas/pageInfo.schema";

export interface MeasurementPointListSchema {
    organisationId: string,
    pageInfo: PageInfo,
    order?: "desc" | "asc"
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
            enum: ["desc", "asc"],
            nullable: true,
            errorMessage: {
                enum: `${VALIDATION_ERRORS.PATTERN} "desc" or "asc"`,
            },
        },
    },
    required: ['organisationId', 'pageInfo'],
    additionalProperties: false,
};

export const validateMeasurementPointList = ajv.compile(measurementPointListSchema);