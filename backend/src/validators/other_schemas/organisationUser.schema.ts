import { JSONSchemaType } from "ajv";
import { VALIDATION_ERRORS } from "../../errors/errorMessages";
import { Policy } from "../../models/Organisation";
import { userPolicySchema } from "../user/userPolicy.schema";
export interface OrganisationUserSchema {
    policy: Policy,
    id: string,
}
export const organisationUserSchema: JSONSchemaType<OrganisationUserSchema> = {
    type: 'object',
    properties: {
        policy: userPolicySchema,
        id: {
            type: 'string',
            format: 'objectId',
            errorMessage: {
                type: `${VALIDATION_ERRORS.TYPE} string`,
                format: `${VALIDATION_ERRORS.FORMAT} ObjectId (Mongo)`,
            },
        },
    },
    required: ['policy', 'id'],
    additionalProperties: false,
}