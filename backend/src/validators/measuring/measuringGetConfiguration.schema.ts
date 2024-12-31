
import { ajv, JSONSchemaType, VALIDATION_ERRORS, } from "../../ajv-validation/ajvInstance"

export interface MeasuringGetConfigurationSchema {
    [key: string]: string,
    sensorId: string,
}

const measuringGetConfigurationSchema: JSONSchemaType<MeasuringGetConfigurationSchema> = {
    type: 'object',
    properties: {
        sensorId: {
            type: 'string',
            format: 'uuid',
            errorMessage: {
                type: `${VALIDATION_ERRORS.TYPE} String`,
                format: `${VALIDATION_ERRORS.FORMAT} UUID`
            },
        },
    },
    required: ['sensorId'],
    additionalProperties: false,
};

export const validateMeasuringGetConfiguration = ajv.compile(measuringGetConfigurationSchema);