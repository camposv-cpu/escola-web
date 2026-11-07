import axios from "axios"

export const api = axios.creat({
    baseURL: process.env.NEXT_PUBLIC_APEI_URL
})