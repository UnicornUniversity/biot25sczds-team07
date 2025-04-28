import { Response, NextFunction } from 'express';

import { parseErrors } from '../../../errors/ajvError';

import { AuthorizationRequest } from '../../../authorization/authorizeUser';
import { SensorGetConfigSchema, validateSensorGetConfig } from './sensorGetConfig.schema';

export interface SensorGetConfigurationRequest extends AuthorizationRequest {
    body: SensorGetConfigSchema;
}

export const sensorGetConfigValidator = async (
    req: SensorGetConfigurationRequest,
    res: Response,
    next: NextFunction
) => {
    console.log("validating sensorGetConfig");
    const isValidParams = validateSensorGetConfig(req.body);
    if (!isValidParams && validateSensorGetConfig.errors) { // If schema validation failed and error occured return with formatted error message 
        const error = await parseErrors(validateSensorGetConfig.errors);
        res.status(400).json({ errorMap: { ...req.errorMap, ["invalidParams"]: error } });
        return;
    }

    next(); // If no error occured proceed further
};