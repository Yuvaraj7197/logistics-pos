import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService, Staff, Permission, ShiftSchedule, AttendanceRecord, PerformanceMetric, PayrollRecord } from '../../services/data';
import { Observable } from 'rxjs';

export interface Attendance {
  employeeId: string;
  employeeName: string|null;
  checkinTime: string | null;
  checkoutTime: string | null;
  hoursWorked: number;
  overtime: number;
  status: string;
}

@Component({
  selector: 'app-staff',
  imports: [CommonModule, FormsModule],
  templateUrl: './staff.html',
  styleUrl: './staff.scss'
})
export class StaffComponent implements OnInit {
  staff$: Observable<Staff[]>;
  showAddModal: boolean = false;
  showAttendanceModal: boolean = false;
  showShiftModal: boolean = false;
  showPerformanceModal: boolean = false;
  showPayrollModal: boolean = false;
  showPermissionsModal: boolean = false;
  selectedStaff: Staff | null = null;

  newStaff: Staff = {
    id: '',
    name: '',
    role: '',
    department: '',
    status: 'Present',
    email: '',
    phone: '',
    shift: '',
    salary: 0,
    biometricId: '',
    joiningDate: new Date().toISOString().split('T')[0],
    checkinTime: null,
    checkoutTime: null,
    productivityScore: 0,
    attendanceRate: 0,
    permissions: [],
    shiftSchedule: [],
    attendanceRecords: [],
    performanceMetrics: [],
    payrollRecords: []
  };

  newShiftSchedule: ShiftSchedule = {
    id: '',
    staffId: '',
    shiftType: 'Morning',
    startTime: '09:00',
    endTime: '17:00',
    workDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    effectiveDate: new Date().toISOString().split('T')[0],
    endDate: '',
    status: 'Active'
  };

  newPerformanceMetric: PerformanceMetric = {
    id: '',
    staffId: '',
    period: '',
    ordersHandled: 0,
    tasksCompleted: 0,
    efficiency: 0,
    qualityScore: 0,
    customerRating: 0,
    kpiScore: 0,
    lastUpdated: new Date().toISOString()
  };

  newPayrollRecord: PayrollRecord = {
    id: '',
    staffId: '',
    payPeriod: '',
    basicSalary: 0,
    overtimePay: 0,
    bonuses: 0,
    deductions: 0,
    netSalary: 0,
    status: 'Pending',
    processedDate: '',
    paymentMethod: 'Bank Transfer'
  };

  // Mock data for demonstration
  attendanceData: AttendanceRecord[] = [
    {
      id: 'ATT001',
      staffId: 'EMP001',
      date: '2024-09-25',
      checkInTime: '08:30',

      checkOutTime: '17:30',
      checkInMethod: 'Biometric',
      checkOutMethod: 'Biometric',
      hoursWorked: 9,
      overtime: 1,
      status: 'Present',
      notes: 'On time'
    },
    {
      id: 'ATT002',
      staffId: 'EMP002',
      date: '2024-09-25',
      checkInTime: '14:00',
      checkOutTime: '22:00',
      checkInMethod: 'RFID',
      checkOutMethod: 'RFID',
      hoursWorked: 8,
      overtime: 0,
      status: 'Present',
      notes: 'Afternoon shift'
    },
    {
      id: 'ATT003',
      staffId: 'EMP003',
      date: '2024-09-25',
      checkInTime: '',
      checkOutTime: '',
      checkInMethod: 'Manual',
      checkOutMethod: 'Manual',
      hoursWorked: 0,
      overtime: 0,
      status: 'On Leave',
      notes: 'Sick leave'
    }
  ];

  performanceData: PerformanceMetric[] = [
    {
      id: 'PERF001',
      staffId: 'EMP001',
      period: 'September 2024',
      ordersHandled: 45,
      tasksCompleted: 38,
      efficiency: 95,
      qualityScore: 92,
      customerRating: 4.5,
      kpiScore: 88,
      lastUpdated: '2024-09-25'
    },
    {
      id: 'PERF002',
      staffId: 'EMP002',
      period: 'September 2024',
      ordersHandled: 32,
      tasksCompleted: 30,
      efficiency: 88,
      qualityScore: 89,
      customerRating: 4.2,
      kpiScore: 85,
      lastUpdated: '2024-09-25'
    }
  ];

  payrollData: PayrollRecord[] = [
    {
      id: 'PAY001',
      staffId: 'EMP001',
      payPeriod: 'September 2024',
      basicSalary: 50000,
      overtimePay: 5000,
      bonuses: 2000,
      deductions: 3000,
      netSalary: 54000,
      status: 'Paid',
      processedDate: '2024-09-30',
      paymentMethod: 'Bank Transfer'
    },
    {
      id: 'PAY002',
      staffId: 'EMP002',
      payPeriod: 'September 2024',
      basicSalary: 40000,
      overtimePay: 3000,
      bonuses: 1500,
      deductions: 2500,
      netSalary: 42000,
      status: 'Paid',
      processedDate: '2024-09-30',
      paymentMethod: 'Bank Transfer'
    }
  ];

  // Filters
  departmentFilter: string = '';
  roleFilter: string = '';
  statusFilter: string = '';

  constructor(private dataService: DataService) {
    this.staff$ = this.dataService.getStaff();
  }

  ngOnInit(): void {
    this.generateStaffId();
  }

  generateStaffId(): void {
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.newStaff.id = `EMP${random}`;
  }

  showAddStaffModal(): void {
    this.showAddModal = true;
    this.generateStaffId();
  }

  hideAddStaffModal(): void {
    this.showAddModal = false;
    this.resetForm();
  }

  showAttendanceManagement(): void {
    this.showAttendanceModal = true;
  }

  hideAttendanceModal(): void {
    this.showAttendanceModal = false;
  }

  addStaff(): void {
    if (this.isFormValid()) {
      this.dataService.addStaff({...this.newStaff});
      this.hideAddStaffModal();
    }
  }

  updateStaffStatus(staff: Staff, status: string): void {
    const updatedStaff = {...staff, status};
    this.dataService.updateStaff(updatedStaff);
  }

  checkIn(staff: Staff): void {
    const now = new Date();
    const timeString = now.toTimeString().split(' ')[0].substring(0, 5);
    const updatedStaff = {...staff, checkinTime: timeString, status: 'Present'};
    this.dataService.updateStaff(updatedStaff);
  }

  checkOut(staff: Staff): void {
    const now = new Date();
    const timeString = now.toTimeString().split(' ')[0].substring(0, 5);
    const updatedStaff = {...staff, checkoutTime: timeString};
    this.dataService.updateStaff(updatedStaff);
  }

  getStaffStats(): { totalStaff: number, presentToday: number, onLeave: number, avgAttendance: number } {
    let totalStaff = 0;
    let presentToday = 0;
    let onLeave = 0;
    let totalAttendanceRate = 0;

    // This would need to be implemented with actual staff data
    return {
      totalStaff,
      presentToday,
      onLeave,
      avgAttendance: totalStaff > 0 ? Math.round(totalAttendanceRate / totalStaff) : 0
    };
  }

  getPresentStaffCount(): number {
    // This would need to be implemented with actual staff data
    return 0;
  }

  getOnLeaveStaffCount(): number {
    return this.attendanceData.filter(att => att.status === 'On Leave').length;
  }

  // Shift Management Methods
  showShiftManagement(): void {
    this.showShiftModal = true;
  }

  hideShiftModal(): void {
    this.showShiftModal = false;
  }

  createShiftSchedule(staffId: string): void {
    this.newShiftSchedule.staffId = staffId;
    this.newShiftSchedule.id = `SHIFT-${Date.now()}`;
    // Add to staff's shift schedule
    this.staff$.subscribe(staff => {
      const staffMember = staff.find(s => s.id === staffId);
      if (staffMember) {
        staffMember.shiftSchedule.push({...this.newShiftSchedule});
        this.dataService.updateStaff(staffMember);
      }
    });
  }

  // Performance Management Methods
  showPerformanceManagement(): void {
    this.showPerformanceModal = true;
  }

  hidePerformanceModal(): void {
    this.showPerformanceModal = false;
  }

  addPerformanceMetric(staffId: string): void {
    this.newPerformanceMetric.staffId = staffId;
    this.newPerformanceMetric.id = `PERF-${Date.now()}`;
    this.newPerformanceMetric.lastUpdated = new Date().toISOString();

    this.staff$.subscribe(staff => {
      const staffMember = staff.find(s => s.id === staffId);
      if (staffMember) {
        staffMember.performanceMetrics.push({...this.newPerformanceMetric});
        this.dataService.updateStaff(staffMember);
      }
    });
  }

  calculateKPIScore(metric: PerformanceMetric): number {
    const efficiencyWeight = 0.3;
    const qualityWeight = 0.3;
    const customerWeight = 0.2;
    const taskWeight = 0.2;

    return Math.round(
      (metric.efficiency * efficiencyWeight) +
      (metric.qualityScore * qualityWeight) +
      (metric.customerRating * 20 * customerWeight) +
      ((metric.tasksCompleted / metric.ordersHandled) * 100 * taskWeight)
    );
  }

  // Payroll Management Methods
  showPayrollManagement(): void {
    this.showPayrollModal = true;
  }

  hidePayrollModal(): void {
    this.showPayrollModal = false;
  }

  generatePayroll(staffId: string, payPeriod: string): void {
    this.staff$.subscribe(staff => {
      const staffMember = staff.find(s => s.id === staffId);
      if (staffMember) {
        this.newPayrollRecord.staffId = staffId;
        this.newPayrollRecord.payPeriod = payPeriod;
        this.newPayrollRecord.id = `PAY-${Date.now()}`;
        this.newPayrollRecord.basicSalary = staffMember.salary;

        // Calculate overtime based on attendance
        const attendance = this.attendanceData.find(att => att.staffId === staffId);
        if (attendance && attendance.overtime > 0) {
          this.newPayrollRecord.overtimePay = attendance.overtime * (staffMember.salary / 160); // Assuming 160 hours per month
        }

        this.newPayrollRecord.netSalary =
          this.newPayrollRecord.basicSalary +
          this.newPayrollRecord.overtimePay +
          this.newPayrollRecord.bonuses -
          this.newPayrollRecord.deductions;

        staffMember.payrollRecords.push({...this.newPayrollRecord});
        this.dataService.updateStaff(staffMember);
      }
    });
  }

  // Permissions Management Methods
  showPermissionsManagement(): void {
    this.showPermissionsModal = true;
  }

  hidePermissionsModal(): void {
    this.showPermissionsModal = false;
  }

  assignPermissions(staffId: string, permissions: Permission[]): void {
    this.staff$.subscribe(staff => {
      const staffMember = staff.find(s => s.id === staffId);
      if (staffMember) {
        staffMember.permissions = permissions;
        this.dataService.updateStaff(staffMember);
      }
    });
  }

  // Biometric Integration Methods
  processBiometricCheckIn(biometricId: string): void {
    this.staff$.subscribe(staff => {
      const staffMember = staff.find(s => s.biometricId === biometricId);
      if (staffMember) {
        this.checkIn(staffMember);
        this.addAttendanceRecord(staffMember.id, 'Biometric');
      }
    });
  }

  processBiometricCheckOut(biometricId: string): void {
    this.staff$.subscribe(staff => {
      const staffMember = staff.find(s => s.biometricId === biometricId);
      if (staffMember) {
        this.checkOut(staffMember);
        this.updateAttendanceRecord(staffMember.id, 'Biometric');
      }
    });
  }

  // Attendance Record Methods
  addAttendanceRecord(staffId: string, method: 'Biometric' | 'RFID' | 'Mobile' | 'Manual'): void {
    const now = new Date();
    const timeString = now.toTimeString().split(' ')[0].substring(0, 5);

    const newRecord: AttendanceRecord = {
      id: `ATT-${Date.now()}`,
      staffId: staffId,
      date: now.toISOString().split('T')[0],
      checkInTime: timeString,
      checkOutTime: '',
      checkInMethod: method,
      checkOutMethod: 'Manual',
      hoursWorked: 0,
      overtime: 0,
      status: 'Present',
      notes: `${method} check-in`
    };

    this.attendanceData.push(newRecord);
  }

  updateAttendanceRecord(staffId: string, method: 'Biometric' | 'RFID' | 'Mobile' | 'Manual'): void {
    const now = new Date();
    const timeString = now.toTimeString().split(' ')[0].substring(0, 5);

    const record = this.attendanceData.find(att =>
      att.staffId === staffId &&
      att.date === now.toISOString().split('T')[0] &&
      att.checkOutTime === ''
    );

    if (record) {
      record.checkOutTime = timeString;
      record.checkOutMethod = method;

      // Calculate hours worked
      const checkIn = new Date(`2000-01-01T${record.checkInTime}:00`);
      const checkOut = new Date(`2000-01-01T${record.checkOutTime}:00`);
      const hoursWorked = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);

      record.hoursWorked = Math.round(hoursWorked * 100) / 100;

      if (hoursWorked > 8) {
        record.overtime = hoursWorked - 8;
      }
    }
  }

  // Analytics Methods
  getAttendanceStats(): { totalDays: number, presentDays: number, absentDays: number, avgHours: number } {
    const totalDays = this.attendanceData.length;
    const presentDays = this.attendanceData.filter(att => att.status === 'Present').length;
    const absentDays = this.attendanceData.filter(att => att.status === 'Absent').length;
    const avgHours = totalDays > 0 ?
      this.attendanceData.reduce((sum, att) => sum + att.hoursWorked, 0) / totalDays : 0;

    return { totalDays, presentDays, absentDays, avgHours: Math.round(avgHours * 100) / 100 };
  }

  getProductivityStats(): { avgEfficiency: number, avgQuality: number, avgCustomerRating: number } {
    const avgEfficiency = this.performanceData.length > 0 ?
      this.performanceData.reduce((sum, perf) => sum + perf.efficiency, 0) / this.performanceData.length : 0;
    const avgQuality = this.performanceData.length > 0 ?
      this.performanceData.reduce((sum, perf) => sum + perf.qualityScore, 0) / this.performanceData.length : 0;
    const avgCustomerRating = this.performanceData.length > 0 ?
      this.performanceData.reduce((sum, perf) => sum + perf.customerRating, 0) / this.performanceData.length : 0;

    return {
      avgEfficiency: Math.round(avgEfficiency * 100) / 100,
      avgQuality: Math.round(avgQuality * 100) / 100,
      avgCustomerRating: Math.round(avgCustomerRating * 100) / 100
    };
  }

  getPayrollStats(): { totalPaid: number, avgSalary: number, pendingPayments: number } {
    const totalPaid = this.payrollData.reduce((sum, pay) => sum + pay.netSalary, 0);
    const avgSalary = this.payrollData.length > 0 ? totalPaid / this.payrollData.length : 0;
    const pendingPayments = this.payrollData.filter(pay => pay.status === 'Pending').length;

    return { totalPaid, avgSalary: Math.round(avgSalary), pendingPayments };
  }

  // Export Methods
  exportStaffData(): void {
    const csvContent = "ID,Name,Role,Department,Status,Email,Phone,Salary,Joining Date\n" +
      this.staff$.pipe().subscribe(staff =>
        staff.map(s =>
          `${s.id},${s.name},${s.role},${s.department},${s.status},${s.email},${s.phone},${s.salary},${s.joiningDate}`
        ).join("\n")
      );

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'staff_export.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  }

  exportAttendanceReport(): void {
    const csvContent = "Staff ID,Date,Check In,Check Out,Hours Worked,Overtime,Status,Notes\n" +
      this.attendanceData.map(att =>
        `${att.staffId},${att.date},${att.checkInTime},${att.checkOutTime},${att.hoursWorked},${att.overtime},${att.status},${att.notes}`
      ).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'attendance_report.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  }

  exportPayrollReport(): void {
    const csvContent = "Staff ID,Pay Period,Basic Salary,Overtime,Bonuses,Deductions,Net Salary,Status\n" +
      this.payrollData.map(pay =>
        `${pay.staffId},${pay.payPeriod},${pay.basicSalary},${pay.overtimePay},${pay.bonuses},${pay.deductions},${pay.netSalary},${pay.status}`
      ).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'payroll_report.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  }

  private isFormValid(): boolean {
    return !!(this.newStaff.name && this.newStaff.role && this.newStaff.department && this.newStaff.email);
  }

  private resetForm(): void {
    this.newStaff = {
      id: '',
      name: '',
      role: '',
      department: '',
      status: 'Present',
      email: '',
      phone: '',
      shift: '',
      salary: 0,
      biometricId: '',
      joiningDate: new Date().toISOString().split('T')[0],
      checkinTime: null,
      checkoutTime: null,
      productivityScore: 0,
      attendanceRate: 0,
      permissions: [],
      shiftSchedule: [],
      attendanceRecords: [],
      performanceMetrics: [],
      payrollRecords: []
    };
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'present': return 'status-delivered';
      case 'on leave': return 'status-cancelled';
      case 'absent': return 'status-cancelled';
      default: return 'status-pending';
    }
  }
}
