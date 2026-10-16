export const SESSION_STORAGE_KEY = "eventplus:session"
export const UNAUTHORIZED_EVENT = "eventplus:unauthorized"

import axios from "axios";

export const axiosInstance = axios.create({
    baseURL: "https://localhost:7038/api/",
    timeout: 15000,
    headers: {
        Accept: "application/json"
    }
})