import { Response, NextFunction } from 'express';

import { parseErrors } from '../../../errors/ajvError';
import { sensorGetConfigurationParams, sensorGetConfigurationQuery, validateSensorGetConfigurationParams, validateSensorGetConfigurationQuery } from './sensorGet.schema';
import { AuthorizationRequest } from '../../../authorization/authorizeUser';

export interface SensorGetRequest extends AuthorizationRequest {
    params: sensorGetConfigurationParams;
    query: sensorGetConfigurationQuery,
}

export const sensorGetConfiguratinValidator = async (
    req: SensorGetRequest,
    res: Response,
    next: NextFunction
) => {
    // console.log("getList - req.params:", req.params);
    const isValidParams = validateSensorGetConfigurationParams(req.params);
    if (!isValidParams && validateSensorGetConfigurationParams.errors) { // If schema validation failed and error occured return with formatted error message 
        const error = await parseErrors(validateSensorGetConfigurationParams.errors);
        res.status(400).json({ errorMap: { ...req.errorMap, ["invalidParams"]: JSON.stringify(error) } });
        return;
    }
    const isValidQuery = validateSensorGetConfigurationQuery(req.query);
    if (!isValidQuery && validateSensorGetConfigurationQuery.errors) { // If schema validation failed and error occured return with formatted error message 
        const error = await parseErrors(validateSensorGetConfigurationQuery.errors);
        res.status(400).json({ errorMap: { ...req.errorMap, ["invalidQuery"]: JSON.stringify(error) } });
        return;
    }

    next(); // If no error occured proceed further
};