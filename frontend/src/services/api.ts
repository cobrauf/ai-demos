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

export const invokeMysteryItemGraph = async (
  session_id: string,
  message: string
) => {
  const response = await api.post("/mystery-item/invoke", {
    session_id,
    message,
  });

  // for dev
  console.log("=== Mystery Item API Response ===");
  console.log("# Secret Answer:", response.data.secret_answer);
  console.log("# Tool Name:", response.data.tool_name);
  console.log("# User Message:", message);
  console.log("# AI Response:", response.data.response);

  return response.data;
};

export const resetMysteryItemSession = async (session_id: string) => {
  const response = await api.post("/mystery-item/reset", {
    session_id,
  });

  // for dev
  console.log("=== Reset Mystery Item API Response ===");
  console.log("# Secret Answer:", response.data.secret_answer);
  console.log("# Tool Name:", response.data.tool_name);
  console.log("# AI Response:", response.data.response);
  return response.data;
};
