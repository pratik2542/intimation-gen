export interface ExtractedData {
  policyNo: string;
  insuredName: string;
  patientName: string; // e.g. "Self" or "Namitaben"
  patientRelation: string; // e.g. "Wife" or empty if self
  doa: string;
  disease: string;
  mobile: string;
  doctorHospital: string;
}

export interface EmailConfig {
  to: string;
  cc: string;
  bcc: string;
  subject: string;
  body: string;
}

export enum AppStep {
  INPUT = 'INPUT',
  REVIEW = 'REVIEW'
}