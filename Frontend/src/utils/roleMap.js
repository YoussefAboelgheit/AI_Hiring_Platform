export function toFrontendRole(backendRole) {
  if (backendRole === "admin") return "admin";
  if (backendRole === "hr") return "recruiter";
  return backendRole;
}

export function toBackendRole(frontendRole) {
  if (frontendRole === "recruiter") return "hr";
  return frontendRole;
}

export function isRecruiterRole(role) {
  return role === "recruiter" || role === "hr" || role === "admin";
}
