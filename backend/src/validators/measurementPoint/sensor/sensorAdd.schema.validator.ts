import { Response, NextFunction } from 'express';
import { parseErrors } from '../../../errors/ajvError';
import { AuthorizationRequest } from '../../../authorization/authorizeUser';
import { AddSensor, valdiateAddSensorSchema } from './sensorAdd.schema';

export interface SensorAddRequest extends AuthorizationRequest {
    body: AddSensor
}

export const sensorAddValidator = async (
    req: SensorAddRequest,
    res: Response,
    next: NextFunction
) => {
    const isValid = valdiateAddSensorSchema(req.body);
    if (!isValid && valdiateAddSensorSchema.errors) { // If schema validation failed and error occured return with formatted error message 
        const error = await parseErrors(valdiateAddSensorSchema.errors);
        res.status(400).json({ errorMap: { ...req.errorMap, ["invalidDtoIn"]: error } });
        return;
    }
    next(); // If no error occured proceed further
};