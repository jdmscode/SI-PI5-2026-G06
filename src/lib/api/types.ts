/** Formato dos dados trocados com a API REST. */

export type RiskLevel = "low" | "medium" | "high";

export interface DashboardMetric {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral" | "alert";
}

export interface DashboardSummary {
  greetingName?: string;
  metrics: DashboardMetric[];
  recentPatients: RecentPatientRow[];
}

export interface RecentPatientRow {
  id: string;
  name: string;
  age: number;
  lastVisit: string;
  lesions: number;
  status: RiskLevel;
}

export interface PatientListItem {
  id: string;
  name: string;
  age: number;
  cpfMasked: string;
  lesions: number;
  status: RiskLevel;
  lastVisit: string;
}

export interface PatientDetail {
  id: string;
  name: string;
  age: number;
  gender?: string;
  cpfMasked?: string;
  fitzpatrickType?: string;
  familyHistory?: boolean;
  overallRisk: RiskLevel;
  initials?: string;
}

export interface LesionTimelineEntry {
  id: string;
  date: string;
  zone: string;
  risk: RiskLevel;
  notes: string;
}

export interface LoginCredentials {
  crm: string;
  uf: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user?: {
    fullName?: string;
    specialty?: string;
    crm?: string;
    uf?: string;
  };
}

export interface UserProfile {
  fullName: string;
  specialty: string;
  crm: string;
  uf: string;
}

export interface AbcdeCriterion {
  key: string;
  title: string;
  detected: string;
  severity: RiskLevel;
}

export interface AnalysisDetail {
  id: string;
  riskPercent: number;
  riskLabel: string;
  diagnosisHint?: string;
  modelName?: string;
  modelVersion?: string;
  originalImageUrl?: string;
  heatmapImageUrl?: string;
  abcde: AbcdeCriterion[];
}
