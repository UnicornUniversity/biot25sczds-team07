import { Response, NextFunction } from 'express';
import { parseErrors } from '../../errors/ajvError';
import { AuthorizationRequest } from '../../authorization/authorizeUser';
import { MeasuringUpdateConfigurationSchema, validateMeasuringUpdateConfiguration } from './measuringUpdateConfiguration.schema';

export interface MeasuringUpdateConfigurationRequest extends AuthorizationRequest {
    body: MeasuringUpdateConfigurationSchema
}

export const measuringUpdateConfigurationValidator = async (
    req: MeasuringUpdateConfigurationRequest,
    res: Response,
    next: NextFunction
) => {
    // console.log("getList - req.params:", req.params);
    const isValid = validateMeasuringUpdateConfiguration(req.params);
    if (!isValid && validateMeasuringUpdateConfiguration.errors) { // If schema validation failed and error occured return with formatted error message 
        const error = await parseErrors(validateMeasuringUpdateConfiguration.errors);
        res.status(400).json({ errorMap: { ...req.errorMap, ["invalidDtoIn"]: JSON.stringify(error) } });
        return;
    }
    next(); // If no error occured proceed further
};