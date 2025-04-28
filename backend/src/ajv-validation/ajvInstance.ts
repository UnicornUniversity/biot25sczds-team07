
import Ajv, { JSONSchemaType } from 'ajv';
import addFormats from "ajv-formats"
import ajvErrors from 'ajv-errors';

import { VALIDATION_ERRORS } from "../errors/errorMessages"


const ajv = new Ajv({
    allErrors: true,
    verbose: true,
});
addFormats(ajv);
ajvErrors(ajv /*,{ singleError: true }*/);
// adding format for objectId = Mongo ObjectID format
ajv.addFormat('objectId', /^[0-9a-fA-F]{24}$/);

export { ajv, VALIDATION_ERRORS, JSONSchemaType }