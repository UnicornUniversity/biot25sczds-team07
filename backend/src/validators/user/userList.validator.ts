import { Response, NextFunction } from 'express';
import { parseErrors } from '../../errors/ajvError';

import { AuthorizationRequest } from '../../authorization/authorizeUser';
import { UserListSchema, validateUserList } from './userList.schema';

export interface UserListRequest extends AuthorizationRequest {
    body: UserListSchema
}


export const userListValidator = async (
    req: UserListRequest,
    res: Response,
    next: NextFunction
) => {
    const isValid = validateUserList(req.body);
    if (!isValid && validateUserList.errors) { // If schema validation failed and error occured return with formatted error message 
        const error = await parseErrors(validateUserList.errors);
        res.status(400).json({ errorMap: { ...req.errorMap, ["invalidDtoIn"]: error } });
        return;
    }
    next(); // If no error occured proceed further
};