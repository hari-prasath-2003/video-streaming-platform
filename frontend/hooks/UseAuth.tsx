import useUserStore from "@/store/User";
import axios, { AxiosError } from "axios";

const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_BACKEND_GATEWAY_URL}/api/auth`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

function UseAuth(): {
  signup: (email: string, password: string, fullName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  refreshAccessToken: () => Promise<string | null>;
} {
  const setAccessToken = useUserStore((state) => state.setAccessToken);

  async function login(email: string, password: string): Promise<void> {
    try {
      const response = await api.post("/login", { email, password });
      const { accessToken: newAccessToken } = response.data;
      setAccessToken(newAccessToken);
    } catch (error) {
      return Promise.reject({ msg: "Login failed", error });
    }
  }

  async function signup(
    email: string,
    password: string,
    fullName: string,
  ): Promise<void> {
    try {
      const response = await api.post("/signup", { email, password, fullName });
      const { accessToken: newAccessToken } = response.data;
      setAccessToken(newAccessToken);
    } catch (error) {
      return Promise.reject({ msg: "Signup failed", error });
    }
  }

  async function refreshAccessToken(): Promise<string | null> {
    const response = await api.get("/refresh");
    const { accessToken: newAccessToken } = response.data;
    setAccessToken(newAccessToken);
    return newAccessToken;
  }

  return { signup, login, refreshAccessToken };
}

export default UseAuth;
