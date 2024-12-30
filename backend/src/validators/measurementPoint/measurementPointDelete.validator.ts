import { Response, NextFunction } from 'express';
import { parseErrors } from '../../errors/ajvError';

import { AuthorizationRequest } from '../../authorization/authorizeUser';
import { DeleteMeasurementPoint, validateMeasurementPointDelete } from './measurementPointDelete.schema';

export interface MeasurementPointDeleteRequest extends AuthorizationRequest {
    body: DeleteMeasurementPoint,
}

export const measurementPointDeleteValidator = async (
    req: AuthorizationRequest,
    res: Response,
    next: NextFunction
) => {
    const isValid = validateMeasurementPointDelete(req.body);
    if (!isValid && validateMeasurementPointDelete.errors) { // If schema validation failed and error occured return with formatted error message 
        const error = await parseErrors(validateMeasurementPointDelete.errors);
        res.status(400).json({ errorMap: { ...req.errorMap, ["invalidDtoIn"]: JSON.stringify(error) } });
        return;
    }
    next(); // If no error occured proceed further
};