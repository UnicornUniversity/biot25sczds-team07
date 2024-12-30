import { Response, NextFunction } from 'express';
import { parseErrors } from '../../errors/ajvError';

import { AuthorizationRequest } from '../../authorization/authorizeUser';
import { UpdateMeasurementPoint, validateMeasurementPointUpdate } from './measurementPointUpdate.schema';

export interface MeasurementPointUpdateRequest extends AuthorizationRequest {
    body: UpdateMeasurementPoint
}

export const measurementPointUpdateValidator = async (
    req: MeasurementPointUpdateRequest,
    res: Response,
    next: NextFunction
) => {
    const isValid = validateMeasurementPointUpdate(req.body);
    if (!isValid && validateMeasurementPointUpdate.errors) { // If schema validation failed and error occured return with formatted error message 
        const error = await parseErrors(validateMeasurementPointUpdate.errors);
        res.status(400).json({ errorMap: { ...req.errorMap, ["invalidDtoIn"]: JSON.stringify(error) } });
        return;
    }
    next(); // If no error occured proceed further
};