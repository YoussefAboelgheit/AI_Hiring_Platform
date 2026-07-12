import { Routes, Route, Navigate } from "react-router-dom";

import PublicLayout from "../layouts/PublicLayout";
import AuthLayout from "../layouts/AuthLayout";
import CandidateLayout from "../layouts/CandidateLayout";
import RecruiterLayout from "../layouts/RecruiterLayout";
import AdminLayout from "../layouts/AdminLayout";
import StandaloneLayout from "../layouts/StandaloneLayout";
import ProtectedRoute from "./ProtectedRoute";
import GuestRoute from "./GuestRoute";

import LandingPage from "../pages/public/LandingPage";
import AboutPage from "../pages/public/AboutPage";
import PrivacyPolicyPage from "../pages/public/PrivacyPolicyPage";
import NotFoundPage from "../pages/public/NotFoundPage";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";

import CandidateDashboard from "../pages/candidate/CandidateDashboard";
import BrowseJobsPage from "../pages/candidate/BrowseJobsPage";
import SavedJobsPage from "../pages/candidate/SavedJobsPage";
import JobDetailsPage from "../pages/recruiter/JobDetailsPage";
import JobDetailPage from "../pages/candidate/JobDetailPage";
import ApplyJobPage from "../pages/candidate/ApplyJobPage";
import MyApplicationsPage from "../pages/candidate/MyApplicationsPage";
import ApplicationDetailPage from "../pages/candidate/ApplicationDetailPage";
import AssessmentPage from "../pages/candidate/AssessmentPage";
import ChatPage from "../pages/candidate/ChatPage";
import AIFeedbackPage from "../pages/candidate/AIFeedbackPage";
import CandidateProfilePage from "../pages/candidate/CandidateProfilePage";
import CandidateEditProfilePage from "../pages/candidate/CandidateEditProfilePage";
import CompleteProfilePage from "../pages/candidate/CompleteProfilePage";
import ApplicationSubmittedPage from "../pages/candidate/ApplicationSubmittedPage";

import RecruiterDashboard from "../pages/recruiter/RecruiterDashboard";
import MyJobsPage from "../pages/recruiter/MyJobsPage";
import PostJobPage from "../pages/recruiter/PostJobPage";
import EditJobPage from "../pages/recruiter/EditJobPage";
import ApplicantsListPage from "../pages/recruiter/ApplicantsListPage";
import CandidateReviewPage from "../pages/recruiter/CandidateReviewPage";
import TopCandidatesPage from "../pages/recruiter/TopCandidatesPage";
import RecruiterFeedbackPage from "../pages/recruiter/RecruiterFeedbackPage";
import AssessmentGeneratorPage from "../pages/recruiter/AssessmentGeneratorPage";
import AIRecommendationPage from "../pages/recruiter/AIRecommendationPage";
import EmailInvitationsPage from "../pages/recruiter/EmailInvitationsPage";
import RecruiterProfilePage from "../pages/recruiter/RecruiterProfilePage";
import RecruiterEditProfilePage from "../pages/recruiter/RecruiterEditProfilePage";
import SettingsPage from "../pages/settings/SettingsPage";


import AdminDashboard from "../pages/admin/AdminDashboard";
import CategoryManagementPage from "../pages/admin/CategoryManagementPage";
import JobManagementPage from "../pages/admin/JobManagementPage";
import UserManagementPage from "../pages/admin/UserManagementPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="privacy" element={<PrivacyPolicyPage />} />
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

        <Route path="candidate/jobs/:jobId/assessment" element={<AssessmentPage />} />
        <Route path="candidate/chat" element={<ChatPage />} />

        <Route path="candidate" element={<CandidateLayout />}>
          <Route path="dashboard" element={<CandidateDashboard />} />
          <Route path="jobs" element={<BrowseJobsPage />} />
          <Route path="jobs/saved" element={<SavedJobsPage />} />
          <Route path="job/:jobId" element={<JobDetailsPage />} />
          <Route path="jobs/:id" element={<JobDetailPage />} />
          <Route path="jobs/:id/apply" element={<ApplyJobPage />} />
          <Route path="applications" element={<MyApplicationsPage />} />
          <Route path="applications/:id" element={<ApplicationDetailPage />} />
          <Route path="profile" element={<CandidateProfilePage />} />
          <Route path="profile/edit" element={<CandidateEditProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="feedback" element={<AIFeedbackPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["recruiter"]} />}>
        <Route path="recruiter" element={<RecruiterLayout />}>
          <Route path="dashboard" element={<RecruiterDashboard />} />
          <Route path="jobs/new" element={<PostJobPage />} />
          <Route path="jobs/edit/:id" element={<EditJobPage />} />
          <Route path="jobs" element={<MyJobsPage />} />
          <Route path="jobs/:id/view" element={<JobDetailsPage />} />
          <Route path="job/:jobId" element={<JobDetailsPage />} />
          <Route path="applications" element={<ApplicantsListPage />} />
          <Route path="candidates/:id" element={<CandidateReviewPage />} />
          <Route path="top-candidates" element={<TopCandidatesPage />} />
          <Route path="feedback/:jobId/:applicationId" element={<RecruiterFeedbackPage />} />
          <Route path="feedback" element={<RecruiterFeedbackPage />} />
          <Route path="jobs/:jobId/assessment" element={<AssessmentGeneratorPage />} />
          <Route path="assessment-generator" element={<AssessmentGeneratorPage />} />
          <Route path="ai-recommendation" element={<AIRecommendationPage />} />
          <Route path="profile" element={<RecruiterProfilePage />} />
          <Route path="profile/edit" element={<RecruiterEditProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="email-invitations" element={<EmailInvitationsPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="categories" element={<CategoryManagementPage />} />
          <Route path="jobs" element={<JobManagementPage />} />
          <Route path="users" element={<UserManagementPage />} />
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}