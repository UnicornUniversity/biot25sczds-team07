import { Response, NextFunction } from 'express';
import { parseErrors } from '../../errors/ajvError';

import { MeasurementPointListSchema, validateMeasurementPointList } from './measurementPointList.schema';
import { AuthorizationRequest } from '../../authorization/authorizeUser';

export interface MeasurementPointListRequest extends AuthorizationRequest {
    body: MeasurementPointListSchema
}

export const measurementPointListValidator = async (
    req: MeasurementPointListRequest,
    res: Response,
    next: NextFunction
) => {
    const isValid = validateMeasurementPointList(req.body);
    if (!isValid && validateMeasurementPointList.errors) { // If schema validation failed and error occured return with formatted error message 
        const error = await parseErrors(validateMeasurementPointList.errors);
        res.status(400).json({ errorMap: { ...req.errorMap, ["invalidDtoIn"]: error } });
        return;
    }
    next(); // If no error occured proceed further
};