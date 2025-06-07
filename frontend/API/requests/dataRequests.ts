import apiClient from "../axiosInstance"


const URL_PREFIX = "/measuring"

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

export interface SensorDataInfluxOutput {
    sensorId: string,
    sensorData: TemperatureData[];
    averageTemperature: number | null;
}
export interface RetrieveDataDtoIn {
    fromEpoch: number,
    toEpoch: number,
    measurementPointId: string,
    sensorId?: string,
}
const retrieveData = async (dtoIn: RetrieveDataDtoIn) => {
    const response = await apiClient.post(`${URL_PREFIX}/getData`, dtoIn);
    return response.data.measuredData as SensorDataInfluxOutput[];
};

const dataRequests = {
    retrieveData
}

export default dataRequests;