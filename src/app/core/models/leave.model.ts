export interface Leave {
  id: number;
  fromDate: string; // start date of leave
  toDate: string; // end date of leave
  type: 'Sick' | 'Casual';
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  userId: number;
}

export interface LeaveWithUser extends Leave {
  userEmail: string;
  rejectReason?: string;
}
