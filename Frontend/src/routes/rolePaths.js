export const ROLE_HOME = {
  candidate: "/candidate/dashboard",
  recruiter: "/recruiter/dashboard",
};

export function getHomeForRole(role) {
  if (role === "recruiter" || role === "admin" || role === "hr") {
    return ROLE_HOME.recruiter;
  }
  return ROLE_HOME[role] || "/";
}
