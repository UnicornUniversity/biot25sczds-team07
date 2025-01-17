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
    const isValid = validateMeasuringUpdateConfiguration(req.body);
    if (!isValid && validateMeasuringUpdateConfiguration.errors) { // If schema validation failed and error occured return with formatted error message 
        const error = await parseErrors(validateMeasuringUpdateConfiguration.errors);
        res.status(400).json({ errorMap: { ...req.errorMap, ["invalidDtoIn"]: JSON.stringify(error) } });
        return;
    }
    next(); // If no error occured proceed further
};