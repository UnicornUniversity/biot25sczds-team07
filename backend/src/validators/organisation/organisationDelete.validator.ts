import { Response, NextFunction } from 'express';
import { parseErrors } from '../../errors/ajvError';
import { ListDeleteSchema, validateOrganisationDelete } from './organisationDelete.schema';
import { AuthorizationRequest } from '../../authorization/authorizeUser';

export interface DeleteListRequest extends AuthorizationRequest {
    body: ListDeleteSchema
}

export const organisationDeleteValidator = async (
    req: AuthorizationRequest,
    res: Response,
    next: NextFunction
) => {
    const isValid = validateOrganisationDelete(req.body);
    // console.log("DELETE isValid: ", isValid);
    if (!isValid && validateOrganisationDelete.errors) { // If schema validation failed and error occured return with formatted error message 
        const error = await parseErrors(validateOrganisationDelete.errors);
        // console.log("DELETE invalid - errors: ", error);
        res.status(400).json({ errorMap: { ...req.errorMap, ["invalidDtoIn"]: error } });
        return;
    }
    next(); // If no error occured proceed further
};