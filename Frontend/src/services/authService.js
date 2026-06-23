import apiClient from "./apiClient";
import * as userStorage from "./storage/userStorage";
import { toFrontendRole, toBackendRole } from "../utils/roleMap";
import { getApiErrorMessage } from "./apiErrors";

export function resolveAvatar(user) {
  if (user?.avatar) return user.avatar;
  const name = user?.name || "User";
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=EDE9FE&color=7C3AED&size=150`;
}

export function normalizeUser(user) {
  if (!user) return null;

  const role = toFrontendRole(user.role);

  return {
    ...user,
    id: user._id || user.id,
    role,
    avatar: resolveAvatar(user),
    title: user.title || (role === "recruiter" ? "Recruiter" : "Candidate"),
    bio: user.bio || "",
    phone: user.phone || "",
  };
}

export function getSessionUser() {
  return normalizeUser(userStorage.getStoredUser());
}

export async function register({ name, email, password, role }) {
  try {
    const { data } = await apiClient.post("/auth/register", {
      name: name.trim(),
      email: email.trim(),
      password,
      role: toBackendRole(role),
    });
    console.log(data);

    return { success: true, message: data.message };
  } catch (error) {
    const message = getApiErrorMessage(error);
    throw Object.assign(new Error(message), { cause: error });
  }
}

export async function login({ email, password }) {
  try {
    const { data } = await apiClient.post("/auth/login", {
      email: email.trim(),
      password,
    });

    const user = normalizeUser(data.user);
    userStorage.setSession(data.accessToken, user);

    return { success: true, user, accessToken: data.accessToken };
  } catch (error) {
    const message = getApiErrorMessage(error);
    throw Object.assign(new Error(message), { cause: error });
  }
}

export async function fetchMe() {
  try {
    const { data } = await apiClient.get("/auth/me");
    const user = normalizeUser(data.user);
    const token = userStorage.getAccessToken();

    if (token) {
      userStorage.setSession(token, user);
    }

    return user;
  } catch (error) {
    if (error.response?.status === 401) {
      userStorage.clearSession();
    }
    throw error;
  }
}

export async function updateSessionUser(updates) {
  const current = userStorage.getStoredUser();
  if (!current) return null;

  const updated = normalizeUser({ ...current, ...updates });
  userStorage.setSession(userStorage.getAccessToken(), updated);
  return updated;
}

export async function logout() {
  userStorage.clearSession();
  return { success: true };
}
