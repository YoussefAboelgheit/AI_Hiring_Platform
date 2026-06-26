import apiClient from "./apiClient";
import { getApiErrorMessage } from "./apiErrors";

/**
 * Fetch all categories.
 */
export async function getCategories() {
  try {
    const { data } = await apiClient.get("/categories");
    return data.categories ?? [];
  } catch (error) {
    const message = getApiErrorMessage(error);
    throw Object.assign(new Error(message), { cause: error });
  }
}

/**
 * Create a new category.
 * Request Body: { name }
 */
export async function createCategory(payload) {
  const { data } = await apiClient.post("/categories", payload);
  return data.category;
}

/**
 * Update an existing category.
 * Request Body: { name }
 */
export async function updateCategory(id, payload) {
  const { data } = await apiClient.patch(`/categories/${id}`, payload);
  return data.category;
}

/**
 * Delete a category.
 */
export async function deleteCategory(id) {
  const { data } = await apiClient.delete(`/categories/${id}`);
  return data;
}
