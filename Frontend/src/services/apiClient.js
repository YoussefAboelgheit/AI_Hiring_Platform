import axios from "axios";
import * as userStorage from "./storage/userStorage";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const apiClient = axios.create({
  baseURL,
  withCredentials: true,
});

/** Bare client for refresh — avoids running the 401 retry interceptor on itself. */
const refreshClient = axios.create({
  baseURL,
  withCredentials: true,
});

let refreshPromise = null;

function isAuthExemptUrl(url = "") {
  return /\/auth\/(login|register|refresh|forgot-password|confirm-forgot-password)(?:\?|$)/.test(url);
}

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post("/auth/refresh")
      .then(({ data }) => {
        const accessToken = data.accessToken;
        if (!accessToken) {
          throw new Error("Refresh response did not include an access token.");
        }
        userStorage.setAccessToken(accessToken);
        return accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

apiClient.interceptors.request.use((config) => {
  const token = userStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const requestUrl = originalRequest.url || "";

    if (status !== 401 || isAuthExemptUrl(requestUrl)) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const newToken = await refreshAccessToken();
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      userStorage.clearSession();
      return Promise.reject(refreshError);
    }
  }
);

export default apiClient;
