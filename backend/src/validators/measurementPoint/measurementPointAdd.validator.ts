import { Response, NextFunction } from 'express';
import { parseErrors } from '../../errors/ajvError';

import { AuthorizationRequest } from '../../authorization/authorizeUser';
import { AddMeasurementPoint, validateMeasurementPointAdd } from './measurementPointAdd.schema';

export interface MeasurementPointAddRequest extends AuthorizationRequest {
    body: AddMeasurementPoint
}

export const measurementPointAddValidator = async (
    req: MeasurementPointAddRequest,
    res: Response,
    next: NextFunction
) => {
    const isValid = validateMeasurementPointAdd(req.body);
    if (!isValid && validateMeasurementPointAdd.errors) { // If schema validation failed and error occured return with formatted error message 
        const error = await parseErrors(validateMeasurementPointAdd.errors);
        res.status(400).json({ errorMap: { ...req.errorMap, ["invalidDtoIn"]: error } });
        return;
    }
    next(); // If no error occured proceed further
};