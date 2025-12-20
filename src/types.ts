export interface Employee {
  id: string;
  name: string;
  staffId: string;
  position: string;
  department: string;
  contactNumber: string;
  joinedDate: string;
}

export interface AttendanceRecord {
  date: string;
  dutyTime: string;
  inTime1: string;
  outTime1: string;
  inTime2: string;
  outTime2: string;
  inTime3: string;
  outTime3: string;
  medical: boolean;
  absent: boolean;
  remarks: string;
  gracePeriod?: number;
}

export interface EmployeeAttendance {
  employeeId: string;
  records: AttendanceRecord[];
}

export interface roster_assignment {
  id: string;
  employee_id: string;
  date: string;
  shift_id: string;
  shift_type_id: string;
}

export interface Shift {
  id: string;
  name: string;
  description: string;
  start_time: string;
  end_time: string;
  color: string;
  grace_period: number;
}