import { Response, NextFunction } from 'express';
import { parseErrors } from '../../errors/ajvError';

import { AuthorizationRequest } from '../../authorization/authorizeUser';
import { AuthorizeUser, validateUserAuthorize } from './userAuthorize.schema';

export interface UserAuthorizeRequest extends AuthorizationRequest {
    body: AuthorizeUser
}

export const userAuthorizeValidator = async (
    req: UserAuthorizeRequest,
    res: Response,
    next: NextFunction
) => {
    const isValid = validateUserAuthorize(req.body);
    if (!isValid && validateUserAuthorize.errors) { // If schema validation failed and error occured return with formatted error message 
        const error = await parseErrors(validateUserAuthorize.errors);
        res.status(400).json({ errorMap: { ...req.errorMap, ["invalidDtoIn"]: error } });
        return;
    }
    next(); // If no error occured proceed further
};