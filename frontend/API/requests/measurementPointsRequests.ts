import apiClient from "../axiosInstance"
import { BaseEntity, PaginatedRequest, PaginatedResponse } from "../types/basic";


const URL_PREFIX = "/measurementPoint"

export interface SensorConfiguration {
    sendInterval: number,
    measureInterval: number,
    temperatureLimits: {
        // °C
        cooling: number, // if temperature is above this number => start cooling
        heating: number // if temperature is below this number => start heating
    }
}
export interface SenzorConfiguration extends SensorConfiguration {
    created: number,
}

export type MeasuredQuantity = "temperature" | "acceleration";
export interface Sensor {
    sensorId: string,
    name: string,
    quantity: MeasuredQuantity,
    config: SenzorConfiguration,
    created: number,
    edited?: number,
    deleted?: number
}

export interface MeasurementPoint extends BaseEntity {
    organisationId: string,
    ownerId: string,
    name: string,
    description: string,
    jwtToken: string,
    sensors: Sensor[],
}



// Add Measurement Point
export interface AddMeasurementPointDtoIn {
    organisationId: string;
    name: string;
    description?: string;
}
const addMeasurementPoint = async (data: AddMeasurementPointDtoIn) => {
    const response = await apiClient.post(`${URL_PREFIX}/add`, data);
    return response.data as MeasurementPoint;
};

// Delete Measurement Point
export interface DeleteMeasurementPointDtoIn {
    organisationId: string;
    id: string;
}
const deleteMeasurementPoint = async (data: DeleteMeasurementPointDtoIn) => {
    const response = await apiClient.post(`${URL_PREFIX}/delete`, data);
    return response.status === 202;
};

// Get Measurement Point by ID
const getMeasurementPoint = async (id: string) => {
    const response = await apiClient.get(`${URL_PREFIX}/get/${id}`);
    return response.data as MeasurementPoint;
};

// List Measurement Points
export interface ListMeasurementPointsDtoIn extends PaginatedRequest {
    organisationId: string;
}
export interface ListMeasurementPointsDtoOut extends PaginatedResponse {
    measurementPoints: MeasurementPoint[];
}
const listMeasurementPoints = async (data: ListMeasurementPointsDtoIn) => {
    const response = await apiClient.post(`${URL_PREFIX}/list`, data);
    return response.data as ListMeasurementPointsDtoOut;
};

// Update Measurement Point
export interface UpdateMeasurementPointDtoIn {
    id: string;
    name?: string;
    description?: string;
}
const updateMeasurementPoint = async (data: UpdateMeasurementPointDtoIn) => {
    const response = await apiClient.post(`${URL_PREFIX}/update`, data);
    return response.data as MeasurementPoint;
};

// Get JWT Token for Measurement Point
export interface GetMeasurementPointJwtTokenDtoIn {
    _id: string;
}
export interface GetMeasurementPointJwtTokenDtoOut {
    jwtToken: string;
}
const getMeasurementPointJwtToken = async (data: GetMeasurementPointJwtTokenDtoIn) => {
    const response = await apiClient.get(`${URL_PREFIX}/getJwtToken`, { params: data });
    const responseObject = response.data as GetMeasurementPointJwtTokenDtoOut;
    return responseObject.jwtToken;
};

// Export all requests
const measurementPointsRequests = {
    addMeasurementPoint,
    deleteMeasurementPoint,
    getMeasurementPoint,
    listMeasurementPoints,
    updateMeasurementPoint,
    getMeasurementPointJwtToken,
};

export default measurementPointsRequests;