export interface TeamMember {
  id: string;
  name: string;
  avatarColor: string;
  role: string;
  available: boolean; // Se está disponível hoje
  createdAt: number;
}

export interface TaskRecord {
  id: string;
  memberId: string;
  memberName: string;
  memberRole?: string;
  timestamp: number; // startedAt timestamp
  completedAt?: number; // finished timestamp
  status?: 'in_progress' | 'completed'; // default in_progress
  dateKey: string; // YYYY-MM-DD
  taskTitle?: string;
  notes?: string;
}

export interface PredefinedTask {
  id: string;
  title: string;
  category?: string;
  createdAt?: number;
}

export interface MonthReportFilter {
  memberId?: string;
  role?: string;
  month?: string; // YYYY-MM
  startDate?: string;
  endDate?: string;
}
