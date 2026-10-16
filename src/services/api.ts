import axios from "axios";

export const axiosInstance = axios.create({
    baseURL: "https://localhost:7038/api/",
    timeout: 15000,
    headers: {
        Accept: "application/json"
    }
})