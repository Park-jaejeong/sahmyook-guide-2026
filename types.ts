export interface Doctor {
  name: string;
  role: string;
  hours?: string[];
  breakDays?: string;
  note?: string;
}

export interface RegistrationTime {
  firstVisit: string;
  reVisit: string;
  note?: string;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  engName?: string;
  location: string;
  phone: string;
  description: string; // Summarized from subjects for the header
  subjects: string[];
  impossible: string[];
  hours: string[]; // General hours
  breakInfo: string;
  registration: RegistrationTime;
  doctors: Doctor[];
  requirements: string[]; // 진료과 요구사항
  tests?: string[]; // 검사 가능 항목
}
