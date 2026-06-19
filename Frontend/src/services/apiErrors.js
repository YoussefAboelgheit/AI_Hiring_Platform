export function getApiErrorMessage(error) {
  const data = error?.response?.data;

  if (!data) {
    return error?.message || "Something went wrong. Please try again.";
  }

  if (Array.isArray(data.errors) && data.errors.length > 0) {
    const first = data.errors[0];
    return first.msg || first.message || data.message;
  }

  if (typeof data.message === "string") {
    if (data.message.includes("already taken")) {
      return "An account with this email already exists.";
    }
    if (data.message === "Invalid email or password") {
      return "Incorrect email or password.";
    }
    return data.message;
  }

  return "Something went wrong. Please try again.";
}
