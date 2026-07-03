import apiClient from "./apiClient";

/**
 * Fetch all users from the backend (Admin only).
 * Supports query parameters like page, limit.
 */
export async function getAllUsers(params = {}) {
  const { data } = await apiClient.get("/users", { params });
  return data;
}

/**
 * Create a new user (Admin only).
 */
export async function createUser(payload) {
  const { data } = await apiClient.post("/users", payload);
  return data;
}

/**
 * Update user details (Admin or user themselves).
 */
export async function updateUser(id, payload) {
  const { data } = await apiClient.patch(`/users/${id}`, payload);
  return data;
}

/**
 * Delete a user (Admin or user themselves).
 */
export async function deleteUser(id) {
  const { data } = await apiClient.delete(`/users/${id}`);
  return data;
}
