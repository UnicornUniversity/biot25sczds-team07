import { JSONSchemaType } from "ajv";
import { TemperatureData } from "../../models/Data";
import { SensorState } from "../../types/customTypes";


const VALIDATION_ERRORS = {
    TYPE: "Invalid type:",
    MIN: "Value is below minimum:",
    MAX: "Value is above maximum:"
};

const temperatureDataSchema: JSONSchemaType<TemperatureData> = {
    type: 'object',
    properties: {
        timeStamp: {
            type: 'number',
            minimum: 1,
            errorMessage: {
                type: `${VALIDATION_ERRORS.TYPE} Number`,
                minimum: `${VALIDATION_ERRORS.MIN} 1 (sec) - Unix/Epoch time`
            },
        },
        temperature: {
            type: 'number',
            minimum: -20,
            maximum: 80,
            errorMessage: {
                type: `${VALIDATION_ERRORS.TYPE} Number`,
                minimum: `${VALIDATION_ERRORS.MIN} -20`,
                maximum: `${VALIDATION_ERRORS.MAX} 80`
            },
        },
        state: {
            type: "number",
            enum: [SensorState.COOLING, SensorState.HEATING, SensorState.IDLE],
            errorMessage: {
                type: `${VALIDATION_ERRORS.TYPE} Enum`,
                enum: `Invalid state value`
            }
        }
    },
    required: ['timeStamp', 'temperature', 'state'],
    additionalProperties: false,
    errorMessage: {
        type: "Invalid data type",
        required: {
            timeStamp: "timeStamp is required",
            temperature: "temperature is required",
            state: "state is required"
        },
        additionalProperties: "No additional properties allowed"
    }
};

export default temperatureDataSchema;
