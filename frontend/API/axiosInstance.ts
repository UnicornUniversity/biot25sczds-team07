import axios from "axios";

const apiClient = axios.create({
    baseURL: 'https://iot-team07-api-summer-2025.azurewebsites.net', // "http://localhost:8080", // , // Replace with your base URL
    timeout: 3000, // Optional: specify a timeout in milliseconds
    headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://iot-team07-api-summer-2025.azurewebsites.net',
    }, // Optional: set default headers

});

// Add a request interceptor
apiClient.interceptors.request.use(
    (config) => {
        // Retrieve the JWT token from localStorage
        const token = localStorage.getItem('JWTtoken');

        // If the token is available, add it to the headers
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        // Handle the error
        return Promise.reject(error);
    }
);

// Add a response interceptor
apiClient.interceptors.response.use(
    (response) => {
        // Check if the status is 200, 201, or 202
        if ([200, 201, 202].includes(response.status)) {
            // Remove the errorMap from the response data
            if (response.data && response.data.errorMap) {
                delete response.data.errorMap;
            }
        }
        return response;
    },
    (error) => {
        // Handle the error
        return Promise.reject(error);
    }
);

export default apiClient;