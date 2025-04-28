import { Response, NextFunction } from 'express';
import { parseErrors } from '../../errors/ajvError';

import { AuthorizationRequest } from '../../authorization/authorizeUser';
import { GetMeasurementPointJwtToken, validateMeasurementPointGetJwtToken } from './measurementPointGetJwtToken.schema';

export interface MeasurementPointGetJwtTokenRequest extends AuthorizationRequest {
    body: GetMeasurementPointJwtToken
}

export const measurementPointGetJwtTokenValidator = async (
    req: MeasurementPointGetJwtTokenRequest,
    res: Response,
    next: NextFunction
) => {
    const isValid = validateMeasurementPointGetJwtToken(req.body);
    if (!isValid && validateMeasurementPointGetJwtToken.errors) { // If schema validation failed and error occured return with formatted error message 
        const error = await parseErrors(validateMeasurementPointGetJwtToken.errors);
        res.status(400).json({ errorMap: { ...req.errorMap, ["invalidDtoIn"]: error } });
        return;
    }
    next(); // If no error occured proceed further
};