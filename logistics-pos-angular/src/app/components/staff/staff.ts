import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService, Staff } from '../../services/data';
import { Observable } from 'rxjs';

export interface Attendance {
  employeeId: string;
  employeeName: string;
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
    attendanceRate: 0
  };

  attendanceData: Attendance[] = [
    { employeeId: 'EMP001', employeeName: 'John Smith', checkinTime: '06:15', checkoutTime: null, hoursWorked: 8, overtime: 0, status: 'Present' },
    { employeeId: 'EMP002', employeeName: 'Sarah Johnson', checkinTime: '14:00', checkoutTime: null, hoursWorked: 6, overtime: 0, status: 'Present' },
    { employeeId: 'EMP003', employeeName: 'Mike Wilson', checkinTime: null, checkoutTime: null, hoursWorked: 0, overtime: 0, status: 'On Leave' }
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
    // This would need to be implemented with actual staff data
    return 0;
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
      attendanceRate: 0
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
