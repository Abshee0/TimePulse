export interface Employee {
  id: string;
  name: string;
  staffId: string;
  position: string;
  department: string;
  contactNumber: string;
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
}

export interface EmployeeAttendance {
  employeeId: string;
  records: AttendanceRecord[];
}