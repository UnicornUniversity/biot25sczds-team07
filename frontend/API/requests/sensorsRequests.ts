import apiClient from "../axiosInstance"
import { SensorConfiguration, MeasurementPoint, MeasuredQuantity, Sensor } from "./measurementPointsRequests"

const URL_PREFIX = "/sensor"

// Get Sensor
const getSensor = async (sensorId: string, measurementPointId: string) => {
    const response = await apiClient.get(`${URL_PREFIX}/${sensorId}?measurementPointId=${measurementPointId}`);
    return response.data as Sensor;
};

// Add Sensor
export interface AddSensorDtoIn {
    measurementPointId: string,
    name: string,
    quantity: MeasuredQuantity,
    config: SensorConfiguration,
}
const addSensor = async (data: AddSensorDtoIn) => {
    const response = await apiClient.post(`${URL_PREFIX}/add`, data);
    return response.data as MeasurementPoint;
};

// Update Measurement Point
export interface UpdateSensorDtoIn extends AddSensorDtoIn {
    sensorId: string,
}
const updateSensor = async (data: UpdateSensorDtoIn) => {
    const response = await apiClient.post(`${URL_PREFIX}/update`, data);
    return response.data as MeasurementPoint;
};

// Delete Measurement Point
export interface DeleteSensorDtoIn {
    measurementPointId: string;
    sensorId: string;
}
const deleteSensor = async (data: DeleteSensorDtoIn) => {
    const response = await apiClient.post(`${URL_PREFIX}/delete`, data);
    return response.status === 202;
};

export interface UpdateSensorConfigDtoIn {
    measurementPointId: string;
    sensorId: string;
    jwtToken: string;
    config: SensorConfiguration;
}
const updateSensorConfig = async (data: UpdateSensorConfigDtoIn) => {
    const response = await apiClient.post(`${URL_PREFIX}/updateConfig`, data);
    return response.data as SensorConfiguration;
};


// Export all requests
const sensorRequests = {
    getSensor,
    addSensor,
    updateSensor,
    deleteSensor,
    updateSensorConfig
};

export default sensorRequests;