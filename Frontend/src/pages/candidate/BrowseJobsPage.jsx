import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCandidateJobs } from "../../services/jobService";
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
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>Explore Opportunities</h1>
          <p style={{ color: "var(--text-muted)", margin: 0 }}>
            Browse open positions and find your next role.
          </p>
        </div>
      </div>

      <div className="hcard jobs-filters-bar" style={{ padding: "16px 20px", marginBottom: 24 }}>
        <div className="jobs-filters-grid">
          <div style={{ position: "relative" }}>
            <i className="bi bi-search" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8", fontSize: 14 }} />
            <input
              type="text"
              value={draft.search}
              onChange={(e) => updateDraft({ search: e.target.value })}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search jobs by title, skills, or keywords..."
              aria-label="Search jobs"
              style={{ ...selectStyle, paddingLeft: 34 }}
            />
          </div>
          <input
            type="text"
            value={draft.location}
            onChange={(e) => updateDraft({ location: e.target.value })}
            onKeyDown={handleSearchKeyDown}
            placeholder="Location"
            aria-label="Location"
            style={selectStyle}
          />
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
        <div className="jobs-filters-actions">
          <button type="button" className="btn-outline-custom" onClick={clearFilters}>
            Clear
          </button>
          <button type="button" className="btn-primary-custom" onClick={applyFilters}>
            Apply Filters
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
          {isFetching && !isLoading && (
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 12 }}>
              <i className="bi bi-arrow-repeat me-1" aria-hidden="true" />
              Updating results...
            </div>
          )}
          <div className="jobs-grid">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
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
            <span style={{ fontSize: 14, color: "var(--text-muted)", fontWeight: 500 }}>
              Page {filters.page}
            </span>
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
