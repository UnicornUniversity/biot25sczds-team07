import { Response, NextFunction } from 'express';
import { parseErrors } from '../../errors/ajvError';
import { OrganisationAddSchema, validateOrganisationAdd } from './organisationAdd.schema';
import { AuthorizationRequest } from '../../authorization/authorizeUser';

export interface OrganisationAddRequest extends AuthorizationRequest {
    body: OrganisationAddSchema
}

export const organisationAddValidator = async (
    req: OrganisationAddRequest,
    res: Response,
    next: NextFunction
) => {
    const isValid = validateOrganisationAdd(req.body);
    // console.log("create list is valid: ", isValid);
    if (!isValid && validateOrganisationAdd.errors) { // If schema validation failed and error occured return with formatted error message 
        const error = await parseErrors(validateOrganisationAdd.errors);
        console.error("createList error: ", error);
        res.status(400).json({ errorMap: { ...req.errorMap, ["invalidDtoIn"]: error } });
        return;
    }
    next(); // If no error occured proceed further
};