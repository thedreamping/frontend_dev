import axios from "axios";

let navigateFunction = null;

export const setNavigate = (navigate) => {
  navigateFunction = navigate;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ 요청 인터셉터 (accessToken 자동 첨부)
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ✅ 중복 요청 방지를 위한 상태 및 큐
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// ✅ 응답 인터셉터 (401 → 토큰 재발급)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 아니거나 이미 재시도한 요청이면 그대로 실패
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // 이미 재발급 중이면 큐에 대기
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = sessionStorage.getItem("refreshToken");

      if (!refreshToken) {
        throw new Error("No refresh token");
      }

      // 🔥 여기 핵심 수정
      // ❌ axios.post + 풀 URL
      // ✅ api.post + 상대 경로
      const response = await api.post("/api/users/token/reissue", {
        refreshToken,
      });

      const newAccessToken = response.data.accessToken;
      const newRefreshToken = response.data.refreshToken;

      if (!newAccessToken) {
        throw new Error("No access token returned");
      }

      console.log("🔄 토큰 재발급 성공!");

      sessionStorage.setItem("accessToken", newAccessToken);
      if (newRefreshToken) {
        sessionStorage.setItem("refreshToken", newRefreshToken);
      }

      api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
      processQueue(null, newAccessToken);

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (err) {
      console.error("🚫 토큰 재발급 실패:", err);
      processQueue(err, null);
      navigateFunction && navigateFunction("/login");
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
