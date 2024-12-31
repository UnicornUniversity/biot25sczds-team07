import { Response, NextFunction } from 'express';
import { parseErrors } from '../../errors/ajvError';

import { AuthorizationRequest } from '../../authorization/authorizeUser';
import { DataAdd, validateAddData, } from './dataAdd.schema';

export interface DataAddRequest extends AuthorizationRequest {
    body: DataAdd
}

export const dataAddValidator = async (
    req: DataAddRequest,
    res: Response,
    next: NextFunction
) => {
    const isValid = validateAddData(req.body);
    if (!isValid && validateAddData.errors) { // If schema validation failed and error occured return with formatted error message 
        const error = await parseErrors(validateAddData.errors);
        res.status(400).json({ errorMap: { ...req.errorMap, ["invalidDtoIn"]: JSON.stringify(error) } });
        return;
    }
    next(); // If no error occured proceed further
};