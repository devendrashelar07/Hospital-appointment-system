// Basic & Simple Hospital Appointment System Logic

// Storage key in browser localStorage
const STORAGE_KEY = 'simple_hospital_appointments';

// Initial sample data if no data exists in localStorage
const defaultAppointments = [
  {
    id: 1,
    name: 'Rahul Verma',
    phone: '9876543210',
    doctor: 'Dr. Sharma (General Physician)',
    date: '2026-10-15',
    time: '10:00 AM',
    symptoms: 'Mild fever and cough',
    status: 'Confirmed'
  },
  {
    id: 2,
    name: 'Sneha Patel',
    phone: '9123456780',
    doctor: 'Dr. Priya Patel (Cardiologist)',
    date: '2026-10-16',
    time: '11:30 AM',
    symptoms: 'Routine heart checkup',
    status: 'Confirmed'
  }
];

// Load appointments from localStorage or use defaults
function getAppointments() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultAppointments));
    return defaultAppointments;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

// Save appointments to localStorage
function saveAppointments(appointments) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
}

// Display feedback message
function showMessage(text, type = 'success') {
  const msgBox = document.getElementById('message');
  msgBox.textContent = text;
  msgBox.className = `message ${type}`;

  setTimeout(() => {
    msgBox.textContent = '';
    msgBox.className = 'message';
  }, 4000);
}

// Render appointments table
function renderAppointments(filterText = '') {
  const tbody = document.getElementById('appointmentTableBody');
  const appointments = getAppointments();

  // Filter appointments if search keyword is provided
  const search = filterText.trim().toLowerCase();
  const filtered = appointments.filter(apt => 
    apt.name.toLowerCase().includes(search) || 
    apt.doctor.toLowerCase().includes(search) ||
    apt.phone.includes(search)
  );

  // If no appointments found
  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="empty-text">No appointments found.</td>
      </tr>
    `;
    return;
  }

  // Populate table rows
  tbody.innerHTML = filtered.map((apt, index) => `
    <tr>
      <td>${index + 1}</td>
      <td><strong>${escapeHtml(apt.name)}</strong></td>
      <td>${escapeHtml(apt.phone)}</td>
      <td>${escapeHtml(apt.doctor)}</td>
      <td>${apt.date}</td>
      <td>${apt.time}</td>
      <td><span class="badge">${apt.status}</span></td>
      <td>
        <button class="btn btn-danger" onclick="cancelAppointment(${apt.id})">Cancel</button>
      </td>
    </tr>
  `).join('');
}

// Helper to prevent HTML injection
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, function(m) {
    switch (m) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#39;';
      default: return m;
    }
  });
}

// Cancel / Delete appointment
function cancelAppointment(id) {
  const appointments = getAppointments();
  const target = appointments.find(a => a.id === id);

  if (!target) return;

  const confirmed = confirm(`Are you sure you want to cancel the appointment for ${target.name}?`);
  if (!confirmed) return;

  const updated = appointments.filter(a => a.id !== id);
  saveAppointments(updated);
  
  const searchInput = document.getElementById('searchInput');
  renderAppointments(searchInput ? searchInput.value : '');
  showMessage(`Appointment for ${target.name} has been cancelled.`, 'error');
}

// Handle Form Submission
document.getElementById('appointmentForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const name = document.getElementById('patientName').value.trim();
  const phone = document.getElementById('patientPhone').value.trim();
  const doctor = document.getElementById('doctorSelect').value;
  const date = document.getElementById('appointmentDate').value;
  const time = document.getElementById('appointmentTime').value;
  const symptoms = document.getElementById('symptoms').value.trim();

  // Basic validation
  if (!name || !phone || !doctor || !date || !time) {
    showMessage('Please fill in all required fields.', 'error');
    return;
  }

  // Create new appointment object
  const newAppointment = {
    id: Date.now(),
    name: name,
    phone: phone,
    doctor: doctor,
    date: date,
    time: time,
    symptoms: symptoms,
    status: 'Confirmed'
  };

  // Add to existing list and save
  const appointments = getAppointments();
  appointments.push(newAppointment);
  saveAppointments(appointments);

  // Re-render table and clear form
  renderAppointments();
  this.reset();

  // Reset minimum date
  initDateInput();

  showMessage(`Appointment successfully booked for ${name}!`, 'success');
});

// Search input live filter
const searchInput = document.getElementById('searchInput');
if (searchInput) {
  searchInput.addEventListener('input', function() {
    renderAppointments(this.value);
  });
}

// Initialize minimum date to today (cannot book in the past)
function initDateInput() {
  const dateInput = document.getElementById('appointmentDate');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
  }
}

// Run on page load
document.addEventListener('DOMContentLoaded', function() {
  initDateInput();
  renderAppointments();
});
