import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCandidateJobs, getSavedJobs, toggleSaveJob, extractSavedJobId } from "../../services/jobService";
import { getCategories } from "../../services/categoryService";
import { queryKeys } from "../../constants/queryKeys";
import { WORKPLACES, JOB_TYPES, JOB_SORT_OPTIONS } from "../../constants/jobEnums";
import { mapJobForCard } from "../../utils/jobMappers";
import JobCard from "../../components/candidate/JobCard";
import LoadingState from "../../components/common/LoadingState";
import EmptyState from "../../components/common/EmptyState";

const selectStyle = {
  border: "1px solid var(--border)",
  borderRadius: 10,
  padding: "9px 14px",
  fontSize: 14,
  outline: "none",
  width: "100%",
  background: "#fff",
};

const DEFAULT_FILTERS = {
  search: "",
  workplace: "",
  jobType: "",
  location: "",
  category: "",
  sort: "-createdAt",
  page: 1,
};

export default function BrowseJobsPage() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [draft, setDraft] = useState(DEFAULT_FILTERS);
  const [viewMode, setViewMode] = useState("grid");
  const queryClient = useQueryClient();

  const {
    data: categories = [],
    isLoading: categoriesLoading,
  } = useQuery({
    queryKey: queryKeys.categories,
    queryFn: getCategories,
    staleTime: 5 * 60 * 1000,
  });

  const {
    data,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: queryKeys.jobs.candidateList(filters),
    queryFn: () => getCandidateJobs(filters),
    placeholderData: (previousData) => previousData,
    staleTime: 60 * 1000,
  });

  const { data: savedIds = [] } = useQuery({
    queryKey: queryKeys.jobs.saved,
    queryFn: async () => {
      const raw = await getSavedJobs();
      return raw.map(extractSavedJobId).filter(Boolean);
    },
    staleTime: 60 * 1000,
  });
  const savedIdSet = new Set(savedIds);

  const handleToggleSave = async (jobId) => {
    const wasSaved = savedIdSet.has(jobId);
    // Optimistic update so the bookmark icon flips instantly.
    queryClient.setQueryData(queryKeys.jobs.saved, (prev = []) =>
      wasSaved ? prev.filter((id) => id !== jobId) : [...prev, jobId]
    );
    try {
      await toggleSaveJob(jobId);
    } catch {
      // Revert on failure.
      queryClient.setQueryData(queryKeys.jobs.saved, (prev = []) =>
        wasSaved ? [...prev, jobId] : prev.filter((id) => id !== jobId)
      );
    } finally {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.saved });
    }
  };

  const jobs = (data?.jobs ?? []).map(mapJobForCard);
  const hasMore = data?.hasMore ?? false;

  const updateDraft = (patch) => setDraft((prev) => ({ ...prev, ...patch }));

  const applyFilters = () => {
    setFilters({ ...draft, page: 1 });
  };

  const clearFilters = () => {
    setDraft(DEFAULT_FILTERS);
    setFilters({ ...DEFAULT_FILTERS });
  };

  const goToPage = (page) => {
    setFilters((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") applyFilters();
  };

  return (
    <>
      <div className="page-header-row" style={{ marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
            Explore Opportunities
            <i className="bi bi-stars" style={{ fontSize: 20, color: "var(--accent-teal)" }} aria-hidden="true" />
          </h1>
          <p style={{ color: "var(--text-muted)", margin: 0 }}>
            Browse open positions and find your next role.
          </p>
        </div>
      </div>

      <div className="hcard jobs-filters-bar" style={{ padding: "16px 20px", marginBottom: 24 }}>
        <div className="jobs-filters-grid">
          <div className="jobs-filter-field">
            <i className="bi bi-search" aria-hidden="true" />
            <input
              type="text"
              value={draft.search}
              onChange={(e) => updateDraft({ search: e.target.value })}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search jobs by title, skills, or keywords..."
              aria-label="Search jobs"
              style={selectStyle}
            />
          </div>
          <div className="jobs-filter-field">
            <i className="bi bi-geo-alt" aria-hidden="true" />
            <input
              type="text"
              value={draft.location}
              onChange={(e) => updateDraft({ location: e.target.value })}
              onKeyDown={handleSearchKeyDown}
              placeholder="Location"
              aria-label="Location"
              style={selectStyle}
            />
          </div>
          <div className="jobs-filter-field">
            <i className="bi bi-briefcase" aria-hidden="true" />
            <select
              value={draft.workplace}
              onChange={(e) => updateDraft({ workplace: e.target.value })}
              aria-label="Workplace"
              style={selectStyle}
            >
              <option value="">All workplaces</option>
              {WORKPLACES.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <div className="jobs-filter-field">
            <i className="bi bi-grid" aria-hidden="true" />
            <select
              value={draft.jobType}
              onChange={(e) => updateDraft({ jobType: e.target.value })}
              aria-label="Job type"
              style={selectStyle}
            >
              <option value="">All job types</option>
              {JOB_TYPES.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <div className="jobs-filter-field">
            <i className="bi bi-tags" aria-hidden="true" />
            <select
              value={draft.category}
              onChange={(e) => updateDraft({ category: e.target.value })}
              aria-label="Category"
              style={selectStyle}
              disabled={categoriesLoading}
            >
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>{category.name}</option>
              ))}
            </select>
          </div>
          <div className="jobs-filter-field">
            <i className="bi bi-sort-down" aria-hidden="true" />
            <select
              value={draft.sort}
              onChange={(e) => updateDraft({ sort: e.target.value })}
              aria-label="Sort by"
              style={selectStyle}
            >
              {JOB_SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="jobs-filters-actions">
          <button type="button" className="btn-outline-custom" onClick={clearFilters}>
            Clear
          </button>
          <button type="button" className="btn-primary-custom" onClick={applyFilters}>
            <i className="bi bi-sliders me-1" aria-hidden="true" /> Apply Filters
          </button>
        </div>
      </div>

      {isError && (
        <div style={{ background: "#FEE2E2", color: "#991B1B", padding: "12px 16px", borderRadius: 10, fontSize: 14, marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span>{error?.message || "Failed to load jobs."}</span>
          <button type="button" className="btn-outline-custom" style={{ fontSize: 13 }} onClick={() => refetch()}>
            Retry
          </button>
        </div>
      )}

      {isLoading ? (
        <LoadingState message="Loading jobs..." />
      ) : jobs.length === 0 && !isError ? (
        <EmptyState
          icon="bi-search"
          title="No jobs match your filters"
          description="Try adjusting your search, location, workplace, job type, or category to see more results."
          action={
            <button type="button" className="btn-outline-custom" onClick={clearFilters}>
              Clear Filters
            </button>
          }
        />
      ) : (
        <>
          <div className="jobs-toolbar">
            <div className="jobs-toolbar-count">
              Showing {jobs.length} job{jobs.length === 1 ? "" : "s"}
              {isFetching && !isLoading && (
                <span style={{ marginLeft: 10 }}>
                  <i className="bi bi-arrow-repeat me-1" aria-hidden="true" />
                  Updating...
                </span>
              )}
            </div>
            <div className="view-toggle-group">
              <button
                type="button"
                className={`view-toggle-btn ${viewMode === "grid" ? "view-toggle-btn--active" : ""}`}
                onClick={() => setViewMode("grid")}
              >
                <i className="bi bi-grid-3x3-gap" aria-hidden="true" /> Grid View
              </button>
              <button
                type="button"
                className={`view-toggle-btn ${viewMode === "list" ? "view-toggle-btn--active" : ""}`}
                onClick={() => setViewMode("list")}
              >
                <i className="bi bi-list-ul" aria-hidden="true" /> List View
              </button>
            </div>
          </div>
          <div className={`jobs-grid ${viewMode === "list" ? "jobs-grid--list" : ""}`}>
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                isSaved={savedIdSet.has(job.id)}
                onToggleSave={handleToggleSave}
              />
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginTop: 28 }}>
            <button
              type="button"
              className="btn-outline-custom"
              disabled={filters.page <= 1}
              onClick={() => goToPage(filters.page - 1)}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, opacity: filters.page <= 1 ? 0.4 : 1 }}
            >
              <i className="bi bi-chevron-left" /> Previous
            </button>
            <span className="jobs-pagination-page">{filters.page}</span>
            <button
              type="button"
              className="btn-outline-custom"
              disabled={!hasMore}
              onClick={() => goToPage(filters.page + 1)}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, opacity: !hasMore ? 0.4 : 1 }}
            >
              Next <i className="bi bi-chevron-right" />
            </button>
          </div>
        </>
      )}
    </>
  );
}