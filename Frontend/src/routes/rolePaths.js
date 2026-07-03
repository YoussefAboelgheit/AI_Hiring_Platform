export const ROLE_HOME = {
  candidate: "/candidate/dashboard",
  recruiter: "/recruiter/dashboard",
  admin: "/admin/dashboard",
};

export function getHomeForRole(role) {
  if (role === "admin") {
    return ROLE_HOME.admin;
  }
  if (role === "recruiter" || role === "hr") {
    return ROLE_HOME.recruiter;
  }
  return ROLE_HOME[role] || "/";
}
