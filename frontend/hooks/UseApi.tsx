import axios, { AxiosError } from "axios";
import { useEffect } from "react";
import UseAuth from "./UseAuth";
import { useRouter } from "next/navigation";
import useUserStore from "@/store/User";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_GATEWAY_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

function UseApi() {
  const { refreshAccessToken } = UseAuth();
  const accessToken = useUserStore((state) => state.accessToken);
  const router = useRouter();

  useEffect(() => {
    const requestIntercept = api.interceptors.request.use(
      (config) => {
        if (!config.headers["Authorization"]) {
          config.headers["Authorization"] = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );
    const responseIntercept = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const newToken = await refreshAccessToken();
            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
            return api(originalRequest);
          } catch (refreshError) {
            if (
              refreshError instanceof AxiosError &&
              refreshError?.response?.status === 401
            ) {
              // Handle the case where the refresh token is also invalid
              router.push("/login");
              console.error("Refresh token is invalid. Please log in again.");
            }
          }
        }

        return Promise.reject(error);
      },
    );

    return () => {
      api.interceptors.request.eject(requestIntercept);
      api.interceptors.response.eject(responseIntercept);
    };
  }, []);

  function get(url: string, config?: object) {
    return api.get(url, config);
  }

  function post(url: string, data: object, config?: object) {
    return api.post(url, data, config);
  }

  return { get, post };
}

export default UseApi;
