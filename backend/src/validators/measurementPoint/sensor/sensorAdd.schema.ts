import { ajv, JSONSchemaType, VALIDATION_ERRORS, } from "../../../ajv-validation/ajvInstance"
import sensorConfigSchema from "./sensorConfig.schema";
import { MeasuredQuantity, SensorConfigurationDTO } from "../../../models/MeasurementPoint";

export interface AddSensor {
    measurementPointId: string,
    name: string,
    quantity: MeasuredQuantity,
    config: SensorConfigurationDTO,
}

export const addSensorScheme: JSONSchemaType<AddSensor> = {
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
        name: {
            type: 'string',
            minLength: 5,
            errorMessage: {
                minLength: `${VALIDATION_ERRORS.MIN_LENGTH} 5`,
                type: `${VALIDATION_ERRORS.TYPE} String`,
            },
        },
        quantity: {
            type: "string",
            enum: ["temperature", "acceleration"],
            errorMessage: {
                enum: `${VALIDATION_ERRORS.PATTERN} "temperature" or "acceleration"`,
                type: `${VALIDATION_ERRORS.TYPE} String`
            }
        },
        config: sensorConfigSchema,
    },
    required: ["measurementPointId", 'name', 'quantity', 'config'],
    additionalProperties: false,
};

export const valdiateAddSensorSchema = ajv.compile(addSensorScheme);