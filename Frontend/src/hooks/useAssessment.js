import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import * as assessmentService from "../services/assessmentService";

export function useAssessment(jobId) {
  return useQuery({
    queryKey: queryKeys.assessments.detail(jobId),
    queryFn: async () => {
      const { data } = await assessmentService.getAssessment(jobId);
      // API returns { assessment, questions } — keep both, don't drop questions
      return { assessment: data.assessment, questions: data.questions || [] };
    },
    enabled: !!jobId,
    retry: false,
  });
}

export function useGenerateAssessment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ jobId, payload }) => {
      const { data } = await assessmentService.generateAssessment(jobId, payload);
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assessments.detail(variables.jobId) });
    },
  });
}

export function useUpdateAssessmentSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ jobId, payload }) => {
      const { data } = await assessmentService.updateAssessmentSettings(jobId, payload);
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assessments.detail(variables.jobId) });
    },
  });
}

export function useRegenerateAssessment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ jobId }) => {
      const { data } = await assessmentService.regenerateAssessment(jobId);
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assessments.detail(variables.jobId) });
    },
  });
}

export function useAddManualQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ jobId, question }) => {
      const { data } = await assessmentService.addManualQuestion(jobId, question);
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assessments.detail(variables.jobId) });
    },
  });
}

export function useUpdateQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ questionId, question, jobId }) => {
      const { data } = await assessmentService.updateQuestion(questionId, question);
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assessments.detail(variables.jobId) });
    },
  });
}

export function useDeleteQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ questionId, jobId }) => {
      const { data } = await assessmentService.deleteQuestion(questionId);
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assessments.detail(variables.jobId) });
    },
  });
}

export function useRegenerateQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ questionId, jobId }) => {
      const { data } = await assessmentService.regenerateQuestion(questionId);
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assessments.detail(variables.jobId) });
    },
  });
}