import axios from "axios";

const api = axios.create({
  // baseURL: "http://localhost:8080",
  baseURL: "http://211.188.56.146:8080", // 실제 백엔드 서버
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false, // CORS 설정 변경
});

export default api;
