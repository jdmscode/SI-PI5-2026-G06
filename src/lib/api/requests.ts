import { apiFetch } from "./client";
import type {
  AnalysisDetail,
  DashboardSummary,
  LesionTimelineEntry,
  LoginCredentials,
  LoginResponse,
  PatientDetail,
  PatientListItem,
  UserProfile,
} from "./types";

export function fetchCurrentUser() {
  return apiFetch<UserProfile>("/auth/me");
}

export function loginRequest(credentials: LoginCredentials) {
  return apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export function fetchDashboardSummary() {
  return apiFetch<DashboardSummary>("/dashboard/summary");
}

export function fetchPatients() {
  return apiFetch<PatientListItem[]>("/patients");
}

export function fetchPatient(id: string) {
  return apiFetch<PatientDetail>(`/patients/${encodeURIComponent(id)}`);
}

export function fetchPatientLesions(patientId: string) {
  return apiFetch<LesionTimelineEntry[]>(
    `/patients/${encodeURIComponent(patientId)}/lesions`
  );
}

export function fetchAnalysis(analysisId: string) {
  return apiFetch<AnalysisDetail>(`/analyses/${encodeURIComponent(analysisId)}`);
}
