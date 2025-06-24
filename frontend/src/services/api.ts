import axios from "axios";

const DEFAULT_API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:8001" // When testing on the PC
    : `http://${window.location.hostname}:8001`; // When testing from mobile (uses same hostname)

const API_URL = import.meta.env.VITE_API_URL || DEFAULT_API_URL;

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

export const fetchRoot = async (): Promise<{ [key: string]: string }> => {
  const response = await api.get("/");
  return response.data;
};

export const invokeMysteryItem = async (
  session_id: string,
  message: string
) => {
  const response = await api.post("/mystery-item/", {
    session_id,
    message,
  });
  return response.data;
};
