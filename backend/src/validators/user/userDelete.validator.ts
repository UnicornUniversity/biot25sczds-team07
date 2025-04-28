import { Response, NextFunction } from 'express';
import { parseErrors } from '../../errors/ajvError';

import { AuthorizationRequest } from '../../authorization/authorizeUser';
import { DeleteUser, validateUserDelete } from './userDelete.schema';

export interface UserDeleteRequest extends AuthorizationRequest {
    body: DeleteUser
}

export const userDeleteValidator = async (
    req: UserDeleteRequest,
    res: Response,
    next: NextFunction
) => {
    const isValid = validateUserDelete(req.body);
    if (!isValid && validateUserDelete.errors) { // If schema validation failed and error occured return with formatted error message 
        const error = await parseErrors(validateUserDelete.errors);
        res.status(400).json({ errorMap: { ...req.errorMap, ["invalidDtoIn"]: error } });
        return;
    }
    next(); // If no error occured proceed further
};