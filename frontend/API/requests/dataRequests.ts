import apiClient from "../axiosInstance"


const URL_PREFIX = "/data"

export enum SensorState {
    IDLE = 1,
    COOLING = 2,
    HEATING = 3,
}
export interface TemperatureData {
    timeStamp: number, // UNIX time of when data were measured
    temperature: number,
    state: SensorState
}


export interface RetrieveDataDtoIn {
    measurementPointId: string,
    startTime: number,
    endTime: number,
}
const retrieveData = async (data: RetrieveDataDtoIn) => {
    const response = await apiClient.get(`${URL_PREFIX}/get?measurementPointId=${data.measurementPointId}&from=${data.startTime}&to=${data.endTime}`);
    return response.data as TemperatureData[];
};

const dataRequests = {
    retrieveData
}

export default dataRequests;