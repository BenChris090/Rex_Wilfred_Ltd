export interface User {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'state_head' | 'team_member';
  state?: string;
  bankInfo?: {
    accountName: string;
    accountNumber: string;
    bankName: string;
  };
  createdAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedBy: string;
  state: string;
  reward: number;
  status: 'assigned' | 'submitted' | 'approved' | 'verified';
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
  approvedBy?: string;
  verifiedBy?: string;
  approvedAt?: Date;
  verifiedAt?: Date;
}

export interface TaskSubmission {
  id: string;
  taskId: string;
  userId: string;
  proofText?: string;
  proofFiles?: string[];
  submittedAt: Date;
  status: 'all' | 'assigned' | 'submitted' | 'approved' | 'rejected' | 'verified';
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
}

export interface PaymentSummary {
  totalEarned: number;
  totalPaid: number;
  pendingPayout: number;
  bankInfo: {
    accountName: string;
    accountNumber: string;
    bankName: string;
  };
} 