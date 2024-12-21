import { Response, NextFunction } from 'express';
import { parseErrors } from '../../errors/ajvError';
import { AuthorizationRequest } from '../../authorization/authorizeUser';
import { OrganisationUpdateSchema, validateOrganisationUpdate } from './organisationUpdate.schema';

export interface OrganisationUpdateRequest extends AuthorizationRequest {
    body: OrganisationUpdateSchema
}

export const organisationUpdateValidator = async (
    req: OrganisationUpdateRequest,
    res: Response,
    next: NextFunction
) => {
    const isValid = validateOrganisationUpdate(req.body);
    // console.log("create list is valid: ", isValid);
    if (!isValid && validateOrganisationUpdate.errors) { // If schema validation failed and error occured return with formatted error message 
        const error = await parseErrors(validateOrganisationUpdate.errors);
        console.error("createList error: ", error);
        res.status(400).json({ errorMap: { ...req.errorMap, ["invalidDtoIn"]: JSON.stringify(error) } });
        return;
    }
    next(); // If no error occured proceed further
};