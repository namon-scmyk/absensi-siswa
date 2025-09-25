// app-complete.js — Versi Final untuk Migrasi Penuh ke Supabase

class SupabaseService {
  constructor() {
    this.SUPABASE_URL = 'https://lleviwszkjhoyqvpiapu.supabase.co';
    this.SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsZXZpd3N6a2pob3lxdnBpYXB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1MDc3MjcsImV4cCI6MjA3NDA4MzcyN30.YP6WYMiwJch6lhk2AiLUtUwyGZ5soO382MjqKD4jwg4';
    this.supabase = window.supabase.createClient(this.SUPABASE_URL, this.SUPABASE_ANON_KEY);
  }

  // === SISWA ===
  async getStudents() {
    const { data, error } = await this.supabase
      .from('students')
      .select('*')
      .order('class', { ascending: true })
      .order('name', { ascending: true });
    if (error) throw error;
    return data || [];
  }

  async saveStudent(studentData) {
    const { data, error } = await this.supabase
      .from('students')
      .upsert(studentData, { onConflict: 'nis' })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async deleteStudent(studentId) {
    const { error } = await this.supabase
      .from('students')
      .delete()
      .eq('id', studentId);
    if (error) throw error;
  }

  // === PRESENSI ===
  async getAttendance() {
    const { data, error } = await this.supabase
      .from('attendance')
      .select('*')
      .order('date', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async saveAttendance(attendanceData) {
    const { data, error } = await this.supabase
      .from('attendance')
      .upsert(attendanceData, { onConflict: 'class_name,date,subject' })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // === JURNAL ===
  async getJournals() {
    const { data, error } = await this.supabase
      .from('journals')
      .select('*')
      .order('date', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async saveJournal(journalData) {
    const { data, error } = await this.supabase
      .from('journals')
      .insert(journalData)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async deleteJournal(journalId) {
    const { error } = await this.supabase
      .from('journals')
      .delete()
      .eq('id', journalId);
    if (error) throw error;
  }

  // === PROFIL GURU ===
  async getTeacherProfile() {
    const { data, error } = await this.supabase
      .from('teacher_profiles')
      .select('*')
      .limit(1)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async saveTeacherProfile(profileData) {
    const { data, error } = await this.supabase
      .from('teacher_profiles')
      .upsert(profileData)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}

// === UI UPDATE FUNCTIONS ===
function updateStudentsTable(students) {
  const tbody = document.getElementById('studentsTableBody');
  if (!tbody) return;
  if (students.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="p-4 text-center">Belum ada data siswa</td></tr>';
    return;
  }
  tbody.innerHTML = students.map(student => `
    <tr class="border-b border-gray-100 hover:bg-gray-50">
      <td class="p-4 font-medium text-gray-900">${student.nis}</td>
      <td class="p-4">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span class="text-sm font-medium text-blue-600">${student.name.charAt(0)}</span>
          </div>
          <div>
            <span class="font-medium text-gray-900">${student.name}</span>
            ${student.gender ? `<p class="text-xs text-gray-500">${student.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</p>` : ''}
          </div>
        </div>
      </td>
      <td class="p-4">
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          ${student.class}
        </span>
      </td>
      <td class="p-4">
        <div class="flex items-center space-x-2">
          <div class="flex-1 bg-gray-200 rounded-full h-2">
            <div class="bg-green-500 h-2 rounded-full" style="width: ${student.attendance_rate || 0}%"></div>
          </div>
          <span class="text-sm font-medium text-gray-900">${student.attendance_rate || 0}%</span>
        </div>
      </td>
      <td class="p-4">
        <div class="flex space-x-2">
          <button onclick="window.app.editStudent('${student.id}')" class="text-blue-600 hover:text-blue-800 transition-colors" title="Edit">
            <i class="fas fa-edit"></i>
          </button>
          <button onclick="window.app.deleteStudent('${student.id}')" class="text-red-600 hover:text-red-800 transition-colors" title="Hapus">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function updateAttendanceDisplay(attendance) {
  const container = document.getElementById('attendanceStudentsList');
  if (!container) return;
  if (attendance.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-clipboard-list empty-state-icon"></i>
        <h4 class="text-lg font-medium text-gray-900 mb-2">Belum Ada Data Presensi</h4>
        <p class="text-gray-500">Pilih kelas dari dropdown di atas untuk menampilkan daftar siswa dan mulai input presensi.</p>
      </div>
    `;
    return;
  }
  container.innerHTML = attendance.map(record => `
    <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-4">
      <div class="flex items-center justify-between mb-3">
        <div>
          <h4 class="font-semibold text-gray-900">${record.class_name}</h4>
          <p class="text-sm text-gray-500">${new Date(record.date).toLocaleDateString('id-ID')}</p>
        </div>
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          ${record.subject || 'Tidak ada mata pelajaran'}
        </span>
      </div>
      <div class="grid grid-cols-4 gap-4 text-center">
        <div>
          <p class="text-2xl font-bold text-green-600">${record.records.filter(r => r.status === 'present').length}</p>
          <p class="text-xs text-gray-500">Hadir</p>
        </div>
        <div>
          <p class="text-2xl font-bold text-red-600">${record.records.filter(r => r.status === 'absent').length}</p>
          <p class="text-xs text-gray-500">Alpha</p>
        </div>
        <div>
          <p class="text-2xl font-bold text-yellow-600">${record.records.filter(r => r.status === 'excused').length}</p>
          <p class="text-xs text-gray-500">Izin</p>
        </div>
        <div>
          <p class="text-2xl font-bold text-gray-600">${record.records.filter(r => r.status === 'sick').length}</p>
          <p class="text-xs text-gray-500">Sakit</p>
        </div>
      </div>
    </div>
  `).join('');
}

function updateJournalDisplay(journals) {
  const container = document.getElementById('journalList');
  if (!container) return;
  if (journals.length === 0) {
    container.innerHTML = `
      <div class="p-6">
        <div class="empty-state">
          <i class="fas fa-book empty-state-icon"></i>
          <h4 class="text-lg font-medium text-gray-900 mb-2">Belum Ada Jurnal</h4>
          <p class="text-gray-500 mb-4">Mulai dengan menambahkan jurnal pembelajaran pertama Anda.</p>
          <button onclick="document.getElementById('addJournalBtn').click()" class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-all">
            <i class="fas fa-plus mr-2"></i>Tambah Jurnal Pertama
          </button>
        </div>
      </div>
    `;
    return;
  }
  container.innerHTML = journals.map(journal => `
    <div class="p-6 border-b border-gray-100">
      <div class="flex items-start justify-between mb-3">
        <div class="flex items-center space-x-3">
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <i class="fas fa-book text-blue-600"></i>
          </div>
          <div>
            <h4 class="font-semibold text-gray-900">${journal.subject} - ${journal.class_name}</h4>
            <p class="text-sm text-gray-500">${new Date(journal.date).toLocaleDateString('id-ID')}</p>
          </div>
        </div>
        <div class="flex space-x-2">
          <button class="text-blue-600 hover:text-blue-800 transition-colors">
            <i class="fas fa-edit"></i>
          </button>
          <button onclick="window.app.deleteJournal('${journal.id}')" class="text-red-600 hover:text-red-800 transition-colors">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
      <div class="space-y-2">
        <div>
          <p class="text-sm font-medium text-gray-700">Kegiatan:</p>
          <p class="text-sm text-gray-600">${journal.activity}</p>
        </div>
        ${journal.notes ? `<div><p class="text-sm font-medium text-gray-700">Catatan:</p><p class="text-sm text-gray-600">${journal.notes}</p></div>` : ''}
      </div>
    </div>
  `).join('');
}

function updateTeacherProfileDisplay(teacher) {
  const teacherName = document.getElementById('teacherName');
  const teacherSubject = document.getElementById('teacherSubject');
  const teacherPhoto = document.getElementById('teacherPhoto');
  const teacherIcon = document.getElementById('teacherIcon');
  const mobileTeacherPhoto = document.getElementById('mobileTeacherPhoto');
  const mobileTeacherIcon = document.getElementById('mobileTeacherIcon');

  if (teacherName) teacherName.textContent = teacher.name || 'Guru';
  if (teacherSubject) teacherSubject.textContent = teacher.subject || 'Mata Pelajaran';

  if (teacher.photo_url) {
    if (teacherPhoto) { teacherPhoto.src = teacher.photo_url; teacherPhoto.classList.remove('hidden'); }
    if (teacherIcon) teacherIcon.classList.add('hidden');
    if (mobileTeacherPhoto) { mobileTeacherPhoto.src = teacher.photo_url; mobileTeacherPhoto.classList.remove('hidden'); }
    if (mobileTeacherIcon) mobileTeacherIcon.classList.add('hidden');
  } else {
    if (teacherPhoto) teacherPhoto.classList.add('hidden');
    if (teacherIcon) teacherIcon.classList.remove('hidden');
    if (mobileTeacherPhoto) mobileTeacherPhoto.classList.add('hidden');
    if (mobileTeacherIcon) mobileTeacherIcon.classList.remove('hidden');
  }
}

// === CORE APP ===
class App {
  constructor() {
    this.service = new SupabaseService();
    this.students = [];
    this.attendance = [];
    this.journals = [];
    this.teacher = null;
  }

  async init() {
    try {
      await this.loadAllData();
      this.setupEventListeners();
      this.showView('dashboard');
      this.hideSplashScreen();
    } catch (error) {
      console.error('Init error:', error);
      alert('Gagal memuat data: ' + error.message);
    }
  }

  async loadAllData() {
    const [students, attendance, journals, teacher] = await Promise.all([
      this.service.getStudents(),
      this.service.getAttendance(),
      this.service.getJournals(),
      this.service.getTeacherProfile()
    ]);
    this.students = students;
    this.attendance = attendance;
    this.journals = journals;
    this.teacher = teacher || { name: 'Guru', subject: 'Mata Pelajaran' };
    updateStudentsTable(students);
    updateAttendanceDisplay(attendance);
    updateJournalDisplay(journals);
    updateTeacherProfileDisplay(this.teacher);
  }

  showView(view) {
    document.querySelectorAll('.view-content').forEach(el => el.classList.add('hidden'));
    document.getElementById(view + 'View')?.classList.remove('hidden');
  }

  showTeacherProfileModal() {
    document.getElementById('teacherProfileModal')?.classList.remove('hidden');
  }

  hideTeacherProfileModal() {
    document.getElementById('teacherProfileModal')?.classList.add('hidden');
  }

  async saveStudent() {
    // Implementasi sesuai form
    alert('Fitur save student akan diimplementasi');
  }

  async editStudent(id) {
    alert('Edit student: ' + id);
  }

  async deleteStudent(id) {
    if (!confirm('Hapus siswa ini?')) return;
    try {
      await this.service.deleteStudent(id);
      await this.loadAllData();
      alert('Siswa dihapus!');
    } catch (error) {
      alert('Error: ' + error.message);
    }
  }

  async saveAttendanceData() {
    const class_name = document.getElementById('attendanceClass')?.value;
    const date = document.getElementById('attendanceDate')?.value;
    const subject = document.getElementById('attendanceSubject')?.value || 'Tidak ada mata pelajaran';

    if (!class_name || !date) {
      alert('Lengkapi kelas dan tanggal');
      return;
    }

    const classStudents = this.students.filter(s => s.class === class_name);
    const records = [];
    classStudents.forEach(student => {
      const status = document.querySelector(`input[name="attendance_${student.id}"]:checked`)?.value || 'absent';
      records.push({ student_id: student.id, student_name: student.name, status });
    });

    try {
      await this.service.saveAttendance({ class_name, date, subject, records });
      await this.loadAllData();
      alert('Presensi disimpan!');
    } catch (error) {
      alert('Error: ' + error.message);
    }
  }

  async saveJournal() {
    const date = document.getElementById('journalDate')?.value;
    const class_name = document.getElementById('journalClass')?.value;
    const subject = document.getElementById('journalSubject')?.value;
    const activity = document.getElementById('journalActivity')?.value;
    const notes = document.getElementById('journalNotes')?.value;

    if (!date || !class_name || !subject || !activity) {
      alert('Lengkapi semua field');
      return;
    }

    try {
      await this.service.saveJournal({ date, class_name, subject, activity, notes });
      await this.loadAllData();
      alert('Jurnal disimpan!');
    } catch (error) {
      alert('Error: ' + error.message);
    }
  }

  async deleteJournal(id) {
    if (!confirm('Hapus jurnal ini?')) return;
    try {
      await this.service.deleteJournal(id);
      await this.loadAllData();
      alert('Jurnal dihapus!');
    } catch (error) {
      alert('Error: ' + error.message);
    }
  }

  setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        this.showView(e.currentTarget.getAttribute('href').substring(1));
      });
    });
    document.querySelectorAll('.nav-mobile-btn').forEach(btn => {
      btn.addEventListener('click', () => this.showView(btn.getAttribute('data-view')));
    });

    // Presensi
    document.getElementById('saveAttendance')?.addEventListener('click', () => this.saveAttendanceData());
    document.getElementById('attendanceClass')?.addEventListener('change', () => this.loadStudentsForAttendance());

    // Jurnal
    document.getElementById('addJournalBtn')?.addEventListener('click', () => {
      document.getElementById('journalForm')?.classList.remove('hidden');
    });
    document.getElementById('saveJournal')?.addEventListener('click', () => this.saveJournal());
    document.getElementById('cancelJournal')?.addEventListener('click', () => {
      document.getElementById('journalForm')?.classList.add('hidden');
    });

    // Profil
    document.getElementById('teacherProfile')?.addEventListener('click', () => this.showTeacherProfileModal());
    document.getElementById('profileBtn')?.addEventListener('click', () => this.showTeacherProfileModal());
    document.getElementById('closeTeacherModal')?.addEventListener('click', () => this.hideTeacherProfileModal());
    document.getElementById('cancelTeacherProfile')?.addEventListener('click', () => this.hideTeacherProfileModal());
  }

  loadStudentsForAttendance() {
    const class_name = document.getElementById('attendanceClass')?.value;
    const container = document.getElementById('attendanceStudentsList');
    if (!class_name || !container) {
      container.innerHTML = '<div class="empty-state"><i class="fas fa-clipboard-list empty-state-icon"></i><p>Pilih kelas</p></div>';
      return;
    }
    const students = this.students.filter(s => s.class === class_name);
    container.innerHTML = students.map(s => `
      <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div><span class="font-medium">${s.name}</span></div>
        <div class="flex space-x-2">
          <label><input type="radio" name="attendance_${s.id}" value="present"> Hadir</label>
          <label><input type="radio" name="attendance_${s.id}" value="absent"> Tidak</label>
          <label><input type="radio" name="attendance_${s.id}" value="excused"> Izin</label>
        </div>
      </div>
    `).join('');
  }

  hideSplashScreen() {
    document.getElementById('splashScreen')?.classList.add('hidden');
  }
}

// === INISIALISASI ===
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
  window.app.init();
});
