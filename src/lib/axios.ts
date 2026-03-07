import axios from 'axios'

export const API_ENDPOINT = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000"

/** global axios intance for data from fetching from server via rest-api on client side */

const axiosInstance = axios.create({
  baseURL: API_ENDPOINT,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

export { axiosInstance as axios }
