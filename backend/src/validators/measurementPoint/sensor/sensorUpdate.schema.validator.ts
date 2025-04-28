import { Response, NextFunction } from 'express';
import { parseErrors } from '../../../errors/ajvError';
import { AuthorizationRequest } from '../../../authorization/authorizeUser';
import { SensorUpdateSchema, validateUpdateSensorSchema } from './sensorUpdate.schema';

export interface SensorUpdateRequest extends AuthorizationRequest {
    body: SensorUpdateSchema
}

export const sensorUpdateValidator = async (
    req: SensorUpdateRequest,
    res: Response,
    next: NextFunction
) => {
    const isValid = validateUpdateSensorSchema(req.body);
    if (!isValid && validateUpdateSensorSchema.errors) { // If schema validation failed and error occured return with formatted error message 
        const error = await parseErrors(validateUpdateSensorSchema.errors);
        res.status(400).json({ errorMap: { ...req.errorMap, ["invalidDtoIn"]: error } });
        return;
    }
    next(); // If no error occured proceed further
};