
import { ajv, JSONSchemaType, VALIDATION_ERRORS, } from "../../../ajv-validation/ajvInstance"
import { MeasuredQuantity, SensorConfigurationDTO } from "../../../models/MeasurementPoint";
import sensorConfigSchema from "./sensorConfig.schema";

export interface SensorUpdateSchema {
    measurementPointId: string,
    sensorId: string,
    name?: string,
    quantity?: MeasuredQuantity,
    config?: SensorConfigurationDTO,
}

const sensorUpdateSchema: JSONSchemaType<SensorUpdateSchema> = {
    type: 'object',
    properties: {
        measurementPointId: {
            type: 'string',
            format: 'objectId',
            errorMessage: {
                type: `${VALIDATION_ERRORS.TYPE} String`,
                format: `${VALIDATION_ERRORS.FORMAT} objectId`
            },
        },
        sensorId: {
            type: 'string',
            format: 'objectId',
            errorMessage: {
                type: `${VALIDATION_ERRORS.TYPE} String`,
                format: `${VALIDATION_ERRORS.FORMAT} objectId`
            },
        },
        name: {
            type: 'string',
            nullable: true,
            minLength: 3,
            maxLength: 200,
            errorMessage: {
                type: `${VALIDATION_ERRORS.TYPE} String`,
                minLength: `${VALIDATION_ERRORS.MIN_LENGTH} 3 character`,
                maxLength: `${VALIDATION_ERRORS.MAX_LENGTH} 200 characters`,
            },
        },
        quantity: {
            type: 'string',
            nullable: true,
            enum: ["temperature", "acceleration"],
            errorMessage: {
                type: `${VALIDATION_ERRORS.TYPE} String`,
                enum: `${VALIDATION_ERRORS.ENUM} ${["temperature", "acceleration"].join(",")}`,
            },
        },
        config: {
            ...sensorConfigSchema,
            nullable: true,
        }
    },
    required: ["measurementPointId", 'sensorId'],
    additionalProperties: false,
};

export const validateUpdateSensorSchema = ajv.compile(sensorUpdateSchema);