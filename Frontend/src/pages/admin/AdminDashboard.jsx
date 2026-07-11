import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { getCategories } from "../../services/categoryService";
import { getAllUsers } from "../../services/userService";
import { getJobs } from "../../services/jobService";
import LoadingState from "../../components/common/LoadingState";

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [categoriesCount, setCategoriesCount] = useState(0);
  const [usersCount, setUsersCount] = useState(0);
  const [jobsCount, setJobsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [cats, users, jobs] = await Promise.all([
          getCategories(),
          getAllUsers({ limit: 1 }), // efficient query to count total users
          getJobs()
        ]);
        setCategoriesCount(cats.length);
        setUsersCount(users.total || (users.users?.length ?? 0));
        setJobsCount(jobs.length);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  if (loading) return <LoadingState message="Loading dashboard statistics..." />;

  const statCards = [
    {
      label: "Total Categories",
      value: categoriesCount,
      icon: "bi-tags-fill",
      bgColor: "#f3f5fb",
      iconColor: "#1d2445",
      actionLabel: "Manage",
      onClick: () => navigate("/admin/categories")
    },
    {
      label: "Total Registered Users",
      value: usersCount,
      icon: "bi-people-fill",
      bgColor: "#E0F2FE", // pastel blue
      iconColor: "#0284C7",
      linkTo: "/admin/users"
    },
    {
      label: "Active Jobs",
      value: jobsCount,
      icon: "bi-briefcase-fill",
      bgColor: "#DCFCE7", // pastel green
      iconColor: "#15803D",
      linkTo: "/admin/jobs"
    }
  ];

  return (
    <>
      <div className="page-header-row">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Admin Dashboard</h1>
          <p style={{ color: "var(--text-muted)", margin: 0, fontSize: 14 }}>
            System overview and data administration panel. Welcome back, {user?.name || "Administrator"}.
          </p>
        </div>
      </div>

<div className="row g-4 mb-4">
  {statCards.map((card) => (
    <div key={card.label} className="col-12 col-md-4">
        <div className="border-0 shadow-sm d-flex justify-content-between align-items-center p-4" style={{ backgroundColor: card.bgColor, borderRadius: 8 }}>
        <div className="d-flex flex-column">
          <div className="stat-label" style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500 }}>{card.label}</div>
          <div className="stat-value" style={{ fontSize: 32, fontWeight: 800 }}>{card.value}</div>
        </div>
        {card.onClick ? (
          <button type="button" onClick={card.onClick} className="btn btn-light rounded-circle shadow-sm d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
            <i className="bi bi-arrow-right-short fs-4"></i>
          </button>
        ) : card.linkTo ? (
          <Link to={card.linkTo} className="btn btn-light rounded-circle shadow-sm d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
            <i className="bi bi-arrow-right-short fs-4"></i>
          </Link>
        ) : null}
      </div>
    </div>
  ))}
</div>

        <div className="row g-4 mb-4">
          <div className="col-12">
            <div className="hcard" style={{ padding: 24 }}>
              <h2 className="section-title" style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
                Quick Admin Tasks
              </h2>
              <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 20 }}>
                Use the category manager to review and add job tags. These categories dictate options when recruiter HRs submit job vacancies and candidates browse or filter open roles.
              </p>
              <button
                type="button"
                className="btn-outline-custom"
                onClick={() => navigate("/admin/categories")}
              >
                Launch Category Module
              </button>
            </div>
          </div>
        </div>
    </>
  );
}