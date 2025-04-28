import { Response, NextFunction } from 'express';
import { parseErrors } from '../../../errors/ajvError';
import { AuthorizationRequest } from '../../../authorization/authorizeUser';
import { SensorUpdateConfigSchema, validateUpdateSensorConfigSchema } from './sensorUpdateConfig.schema';

export interface SensorUpdateConfigRequest extends AuthorizationRequest {
    body: SensorUpdateConfigSchema
}

export const sensorUpdateConfigValidator = async (
    req: SensorUpdateConfigRequest,
    res: Response,
    next: NextFunction
) => {
    const isValid = validateUpdateSensorConfigSchema(req.body);
    if (!isValid && validateUpdateSensorConfigSchema.errors) { // If schema validation failed and error occured return with formatted error message 
        const error = await parseErrors(validateUpdateSensorConfigSchema.errors);
        res.status(400).json({ errorMap: { ...req.errorMap, ["invalidDtoIn"]: error } });
        return;
    }
    next(); // If no error occured proceed further
};