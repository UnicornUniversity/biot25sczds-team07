import { Response, NextFunction } from 'express';
import { parseErrors } from '../../errors/ajvError';

import { AuthorizationRequest } from '../../authorization/authorizeUser';
import { AddUser, validateUserAdd } from './userAdd.schema';

export interface UserAddRequest extends AuthorizationRequest {
    body: AddUser
}

export const userAddValidator = async (
    req: UserAddRequest,
    res: Response,
    next: NextFunction
) => {
    const isValid = validateUserAdd(req.body);
    if (!isValid && validateUserAdd.errors) { // If schema validation failed and error occured return with formatted error message 
        const error = await parseErrors(validateUserAdd.errors);
        res.status(400).json({ errorMap: { ...req.errorMap, ["invalidDtoIn"]: error } });
        return;
    }
    next(); // If no error occured proceed further
};