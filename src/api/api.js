import axios from "axios";

let navigateFunction = null;

let loadingHandler = null;

export const setApiLoadingHandler = (fn) => {
  loadingHandler = fn;
};

let requestCount = 0;



const showLoading = () => {
  requestCount++;
  loadingHandler?.(true);
};

const hideLoading = () => {
  requestCount = Math.max(0, requestCount - 1);
  if (requestCount === 0) {
    loadingHandler?.(false);
  }
};

export const setNavigate = (navigate) => {
  navigateFunction = navigate;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ 로그 전송 함수
const sendLog = async (config, statusCode) => {
  try {
    // 🔥 로그 API 자체는 제외 (무한루프 방지)
    if (
      config.url.includes("/api/logs") ||
      config.url.includes("/api/users/token/reissue")
    ) {
      return;
    }

    await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/api/logs`,
      {
        admin_name: config.metadata?.adminName,
        method: config.method,
        endpoint: config.url,
        status_code: statusCode,
      },
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
        },
      }
    );
  } catch (err) {
    console.error("로그 전송 실패:", err);
  }
};

// ✅ 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    if (!config._skipLoading) showLoading();
    const token = sessionStorage.getItem("accessToken");
    const adminName = sessionStorage.getItem("adminName");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    config.metadata = {
      adminName: adminName || "unknown",
      startTime: new Date(),
    };

    return config;
  },
  (error) => Promise.reject(error),
);

// ✅ 중복 요청 방지
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// ✅ 응답 인터셉터 (🔥 로그 추가됨)
api.interceptors.response.use(
  (response) => {
    // 🔥 성공 로그
    hideLoading();
    sendLog(response.config, response.status);
    return response;
  },
  async (error) => {
    hideLoading();
    const originalRequest = error.config;

    // 🔥 실패 로그도 남김
    if (originalRequest) {
      sendLog(originalRequest, error.response?.status || 500);
    }

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          originalRequest._skipLoading = true;
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
      originalRequest._skipLoading = true;
      return api(originalRequest);
    } catch (err) {
      console.error("🚫 토큰 재발급 실패:", err);
      processQueue(err, null);
      navigateFunction && navigateFunction("/login");
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;