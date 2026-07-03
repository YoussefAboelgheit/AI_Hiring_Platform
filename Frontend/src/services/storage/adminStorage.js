const ADMIN_ACCESS_TOKEN_KEY = "adminAccessToken";

export function getAdminAccessToken() {
  return localStorage.getItem(ADMIN_ACCESS_TOKEN_KEY);
}

export function setAdminAccessToken(token) {
  if (token) {
    localStorage.setItem(ADMIN_ACCESS_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(ADMIN_ACCESS_TOKEN_KEY);
  }
}

export function clearAdminSession() {
  localStorage.removeItem(ADMIN_ACCESS_TOKEN_KEY);
}
