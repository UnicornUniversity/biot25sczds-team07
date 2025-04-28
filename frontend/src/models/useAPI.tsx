import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';



export function useApi(): {
    get: (url: string, config?: AxiosRequestConfig) => Promise<AxiosResponse>;
    post: (url: string, data: any, config?: AxiosRequestConfig) => Promise<AxiosResponse>;
    put: (url: string, data: any, config?: AxiosRequestConfig) => Promise<AxiosResponse>;
    delete: (url: string, config?: AxiosRequestConfig) => Promise<AxiosResponse>;
} {
    const localToken = localStorage.getItem("JWTtoken");
    const headers = localToken
        ? {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localToken}`
        }
        : { 'Content-Type': 'application/json', }

    const api = axios.create({
        baseURL: 'http://localhost:4000/',
        headers,
    });

    return {
        get: (url, config = {}) => api.get(url, config),
        post: (url, data, config = {}) => api.post(url, data, config),
        put: (url, data, config = {}) => api.put(url, data, config),
        delete: (url, config = {}) => api.delete(url, config),
    };
}
