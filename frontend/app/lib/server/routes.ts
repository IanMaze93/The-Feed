import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import "server-only";

const API_URL = process.env.BACKEND_URL;

export async function backendPost<TBody, TResponse>(
  endpoint: string,
  body: TBody,
  redirectOnUnauthorized = true
): Promise<TResponse> {
  if (!API_URL) {
    throw new Error("Backend URL is not configured");
  }

  const cookieStore = await cookies();

  const token = cookieStore.get("access_token")?.value;

  const response = await fetch(`${API_URL}/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (
    (response.status === 401 || response.status === 403) &&
    redirectOnUnauthorized
  ) {
    console.log("User is not authenticated, redirecting to login.");
    redirect("/");
  }

  if (!response.ok) {
    throw new Error(`Backend request failed with status ${response.status}`);
  }

  return data;
}

export async function backendGet<TResponse>(
  endpoint: string
): Promise<TResponse> {
  if (!API_URL) {
    throw new Error("Backend URL is not configured");
  }

  const cookieStore = await cookies();

  const token = cookieStore.get("access_token")?.value;

  const response = await fetch(`${API_URL}/${endpoint}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store", // Disable caching for GET requests
  });

  const data = await response.json();

  if (response.status === 401 || response.status === 403) {
    console.log("User is not authenticated, redirecting to login.");
    redirect("/");
  }

  if (!response.ok) {
    throw new Error(`Backend request failed with status ${response.status}`);
  }

  return data;
}

export async function backendPut<TBody, TResponse>(
  endpoint: string,
  body: TBody,
  redirectOnUnauthorized = true
): Promise<TResponse> {
  if (!API_URL) {
    throw new Error("Backend URL is not configured");
  }

  const cookieStore = await cookies();

  const token = cookieStore.get("access_token")?.value;

  const response = await fetch(`${API_URL}/${endpoint}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (
    (response.status === 401 || response.status === 403) &&
    redirectOnUnauthorized
  ) {
    console.log("User is not authenticated, redirecting to login.");
    redirect("/");
  }

  if (!response.ok) {
    throw new Error(`Backend request failed with status ${response.status}`);
  }

  return data;
}
