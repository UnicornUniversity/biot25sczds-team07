import { Response, NextFunction } from 'express';
import { parseErrors } from '../../errors/ajvError';
import { OrganisationGetSchema, validateOrganisationGet } from './organisationGet.schema';
import { AuthorizationRequest } from '../../authorization/authorizeUser';

export interface OrganisationGetRequest extends AuthorizationRequest {
    body: OrganisationGetSchema
}

export const organisationGetValidator = async (
    req: OrganisationGetRequest,
    res: Response,
    next: NextFunction
) => {
    // console.log("getList - req.params:", req.params);
    const isValid = validateOrganisationGet(req.params);
    if (!isValid && validateOrganisationGet.errors) { // If schema validation failed and error occured return with formatted error message 
        const error = await parseErrors(validateOrganisationGet.errors);
        res.status(400).json({ errorMap: { ...req.errorMap, ["invalidDtoIn"]: JSON.stringify(error) } });
        return;
    }
    next(); // If no error occured proceed further
};