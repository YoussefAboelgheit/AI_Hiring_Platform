import apiClient from "./apiClient";
import { getApiErrorMessage } from "./apiErrors";

export async function getCategories() {
  try {
    const { data } = await apiClient.get("/categories");
    return data.categories ?? [];
  } catch (error) {
    const message = getApiErrorMessage(error);
    throw Object.assign(new Error(message), { cause: error });
  }
}