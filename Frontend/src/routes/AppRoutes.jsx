import { Routes, Route, Navigate } from "react-router-dom";

import PublicLayout from "../layouts/PublicLayout";
import AuthLayout from "../layouts/AuthLayout";
import CandidateLayout from "../layouts/CandidateLayout";
import RecruiterLayout from "../layouts/RecruiterLayout";
import StandaloneLayout from "../layouts/StandaloneLayout";
import ProtectedRoute from "./ProtectedRoute";
import GuestRoute from "./GuestRoute";

import LandingPage from "../pages/public/LandingPage";
import AboutPage from "../pages/public/AboutPage";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";

import CandidateDashboard from "../pages/candidate/CandidateDashboard";
import BrowseJobsPage from "../pages/candidate/BrowseJobsPage";
import JobDetailPage from "../pages/candidate/JobDetailPage";
import ApplyJobPage from "../pages/candidate/ApplyJobPage";
import MyApplicationsPage from "../pages/candidate/MyApplicationsPage";
import ApplicationDetailPage from "../pages/candidate/ApplicationDetailPage";
import AssessmentPage from "../pages/candidate/AssessmentPage";
import AIFeedbackPage from "../pages/candidate/AIFeedbackPage";
import CandidateProfilePage from "../pages/candidate/CandidateProfilePage";
import CompleteProfilePage from "../pages/candidate/CompleteProfilePage";
import ApplicationSubmittedPage from "../pages/candidate/ApplicationSubmittedPage";

import RecruiterDashboard from "../pages/recruiter/RecruiterDashboard";
import MyJobsPage from "../pages/recruiter/MyJobsPage";
import PostJobPage from "../pages/recruiter/PostJobPage";
import ApplicantsListPage from "../pages/recruiter/ApplicantsListPage";
import CandidateReviewPage from "../pages/recruiter/CandidateReviewPage";
import TopCandidatesPage from "../pages/recruiter/TopCandidatesPage";
import RecruiterFeedbackPage from "../pages/recruiter/RecruiterFeedbackPage";
import AssessmentGeneratorPage from "../pages/recruiter/AssessmentGeneratorPage";
import AIRecommendationPage from "../pages/recruiter/AIRecommendationPage";
import EmailInvitationsPage from "../pages/recruiter/EmailInvitationsPage";
import SettingsPage from "../pages/settings/SettingsPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="about" element={<AboutPage />} />
      </Route>

      <Route element={<GuestRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="reset-password" element={<ResetPasswordPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["candidate", "recruiter"]} />}>
        <Route element={<StandaloneLayout />}>
          <Route path="candidate/profile/complete" element={<CompleteProfilePage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["candidate"]} />}>
        <Route element={<StandaloneLayout />}>
          <Route path="candidate/application-submitted" element={<ApplicationSubmittedPage />} />
        </Route>

        <Route path="candidate/assessments" element={<AssessmentPage />} />

        <Route path="candidate" element={<CandidateLayout />}>
          <Route path="dashboard" element={<CandidateDashboard />} />
          <Route path="jobs" element={<BrowseJobsPage />} />
          <Route path="jobs/:id" element={<JobDetailPage />} />
          <Route path="jobs/:id/apply" element={<ApplyJobPage />} />
          <Route path="applications" element={<MyApplicationsPage />} />
          <Route path="applications/:id" element={<ApplicationDetailPage />} />
          <Route path="profile" element={<CandidateProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="feedback" element={<AIFeedbackPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["recruiter"]} />}>
        <Route path="recruiter" element={<RecruiterLayout />}>
          <Route path="dashboard" element={<RecruiterDashboard />} />
          <Route path="jobs/new" element={<PostJobPage />} />
          <Route path="jobs" element={<MyJobsPage />} />
          <Route path="applications" element={<ApplicantsListPage />} />
          <Route path="candidates/:id" element={<CandidateReviewPage />} />
          <Route path="top-candidates" element={<TopCandidatesPage />} />
          <Route path="feedback" element={<RecruiterFeedbackPage />} />
          <Route path="assessment-generator" element={<AssessmentGeneratorPage />} />
          <Route path="ai-recommendation" element={<AIRecommendationPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="email-invitations" element={<EmailInvitationsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}