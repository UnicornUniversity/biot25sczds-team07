import { ErrorObject } from 'ajv';

export const parseErrors = async (validationErrors: ErrorObject[]) => {
    const errors: any[] = [];
    validationErrors.forEach(error => {
        errors.push({
            param: error.params['missingProperty']
                ? error.params['missingProperty']
                : error.instancePath,
            message: error.message,
            value: error.params['missingProperty'] ? null : error.data,
        });
    });
    return errors;
};