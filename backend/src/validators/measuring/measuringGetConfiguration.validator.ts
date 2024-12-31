import { Response, NextFunction } from 'express';
import { parseErrors } from '../../errors/ajvError';
import { MeasuringGetConfigurationSchema, validateMeasuringGetConfiguration, } from './measuringGetConfiguration.schema';
import { AuthorizationRequest } from '../../authorization/authorizeUser';

export interface MeasuringGetConfigurationRequest extends AuthorizationRequest {
    params: MeasuringGetConfigurationSchema
}

export const measuringGetConfigurationValidator = async (
    req: MeasuringGetConfigurationRequest,
    res: Response,
    next: NextFunction
) => {
    // console.log("getList - req.params:", req.params);
    const isValid = validateMeasuringGetConfiguration(req.params);
    if (!isValid && validateMeasuringGetConfiguration.errors) { // If schema validation failed and error occured return with formatted error message 
        const error = await parseErrors(validateMeasuringGetConfiguration.errors);
        res.status(400).json({ errorMap: { ...req.errorMap, ["invalidDtoIn"]: JSON.stringify(error) } });
        return;
    }
    next(); // If no error occured proceed further
};