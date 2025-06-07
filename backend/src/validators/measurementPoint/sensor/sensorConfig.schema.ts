import { JSONSchemaType } from "ajv";
import { VALIDATION_ERRORS } from "../../../errors/errorMessages";
import { SensorConfigurationDTO } from "../../../models/MeasurementPoint";

const sensorConfigSchema: JSONSchemaType<SensorConfigurationDTO> = {
    type: 'object',
    properties: {
        sendInterval: {
            type: 'number',
            nullable: false,
            minimum: 60,
            maximum: 345_600, // 4 days in seconds
            errorMessage: {
                type: `${VALIDATION_ERRORS.TYPE} Number`,
                minimum: `${VALIDATION_ERRORS.MIN} 60 (seconds)`,
                maximum: `${VALIDATION_ERRORS.MAX} 86 400 (1 day)`,
            },
        },
        measureInterval: {
            type: 'number',
            nullable: false,
            minimum: 1,
            maximum: 86_400, // a day in seconds
            errorMessage: {
                type: `${VALIDATION_ERRORS.TYPE} Number`,
                minimum: `${VALIDATION_ERRORS.MIN} 60 (seconds)`,
                maximum: `${VALIDATION_ERRORS.MAX} 86 400 (1 day)`,
            },
        },
        temperatureLimits: {
            type: 'object',
            properties: {
                cooling: {
                    type: "number",
                    minimum: -100,
                    maximum: 300,
                    nullable: false,
                    errorMessage: {
                        type: `${VALIDATION_ERRORS.TYPE} Number`,
                        minimum: `${VALIDATION_ERRORS.MIN} -100°C`,
                        maximum: `${VALIDATION_ERRORS.MAX} 300°C`,
                    },
                },
                heating: {
                    type: "number",
                    minimum: -100,
                    maximum: 300,
                    nullable: false,
                    errorMessage: {
                        type: `${VALIDATION_ERRORS.TYPE} Number`,
                        minimum: `${VALIDATION_ERRORS.MIN} -100°C`,
                        maximum: `${VALIDATION_ERRORS.MAX} 300°C`,
                    },
                }
            },
            required: ['cooling', 'heating']
        }
    },
    required: ['sendInterval', 'measureInterval', 'temperatureLimits'],
    additionalProperties: false,
};

export default sensorConfigSchema;