
import { ajv, JSONSchemaType, VALIDATION_ERRORS, } from "../../ajv-validation/ajvInstance"
import { SenzorConfiguration } from "../../models/MeasurementPoint";
import sensorConfigSchema from "../other_schemas/sensorConfig.schema";

export interface MeasuringUpdateConfigurationSchema {
    sensorId: string,
    config: SenzorConfiguration
}

const measuringUpdateConfigurationSchema: JSONSchemaType<MeasuringUpdateConfigurationSchema> = {
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
        config: sensorConfigSchema
    },
    required: ['sensorId', 'config'],
    additionalProperties: false,
};

export const validateMeasuringUpdateConfiguration = ajv.compile(measuringUpdateConfigurationSchema);