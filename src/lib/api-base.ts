const LOCAL_API_BASE_URL = "http://localhost:8080";

function normalizeApiBaseUrl(value: string) {
  return value.replace(/\/$/, "");
}

function isLoopbackHostname(hostname: string) {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "[::1]" ||
    hostname === "::1"
  );
}

function isLoopbackUrl(value: string) {
  try {
    return isLoopbackHostname(new URL(value).hostname);
  } catch {
    return false;
  }
}

function isRunningOnLocalhost() {
  return typeof window !== "undefined" && isLoopbackHostname(window.location.hostname);
}

function resolveApiBaseUrl() {
  const configuredValue = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

  if (configuredValue) {
    const normalizedValue = normalizeApiBaseUrl(configuredValue);

    if (
      typeof window !== "undefined" &&
      isLoopbackUrl(normalizedValue) &&
      !isRunningOnLocalhost()
    ) {
      throw new Error(
        "NEXT_PUBLIC_API_BASE_URL points to localhost, but the app is running on a public origin.",
      );
    }

    return normalizedValue;
  }

  if (process.env.NODE_ENV !== "production") {
    return LOCAL_API_BASE_URL;
  }

  throw new Error(
    "NEXT_PUBLIC_API_BASE_URL is not configured for production.",
  );
}

export const API_BASE_URL = resolveApiBaseUrl();
