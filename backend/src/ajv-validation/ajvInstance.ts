
import Ajv, { JSONSchemaType } from 'ajv';
import addFormats from "ajv-formats"
import ajvErrors from 'ajv-errors';

import { VALIDATION_ERRORS } from "../errors/errorMessages"
import { pageInfoSchema } from '../validators/other_schemas/pageInfo.schema';


const ajv = new Ajv({
    allErrors: true,
    verbose: true,
});
addFormats(ajv);
ajvErrors(ajv /*,{ singleError: true }*/);
// adding format for objectId = Mongo ObjectID format
ajv.addFormat('objectId', /^[0-9a-fA-F]{24}$/);

export const AJV_PAGE_INFO_SCHEMA = 'pageInfoSchema';
ajv.addSchema(pageInfoSchema, AJV_PAGE_INFO_SCHEMA);


export { ajv, VALIDATION_ERRORS, JSONSchemaType }