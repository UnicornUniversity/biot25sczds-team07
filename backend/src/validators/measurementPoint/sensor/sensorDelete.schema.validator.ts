import { Response, NextFunction } from 'express';
import { parseErrors } from '../../../errors/ajvError';
import { AuthorizationRequest } from '../../../authorization/authorizeUser';
import { SensorDeleteSchema, validateDeleteSensorSchema } from './sensorDelete.schema';

export interface SensorDeleteRequest extends AuthorizationRequest {
    body: SensorDeleteSchema
}

export const sensorDeleteValidator = async (
    req: SensorDeleteRequest,
    res: Response,
    next: NextFunction
) => {
    const isValid = validateDeleteSensorSchema(req.body);
    if (!isValid && validateDeleteSensorSchema.errors) { // If schema validation failed and error occured return with formatted error message 
        const error = await parseErrors(validateDeleteSensorSchema.errors);
        res.status(400).json({ errorMap: { ...req.errorMap, ["invalidDtoIn"]: error } });
        return;
    }
    next(); // If no error occured proceed further
};