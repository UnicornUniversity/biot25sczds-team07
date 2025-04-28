import { JSONSchemaType } from "ajv";
import { VALIDATION_ERRORS } from "../../errors/errorMessages";
import { Policy } from "../../models/Organisation";

export const userPolicySchema: JSONSchemaType<Policy> = {
    type: 'integer',
    enum: [Policy.Admin, Policy.Member],
    errorMessage: {
        type: `${VALIDATION_ERRORS.TYPE} integer`,
        enum: `${VALIDATION_ERRORS.ENUM} Policy (0 for Admin, 1 for Member)`,
    },
}