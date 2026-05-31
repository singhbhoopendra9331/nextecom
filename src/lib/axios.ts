import axios from 'axios';
import { getEnv } from '@/lib/env';

export const API_ENDPOINT = getEnv("NEXT_PUBLIC_SERVER_URL")

/** global axios intance for data from fetching from server via rest-api on client side */

const axiosInstance = axios.create({
  baseURL: API_ENDPOINT,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

export { axiosInstance as axios }
