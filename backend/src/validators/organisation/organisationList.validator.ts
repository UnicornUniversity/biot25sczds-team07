import { Response, NextFunction } from 'express';
import { parseErrors } from '../../errors/ajvError';
import { OrganisationListSchema, validateOrganisationList } from './organisationList.schema';
import { AuthorizationRequest } from '../../authorization/authorizeUser';

export interface OrganisationListRequest extends AuthorizationRequest {
    body: OrganisationListSchema
}


export const organisationListValidator = async (
    req: OrganisationListRequest,
    res: Response,
    next: NextFunction
) => {
    const isValid = validateOrganisationList(req.body);
    if (!isValid && validateOrganisationList.errors) { // If schema validation failed and error occured return with formatted error message 
        const error = await parseErrors(validateOrganisationList.errors);
        res.status(400).json({ errorMap: { ...req.errorMap, ["invalidDtoIn"]: error } });
        return;
    }
    next(); // If no error occured proceed further
};