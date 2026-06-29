import toast from "react-hot-toast";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://medi-care-server-liart.vercel.app/api";

export function getCookie(name) {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}

export function setCookie(name, value, days = 7) {
  if (typeof document === "undefined") return;
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = `${name}=${value || ""}${expires}; path=/; SameSite=Lax; Secure`;
}

export function deleteCookie(name) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax; Secure`;
}

export async function apiRequest(endpoint, options = {}) {
  const token = getCookie("jwt_token");

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
    credentials: "include",
  };

  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, config);

    if (response.status === 401) {
      deleteCookie("jwt_token");
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.startsWith("/login")
      ) {
        toast.error("Session expired. Please log in again.");
        window.location.href = "/login";
      }
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || "Unauthorized access.");
    }

    if (response.status === 403) {
      const errData = await response.json().catch(() => ({}));
      toast.error(errData.message || "Access denied: Forbidden.");
      throw new Error(errData.message || "Access denied: Forbidden.");
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMessage = data.message || "Something went wrong.";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    if (error.message === "Failed to fetch") {
      toast.error("Network error: Cannot reach the healthcare backend server.");
    }
    throw error;
  }
}
