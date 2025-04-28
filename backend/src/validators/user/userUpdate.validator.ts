import { Response, NextFunction } from 'express';
import { parseErrors } from '../../errors/ajvError';

import { AuthorizationRequest } from '../../authorization/authorizeUser';
import { validateUserUpdate } from './userUpdate.schema';
import { UpdateUser } from '../../models/User';

export interface UserUpdateRequest extends AuthorizationRequest {
    body: UpdateUser
}

export const userUpdateValidator = async (
    req: UserUpdateRequest,
    res: Response,
    next: NextFunction
) => {
    const isValid = validateUserUpdate(req.body);
    if (!isValid && validateUserUpdate.errors) { // If schema validation failed and error occured return with formatted error message 
        const error = await parseErrors(validateUserUpdate.errors);
        res.status(400).json({ errorMap: { ...req.errorMap, ["invalidDtoIn"]: error } });
        return;
    }
    next(); // If no error occured proceed further
};