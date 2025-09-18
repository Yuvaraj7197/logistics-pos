// Staff Management JavaScript
const STAFF_STORAGE_KEY = 'logosic_staff_v1';
const ATTENDANCE_STORAGE_KEY = 'logosic_attendance_v1';
const LEAVE_STORAGE_KEY = 'logistics_leave_requests';
const SHIFTS_STORAGE_KEY = 'logistics_shifts';

const STAFF_DEPARTMENTS = getConfig('business.staff.departments', ['Production', 'Quality', 'Maintenance', 'Admin', 'HR', 'Finance']);
const STAFF_ROLES = getConfig('business.staff.roles', ['Manager', 'Supervisor', 'Operator', 'Technician', 'Assistant', 'Clerk', 'Driver']);
const SHIFT_TYPES = getConfig('business.staff.shifts', [
  { name: 'Morning', start: '09:00', end: '18:00', duration: 9 },
  { name: 'Evening', start: '14:00', end: '23:00', duration: 9 },
  { name: 'Night', start: '22:00', end: '07:00', duration: 9 }
]);
const LEAVE_TYPES = getConfig('business.staff.leaveTypes', ['Sick Leave', 'Personal Leave', 'Vacation', 'Emergency', 'Maternity/Paternity']);
const LEAVE_STATUS = getConfig('business.staff.leaveStatuses', ['Pending', 'Approved', 'Rejected']);

// Storage functions
function loadStaff() {
  try { 
    const raw = localStorage.getItem(STAFF_STORAGE_KEY); 
    if (raw) return JSON.parse(raw); 
  } catch (_) {}
  const seeded = [];
  saveStaff(seeded); 
  return seeded;
}

function saveStaff(list) { 
  localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(list)); 
}

function loadAttendance() { 
  try { 
    const r = localStorage.getItem(ATTENDANCE_STORAGE_KEY); 
    if (r) return JSON.parse(r); 
  } catch(_){} 
  return {}; 
}

function saveAttendance(map) { 
  localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(map)); 
}

function loadLeaveRequests(){ 
  const stored=localStorage.getItem(LEAVE_STORAGE_KEY); 
  return stored?JSON.parse(stored):[]; 
}

function saveLeaveRequests(list){ 
  localStorage.setItem(LEAVE_STORAGE_KEY, JSON.stringify(list)); 
}

function loadShifts(){ 
  const stored=localStorage.getItem(SHIFTS_STORAGE_KEY); 
  return stored?JSON.parse(stored):{}; 
}

function saveShifts(map){ 
  localStorage.setItem(SHIFTS_STORAGE_KEY, JSON.stringify(map)); 
}

// Utility functions
function staffBadgeClass(status){ 
  const s=(status||'').toLowerCase(); 
  if(s==='active') return 'status-badge status-active'; 
  if(s==='on leave') return 'status-badge status-inactive'; 
  return 'status-badge status-pending'; 
}

function leaveBadgeClass(status){ 
  const s=(status||'').toLowerCase(); 
  if(s==='approved') return 'status-badge status-active'; 
  if(s==='rejected') return 'status-badge status-inactive'; 
  return 'status-badge status-pending'; 
}

function attendanceBadgeClass(status){ 
  const s=(status||'').toLowerCase(); 
  if(s==='present') return 'status-badge status-active'; 
  if(s==='absent') return 'status-badge status-inactive'; 
  if(s==='late') return 'status-badge status-pending'; 
  return 'status-badge status-pending'; 
}

function generateStaffId(department, existing) {
  const deptCode = department.substring(0, 3).toUpperCase();
  let max = 0;
  existing.forEach(emp => {
    const n = parseInt((emp.id || '').replace(/[^0-9]/g, ''), 10);
    if (!isNaN(n)) max = Math.max(max, n);
  });
  const next = String(max + 1).padStart(3, '0');
  return `${deptCode}-${next}`;
}

function generateLeaveId() {
  return `LEAVE-${Date.now()}`;
}

// Main render function
function renderStaff(){
  const tbody=document.getElementById('staffTbody'); 
  if(!tbody) return;
  const staff=loadStaff(); 
  const attendance=loadAttendance(); 
  const today=new Date().toISOString().slice(0,10);
  
  // Apply filters
  const deptFilter = document.getElementById('deptFilter')?.value || '';
  const statusFilter = document.getElementById('statusFilter')?.value || '';
  const shiftFilter = document.getElementById('shiftFilter')?.value || '';
  const searchTerm = document.getElementById('searchStaff')?.value?.toLowerCase() || '';
  
  let filtered = staff.filter(emp => {
    if (deptFilter && emp.dept !== deptFilter) return false;
    if (statusFilter && emp.status !== statusFilter) return false;
    if (shiftFilter && emp.shift !== shiftFilter) return false;
    if (searchTerm) {
      const searchText = `${emp.id} ${emp.name} ${emp.role} ${emp.dept} ${emp.contact}`.toLowerCase();
      if (!searchText.includes(searchTerm)) return false;
    }
    return true;
  });
  
  // Initialize or update pagination
  if (!window.paginationInstances['staffContainer']) {
    createPagination('staffContainer');
  }
  
  const pagination = window.paginationInstances['staffContainer'];
  pagination.applyFilters(filtered);
  
  // Get current page data
  const currentPageData = pagination.getCurrentPageData();
  
  // Render table
  if (currentPageData.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" class="text-center" style="padding: 2rem; color: var(--gray-500);">
          <i class="pi pi-inbox" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
          No staff members found
        </td>
      </tr>
    `;
    updateStaffStats();
    return;
  }
  
  tbody.innerHTML = currentPageData.map(emp=>{
    const map=attendance[emp.id]||{}; 
    const todayAttendance = map[today];
    let todayStatus = '-';
    let todayStatusClass = 'status-badge status-pending';
    
    if (todayAttendance) {
      if (typeof todayAttendance === 'string') {
        // Old format
        todayStatus = todayAttendance === 'P' ? 'Present' : 'Absent';
        todayStatusClass = todayAttendance === 'P' ? 'status-badge status-active' : 'status-badge status-inactive';
      } else {
        // New format with detailed attendance
        todayStatus = todayAttendance.status === 'P' ? 'Present' : 'Absent';
        todayStatusClass = todayAttendance.status === 'P' ? 'status-badge status-active' : 'status-badge status-inactive';
      }
    }
    
    const dropdownId = `staffDropdown_${emp.id}`;
    const actions = `
      <div class="dropdown">
        <button class="dropdown-toggle" onclick="toggleDropdown('${dropdownId}')">
          <i class="pi pi-ellipsis-v"></i> Actions
        </button>
        <div class="dropdown-menu" id="${dropdownId}">
          <a class="dropdown-item" onclick="biometricCheckIn('${emp.id}', event); closeAllDropdowns();">
            <i class="pi pi-sign-in"></i> Check In
          </a>
          <a class="dropdown-item" onclick="biometricCheckOut('${emp.id}', event); closeAllDropdowns();">
            <i class="pi pi-sign-out"></i> Check Out
          </a>
          <div class="dropdown-divider"></div>
          <a class="dropdown-item" onclick="markAttendance('${emp.id}','P',event); closeAllDropdowns();">
            <i class="pi pi-check"></i> Mark Present
          </a>
          <a class="dropdown-item" onclick="markAttendance('${emp.id}','A',event); closeAllDropdowns();">
            <i class="pi pi-times"></i> Mark Absent
          </a>
          <div class="dropdown-divider"></div>
          <a class="dropdown-item" onclick="generatePayslip('${emp.id}',event); closeAllDropdowns();">
            <i class="pi pi-file"></i> Generate Payslip
          </a>
          <a class="dropdown-item" onclick="editStaff('${emp.id}', event); closeAllDropdowns();">
            <i class="pi pi-pencil"></i> Edit Staff
          </a>
          <div class="dropdown-divider"></div>
          <a class="dropdown-item" onclick="deleteStaff('${emp.id}', event); closeAllDropdowns();" style="color: var(--error-500);">
            <i class="pi pi-trash"></i> Delete Staff
          </a>
        </div>
      </div>
    `;
    return `
      <tr>
        <td><strong>${emp.id}</strong></td>
        <td>${emp.name}</td>
        <td>${emp.role}</td>
        <td>${emp.dept}</td>
        <td>${emp.shift || 'Morning'}</td>
        <td>${emp.contact}</td>
        <td>${emp.join}</td>
        <td><span class="${staffBadgeClass(emp.status)}">${emp.status}</span></td>
        <td><span class="${todayStatusClass}">${todayStatus}</span></td>
        <td>${actions}</td>
      </tr>
    `;
  }).join('');
  
  // Update statistics
  updateStaffStats();
}

function markAttendance(empId, mark, evt){ 
  if(evt) evt.stopPropagation(); 
  const map=loadAttendance(); 
  const day=new Date().toISOString().slice(0,10); 
  map[empId]=map[empId]||{}; 
  map[empId][day]=mark; 
  saveAttendance(map); 
  showToast('Attendance saved','success'); 
}

function monthAttendanceSummary(empId, ym){ 
  const map=loadAttendance()[empId]||{}; 
  const days=Object.keys(map).filter(d=>d.startsWith(ym)); 
  const p=days.filter(d=>map[d]==='P').length; 
  const a=days.filter(d=>map[d]==='A').length; 
  return {present:p, absent:a}; 
}

function generatePayslip(empId, evt){
  if(evt) evt.stopPropagation();
  const staff=loadStaff(); 
  const emp=staff.find(s=>s.id===empId); 
  if(!emp) return;
  const now=new Date(); 
  const ym=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
  const summary=monthAttendanceSummary(empId, ym);
  const basic=8000; 
  const hra=Math.round(basic*0.4); 
  const allowances=1000; 
  const gross=basic+hra+allowances; 
  const perDay=Math.round(gross/26); 
  const absentDeduction=summary.absent*perDay; 
  const net=gross-absentDeduction; 
  const qrData=encodeURIComponent(`${emp.id}|${emp.name}|${ym}|${net}`);
  const qrUrl=`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${qrData}`;
  const html=`
    <html><head><title>Payslip ${emp.id} ${ym}</title><meta charset='utf-8'/>
    <style>body{font-family:Inter,Segoe UI,Roboto,sans-serif;background:#f8fafc;margin:0;padding:24px;color:#111827}
    .slip{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:24px;max-width:850px;margin:0 auto}
    .row{display:flex;justify-content:space-between;align-items:flex-start;gap:16px} table{border-collapse:collapse;width:100%;margin-top:12px}
    th,td{border:1px solid #e5e7eb;padding:8px} th{background:#f9fafb;text-align:left}
    .muted{color:#6b7280}
    </style></head><body>
    <div class='slip'>
      <div class='row'>
        <div>
          <div style='font-weight:700'>Logosic Logistics</div>
          <div class='muted'>Payslip for ${ym}</div>
        </div>
        <img src='${qrUrl}' width='120' height='120'/>
      </div>
      <table>
        <tr><th>Employee</th><td>${emp.name}</td><th>ID</th><td>${emp.id}</td></tr>
        <tr><th>Role</th><td>${emp.role}</td><th>Department</th><td>${emp.dept}</td></tr>
      </table>
      <table>
        <thead><tr><th>Earnings</th><th>Amount</th><th>Deductions</th><th>Amount</th></tr></thead>
        <tbody>
          <tr><td>Basic</td><td>${formatINR(basic)}</td><td>Absences (${summary.absent} days)</td><td>${formatINR(absentDeduction)}</td></tr>
          <tr><td>HRA</td><td>${formatINR(hra)}</td><td></td><td></td></tr>
          <tr><td>Allowances</td><td>${formatINR(allowances)}</td><td></td><td></td></tr>
          <tr><th>Total Earnings</th><th>${formatINR(gross)}</th><th>Net Deductions</th><th>${formatINR(absentDeduction)}</th></tr>
        </tbody>
      </table>
      <div style='text-align:right;margin-top:8px;font-weight:700'>Net Pay: ${formatINR(net)}</div>
      <div class='muted' style='margin-top:8px'>This is a system-generated payslip.</div>
    </div>
    <script>window.onload=()=>{window.print();setTimeout(()=>window.close(),300)}<\/script>
    </body></html>`;
  const w=window.open('', '_blank'); 
  if(!w){ 
    showToast('Popup blocked. Allow popups to print.', 'error'); 
    return; 
  } 
  w.document.open(); 
  w.document.write(html); 
  w.document.close();
}

// Staff management functions
function addStaff() {
  const body = `
    <div class="form-section">
      <h4>Personal Information</h4>
      <div class="form-row">
        <div class="form-group col-6">
          <label>Full Name *</label>
          <input id="staffName" type="text" placeholder="Enter full name" required />
        </div>
        <div class="form-group col-6">
          <label>Email Address</label>
          <input id="staffEmail" type="email" placeholder="Enter email address" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group col-6">
          <label>Contact Number *</label>
          <input id="staffContact" type="tel" placeholder="Enter contact number" required />
        </div>
        <div class="form-group col-6">
          <label>Emergency Contact</label>
          <input id="staffEmergencyContact" type="tel" placeholder="Enter emergency contact" />
        </div>
      </div>
      <div class="form-group col-12">
        <label>Address</label>
        <textarea id="staffAddress" placeholder="Enter address" rows="3"></textarea>
      </div>
    </div>

    <div class="form-section">
      <h4>Work Information</h4>
      <div class="form-row">
        <div class="form-group col-6">
          <label>Role *</label>
          <select id="staffRole" required>
            <option value="">Select role...</option>
            ${STAFF_ROLES.map(role => `<option value="${role}">${role}</option>`).join('')}
          </select>
        </div>
        <div class="form-group col-6">
          <label>Department *</label>
          <select id="staffDepartment" required>
            <option value="">Select department...</option>
            ${STAFF_DEPARTMENTS.map(dept => `<option value="${dept}">${dept}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group col-6">
          <label>Shift *</label>
          <select id="staffShift" required>
            <option value="">Select shift...</option>
            ${SHIFT_TYPES.map(shift => `<option value="${shift.name}">${shift.name} (${shift.start} - ${shift.end})</option>`).join('')}
          </select>
        </div>
        <div class="form-group col-6">
          <label>Join Date *</label>
          <input id="staffJoinDate" type="date" required />
        </div>
      </div>
      <div class="form-group col-12">
        <label>Basic Salary (INR) *</label>
        <input id="staffSalary" type="number" min="0" placeholder="Enter basic salary" required />
      </div>
    </div>
  `;
  
  openModal('Add New Staff Member', body, [
    { label: 'Cancel', type: 'secondary', action: closeModal },
    { label: 'Add Staff', type: 'primary', action: () => {
      const name = document.getElementById('staffName').value.trim();
      const role = document.getElementById('staffRole').value;
      const department = document.getElementById('staffDepartment').value;
      const shift = document.getElementById('staffShift').value;
      const contact = document.getElementById('staffContact').value.trim();
      const email = document.getElementById('staffEmail').value.trim();
      const address = document.getElementById('staffAddress').value.trim();
      const joinDate = document.getElementById('staffJoinDate').value;
      const salary = parseInt(document.getElementById('staffSalary').value, 10);
      const emergencyContact = document.getElementById('staffEmergencyContact').value.trim();
      
      if (!name || !role || !department || !shift || !contact || !joinDate || isNaN(salary) || salary <= 0) {
        showToast('Please fill all required fields correctly', 'error');
        return;
      }
      
      const staff = loadStaff();
      const id = generateStaffId(department, staff);
      
      const newStaff = {
        id,
        name,
        role,
        dept: department,
        shift: shift,
        contact,
        email: email || 'N/A',
        address: address || 'N/A',
        join: joinDate,
        salary,
        emergencyContact: emergencyContact || 'N/A',
        status: 'Active',
        createdAt: new Date().toISOString()
      };
      
      staff.unshift(newStaff);
      saveStaff(staff);
      closeModal();
      renderStaff();
      updateStaffStats();
      updateDashboardStats(); // Update dashboard stats
      showToast(`Staff member ${name} added successfully`, 'success');
    }}
  ]);
  
  // Set default join date to today
  setTimeout(() => {
    const joinDateInput = document.getElementById('staffJoinDate');
    if (joinDateInput) {
      joinDateInput.value = new Date().toISOString().slice(0, 10);
    }
  }, 100);
}

function updateStaffStats() {
  const staff = loadStaff();
  const attendance = loadAttendance();
  const leaveRequests = loadLeaveRequests();
  const today = new Date().toISOString().slice(0, 10);
  
  const totalStaff = staff.length;
  const presentToday = staff.filter(emp => {
    const todayAttendance = attendance[emp.id]?.[today];
    return todayAttendance && todayAttendance.status === 'P';
  }).length;
  const onLeave = staff.filter(emp => emp.status === 'On Leave').length;
  const pendingLeave = leaveRequests.filter(req => req.status === 'Pending').length;
  
  const totalStaffEl = document.getElementById('totalStaffCount');
  const presentTodayEl = document.getElementById('presentTodayCount');
  const onLeaveEl = document.getElementById('onLeaveCount');
  const pendingLeaveEl = document.getElementById('pendingLeaveCount');
  
  if (totalStaffEl) totalStaffEl.textContent = totalStaff;
  if (presentTodayEl) presentTodayEl.textContent = presentToday;
  if (onLeaveEl) onLeaveEl.textContent = onLeave;
  if (pendingLeaveEl) pendingLeaveEl.textContent = pendingLeave;
}

// =============================================================================
// STAFF MANAGEMENT FUNCTIONS
// =============================================================================

/**
 * Edit staff member
 */
function editStaff(empId, evt) {
  if (evt) evt.stopPropagation();
  
  const staff = loadStaff();
  const emp = staff.find(s => s.id === empId);
  if (!emp) {
    showToast('Staff member not found', 'error');
    return;
  }
  
  const body = `
    <div class="form-section">
      <h4>Personal Information</h4>
      <div class="form-row">
        <div class="form-group col-6">
          <label>Full Name *</label>
          <input id="editStaffName" type="text" value="${emp.name}" placeholder="Enter full name" required />
        </div>
        <div class="form-group col-6">
          <label>Email Address</label>
          <input id="editStaffEmail" type="email" value="${emp.email || ''}" placeholder="Enter email address" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group col-6">
          <label>Contact Number *</label>
          <input id="editStaffContact" type="tel" value="${emp.contact}" placeholder="Enter contact number" required />
        </div>
        <div class="form-group col-6">
          <label>Emergency Contact</label>
          <input id="editStaffEmergencyContact" type="tel" value="${emp.emergencyContact || ''}" placeholder="Enter emergency contact" />
        </div>
      </div>
      <div class="form-group col-12">
        <label>Address</label>
        <textarea id="editStaffAddress" placeholder="Enter address" rows="3">${emp.address || ''}</textarea>
      </div>
    </div>

    <div class="form-section">
      <h4>Work Information</h4>
      <div class="form-row">
        <div class="form-group col-6">
          <label>Role *</label>
          <select id="editStaffRole" required>
            <option value="">Select role...</option>
            ${STAFF_ROLES.map(role => `<option value="${role}" ${role === emp.role ? 'selected' : ''}>${role}</option>`).join('')}
          </select>
        </div>
        <div class="form-group col-6">
          <label>Department *</label>
          <select id="editStaffDepartment" required>
            <option value="">Select department...</option>
            ${STAFF_DEPARTMENTS.map(dept => `<option value="${dept}" ${dept === emp.dept ? 'selected' : ''}>${dept}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group col-6">
          <label>Shift *</label>
          <select id="editStaffShift" required>
            <option value="">Select shift...</option>
            ${SHIFT_TYPES.map(shift => `<option value="${shift.name}" ${shift.name === emp.shift ? 'selected' : ''}>${shift.name} (${shift.start} - ${shift.end})</option>`).join('')}
          </select>
        </div>
        <div class="form-group col-6">
          <label>Join Date *</label>
          <input id="editStaffJoinDate" type="date" value="${emp.join}" required />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group col-6">
          <label>Basic Salary (INR) *</label>
          <input id="editStaffSalary" type="number" min="0" value="${emp.salary || 0}" placeholder="Enter basic salary" required />
        </div>
        <div class="form-group col-6">
          <label>Status *</label>
          <select id="editStaffStatus" required>
            <option value="Active" ${emp.status === 'Active' ? 'selected' : ''}>Active</option>
            <option value="On Leave" ${emp.status === 'On Leave' ? 'selected' : ''}>On Leave</option>
            <option value="Inactive" ${emp.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
          </select>
        </div>
      </div>
    </div>
  `;
  
  openModal('Edit Staff Member', body, [
    { label: 'Cancel', type: 'secondary', action: closeModal },
    { label: 'Update Staff', type: 'primary', action: () => {
      const name = document.getElementById('editStaffName').value.trim();
      const role = document.getElementById('editStaffRole').value;
      const department = document.getElementById('editStaffDepartment').value;
      const shift = document.getElementById('editStaffShift').value;
      const contact = document.getElementById('editStaffContact').value.trim();
      const email = document.getElementById('editStaffEmail').value.trim();
      const address = document.getElementById('editStaffAddress').value.trim();
      const joinDate = document.getElementById('editStaffJoinDate').value;
      const salary = parseInt(document.getElementById('editStaffSalary').value, 10);
      const emergencyContact = document.getElementById('editStaffEmergencyContact').value.trim();
      const status = document.getElementById('editStaffStatus').value;
      
      if (!name || !role || !department || !shift || !contact || !joinDate || isNaN(salary) || salary <= 0) {
        showToast('Please fill all required fields correctly', 'error');
        return;
      }
      
      // Update staff member
      const updatedStaff = {
        ...emp,
        name,
        role,
        dept: department,
        shift,
        contact,
        email: email || 'N/A',
        address: address || 'N/A',
        join: joinDate,
        salary,
        emergencyContact: emergencyContact || 'N/A',
        status,
        updatedAt: new Date().toISOString()
      };
      
      const staffIndex = staff.findIndex(s => s.id === empId);
      if (staffIndex !== -1) {
        staff[staffIndex] = updatedStaff;
        saveStaff(staff);
        closeModal();
        renderStaff();
        updateStaffStats();
        updateDashboardStats(); // Update dashboard stats
        showToast(`Staff member ${name} updated successfully`, 'success');
      } else {
        showToast('Staff member not found', 'error');
      }
    }}
  ]);
}

/**
 * Delete staff member
 */
function deleteStaff(empId, evt) {
  if (evt) evt.stopPropagation();
  
  const staff = loadStaff();
  const emp = staff.find(s => s.id === empId);
  if (!emp) {
    showToast('Staff member not found', 'error');
    return;
  }
  
  confirmAction('Are you sure you want to delete this staff member? This action cannot be undone.', () => {
    try {
      // Remove from staff list
      const updatedStaff = staff.filter(s => s.id !== empId);
      saveStaff(updatedStaff);
      
      // Remove attendance records
      const attendance = loadAttendance();
      delete attendance[empId];
      saveAttendance(attendance);
      
      // Remove from shifts
      const shifts = loadShifts();
      delete shifts[empId];
      saveShifts(shifts);
      
      // Re-render and update stats
      renderStaff();
      updateStaffStats();
      
      showToast(`Staff member ${emp.name} deleted successfully`, 'success');
    } catch (error) {
      console.error('Error deleting staff:', error);
      showToast('Error deleting staff member', 'error');
    }
  });
}

/**
 * Biometric check-in
 */
function biometricCheckIn(empId, evt) {
  if (evt) evt.stopPropagation();
  
  const staff = loadStaff();
  const emp = staff.find(s => s.id === empId);
  if (!emp) {
    showToast('Staff member not found', 'error');
    return;
  }
  
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const time = now.toTimeString().slice(0, 8);
  
  const attendance = loadAttendance();
  if (!attendance[empId]) {
    attendance[empId] = {};
  }
  
  // Check if already checked in today
  if (attendance[empId][today] && attendance[empId][today].checkIn) {
    showToast(`${emp.name} has already checked in today`, 'warning');
    return;
  }
  
  attendance[empId][today] = {
    ...attendance[empId][today],
    checkIn: time,
    status: 'P'
  };
  
  saveAttendance(attendance);
  renderStaff();
  updateStaffStats();
  showToast(`${emp.name} checked in at ${time}`, 'success');
}

/**
 * Biometric check-out
 */
function biometricCheckOut(empId, evt) {
  if (evt) evt.stopPropagation();
  
  const staff = loadStaff();
  const emp = staff.find(s => s.id === empId);
  if (!emp) {
    showToast('Staff member not found', 'error');
    return;
  }
  
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const time = now.toTimeString().slice(0, 8);
  
  const attendance = loadAttendance();
  if (!attendance[empId] || !attendance[empId][today] || !attendance[empId][today].checkIn) {
    showToast(`${emp.name} must check in first`, 'warning');
    return;
  }
  
  // Check if already checked out today
  if (attendance[empId][today].checkOut) {
    showToast(`${emp.name} has already checked out today`, 'warning');
    return;
  }
  
  attendance[empId][today] = {
    ...attendance[empId][today],
    checkOut: time
  };
  
  saveAttendance(attendance);
  renderStaff();
  updateStaffStats();
  showToast(`${emp.name} checked out at ${time}`, 'success');
}

/**
 * Close all dropdowns
 */
function closeAllDropdowns() {
  document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
    menu.classList.remove('show');
  });
}
