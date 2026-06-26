import apiClient from "./apiClient";

/**
 * Fetch all categories.
 */
export async function getCategories() {
  const { data } = await apiClient.get("/categories");
  return data.categories || [];
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

