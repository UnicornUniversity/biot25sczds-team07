import { Response, NextFunction } from 'express';
import { parseErrors } from '../../errors/ajvError';

import { MpAuthorizationRequest } from '../../authorization/authorizeMeasurementPoint';
import { DataGet, validateGetData } from './dataGet.schema';

export interface DataGetRequest extends MpAuthorizationRequest {
    body: DataGet
}

export const dataGetValidator = async (
    req: DataGetRequest,
    res: Response,
    next: NextFunction
) => {
    const isValid = validateGetData(req.body);
    if (!isValid && validateGetData.errors) { // If schema validation failed and error occured return with formatted error message 
        const error = await parseErrors(validateGetData.errors);
        res.status(400).json({ errorMap: { ...req.errorMap, ["invalidDtoIn"]: error } });
        return;
    }
    next(); // If no error occured proceed further
};