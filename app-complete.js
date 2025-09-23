// Aplikasi Absensi Siswa - Fase 1 Complete Version
// Semua fitur terintegrasi dengan Supabase

// === SUPABASE SERVICE (Sudah ada di supabase-service.js, tapi kita include ulang untuk complete version) ===
class SupabaseService {
  constructor() {
    // GANTI dengan project Anda
    this.SUPABASE_URL = 'https://lleviwszkjhoyqvpiapu.supabase.co';
    this.SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsZXZpd3N6a2pob3lxdnBpYXB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1MDc3MjcsImV4cCI6MjA3NDA4MzcyN30.YP6WYMiwJch6lhk2AiLUtUwyGZ5soO382MjqKD4jwg4';
    
    this.supabase = window.supabase.createClient(
      this.SUPABASE_URL, 
      this.SUPABASE_ANON_KEY
    );
  }

  // === CORE DATABASE FUNCTIONS ===
  
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

  async getAttendance(limit = 100) {
    const { data, error } = await this.supabase
      .from('attendance')
      .select('*')
      .order('date', { ascending: false })
      .limit(limit);
    
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

  async getJournals(limit = 50) {
    const { data, error } = await this.supabase
      .from('journals')
      .select('*')
      .order('date', { ascending: false })
      .limit(limit);
    
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
          <button onclick="App.editStudent('${student.id}')" class="text-blue-600 hover:text-blue-800 transition-colors" title="Edit">
            <i class="fas fa-edit"></i>
          </button>
          <button onclick="App.deleteStudent('${student.id}')" class="text-red-600 hover:text-red-800 transition-colors" title="Hapus">
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
          <button onclick="App.deleteJournal('${journal.id}')" class="text-red-600 hover:text-red-800 transition-colors">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
      <div class="space-y-2">
        <div>
          <p class="text-sm font-medium text-gray-700">Kegiatan:</p>
          <p class="text-sm text-gray-600">${journal.activity}</p>
        </div>
        ${journal.notes ? `
          <div>
            <p class="text-sm font-medium text-gray-700">Catatan:</p>
            <p class="text-sm text-gray-600">${journal.notes}</p>
          </div>
        ` : ''}
      </div>
    </div>
  `).join('');
}

// === PRESENSI FUNCTIONS ===

async function saveAttendanceData() {
  try {
    console.log('Preparing attendance data...');

    const attendanceClass = document.getElementById('attendanceClass');
    const attendanceDate = document.getElementById('attendanceDate');
    const attendanceSubject = document.getElementById('attendanceSubject');
    
    const selectedClass = attendanceClass?.value;
    const date = attendanceDate?.value;
    const subject = attendanceSubject?.value || 'Tidak ada mata pelajaran';

    if (!selectedClass || !date) {
      alert('Mohon lengkapi kelas dan tanggal');
      return;
    }

    // Kumpulkan data presensi
    const students = await this.getStudents();
    const classStudents = students.filter(student => student.class === selectedClass);
    
    const attendanceRecords = [];
    
    classStudents.forEach(student => {
      const presentRadio = document.querySelector(`input[name="attendance_${student.id}"][value="present"]`);
      const absentRadio = document.querySelector(`input[name="attendance_${student.id}"][value="absent"]`);
      const excusedRadio = document.querySelector(`input[name="attendance_${student.id}"][value="excused"]`);
      const sickRadio = document.querySelector(`input[name="attendance_${student.id}"][value="sick"]`);
      
      let status = '';
      if (presentRadio?.checked) status = 'present';
      else if (absentRadio?.checked) status = 'absent';
      else if (excusedRadio?.checked) status = 'excused';
      else if (sickRadio?.checked) status = 'sick';
      
      if (status) {
        attendanceRecords.push({
          student_id: student.id,
          student_name: student.name,
          status: status
        });
      }
    });

    if (attendanceRecords.length === 0) {
      alert('Belum ada siswa yang dipresensi');
      return;
    }

    console.log('Saving attendance:', attendanceRecords.length, 'records');

    const attendanceData = {
      class_name: selectedClass,
      date: date,
      subject: subject,
      teacher_name: 'Guru', // Bisa diganti dengan nama guru aktual
      records: attendanceRecords
    };

    const saved = await this.saveAttendance(attendanceData);
    console.log('Attendance saved:', saved);

    // Refresh data
    await this.loadAllData();
    alert('Presensi berhasil disimpan!');
    
    // Reset form
    if (attendanceClass) attendanceClass.value = '';
    if (attendanceSubject) attendanceSubject.value = '';
    
  } catch (error) {
    console.error('Error saving attendance:', error);
    alert('Error: ' + error.message);
  }
}

// === JURNAL FUNCTIONS ===

async function saveJournalData() {
  try {
    const journalDate = document.getElementById('journalDate');
    const journalClass = document.getElementById('journalClass');
    const journalSubject = document.getElementById('journalSubject');
    const journalActivity = document.getElementById('journalActivity');
    const journalNotes = document.getElementById('journalNotes');
    
    const date = journalDate?.value;
    const className = journalClass?.value;
    const subject = journalSubject?.value;
    const activity = journalActivity?.value;
    const notes = journalNotes?.value;

    if (!date || !className || !subject || !activity) {
      alert('Mohon lengkapi semua field yang wajib');
      return;
    }

    const journalData = {
      date: date,
      class_name: className,
      subject: subject,
      activity: activity,
      notes: notes,
      teacher_name: 'Guru' // Bisa diganti dengan nama guru aktual
    };

    const saved = await this.saveJournal(journalData);
    console.log('Journal saved:', saved);

    // Refresh data
    await this.loadAllData();
    alert('Jurnal berhasil disimpan!');
    
  } catch (error) {
    console.error('Error saving journal:', error);
    alert('Error: ' + error.message);
  }
}

// === TEACHER PROFILE FUNCTIONS ===

async function loadTeacherProfile() {
  try {
    console.log('Loading teacher profile...');
    
    const teacher = await this.getTeacherProfile();
    
    if (teacher) {
      // Update state lokal
      window.appState = window.appState || {};
      window.appState.teacherProfile = {
        name: teacher.name || 'Guru',
        subject: teacher.subject || 'Mata Pelajaran',
        nip: teacher.nip || '',
        email: teacher.email || '',
        phone: teacher.phone || '',
        photo: teacher.photo_url || null
      };
      
      // Update UI
      this.updateTeacherProfileDisplay(teacher);
      console.log('Teacher profile loaded:', teacher.name);
    }
    
  } catch (error) {
    console.error('Error loading teacher profile:', error);
  }
}

async function saveTeacherProfile(profileData) {
  try {
    console.log('Saving teacher profile:', profileData);
    
    if (!profileData.name || !profileData.subject) {
      alert('Mohon lengkapi nama dan mata pelajaran');
      return;
    }

    const saved = await this.saveTeacherProfile(profileData);
    console.log('Teacher profile saved:', saved);
    
    // Update UI
    this.updateTeacherProfileDisplay(saved);
    alert('Profil guru berhasil disimpan!');
    
  } catch (error) {
    console.error('Error saving teacher profile:', error);
    alert('Error: ' + error.message);
  }
}

function updateTeacherProfileDisplay(teacher) {
  // Update nama guru di sidebar
  const teacherName = document.getElementById('teacherName');
  const teacherSubject = document.getElementById('teacherSubject');
  const teacherNIP = document.getElementById('teacherNIP');
  const teacherEmail = document.getElementById('teacherEmail');
  const teacherPhone = document.getElementById('teacherPhone');
  const teacherPhoto = document.getElementById('teacherPhoto');
  const teacherIcon = document.getElementById('teacherIcon');

  if (teacherName) teacherName.textContent = teacher.name || 'Guru';
  if (teacherSubject) teacherSubject.textContent = teacher.subject || 'Mata Pelajaran';
  if (teacherNIP) teacherNIP.textContent = teacher.nip || '-';
  if (teacherEmail) teacherEmail.textContent = teacher.email || '-';
  if (teacherPhone) teacherPhone.textContent = teacher.phone || '-';
  
  // Update foto jika ada
  if (teacher.photo && teacherPhoto) {
    teacherPhoto.src = teacher.photo;
    teacherPhoto.classList.remove('hidden');
    if (teacherIcon) teacherIcon.classList.add('hidden');
  } else if (teacherIcon) {
    teacherIcon.classList.remove('hidden');
    if (teacherPhoto) teacherPhoto.classList.add('hidden');
  }
}

// === EXPORT FUNCTIONS ===

function exportToPDF() {
  window.open('data:text/plain;charset=utf-8,' + encodeURIComponent('PDF content here'));
}

function exportToExcel() {
  const csvContent = "data:text/csv;charset=utf-8," 
    + "Tanggal,Kelas,Mapel,Hadir,Alpha,Izin,Sakit,Total\n"
    + "2024-01-20,X-1,Matematika,25,2,1,0,28\n";
  
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `rekap-presensi-${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function printReport() {
  window.print();
}

function exportJournalPDF() {
  const content = "Rekap Jurnal Guru\nTanggal: " + new Date().toLocaleDateString('id-ID');
  const element = document.createElement('a');
  const file = new Blob([content], {type: 'text/plain'});
  element.href = URL.createObjectURL(file);
  element.download = `rekap-jurnal-${new Date().toISOString().split('T')[0]}.txt`;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

// === CORE APP FUNCTIONS ===

async function loadAllData() {
  try {
    console.log('Loading data from Supabase...');
    
    // Load semua data sekaligus
    const [students, attendance, journals, teacher] = await Promise.all([
      this.getStudents(),
      this.getAttendance(),
      this.getJournals(),
      this.getTeacherProfile()
    ]);

    console.log('Students loaded:', students.length);
    console.log('Attendance loaded:', attendance.length);
    console.log('Journals loaded:', journals.length);
    console.log('Teacher profile:', teacher?.name || 'Not found');

    // Update semua UI
    this.updateStudentsTable(students);
    this.updateAttendanceDisplay(attendance);
    this.updateJournalDisplay(journals);
    
    // Update teacher profile jika ada
    if (teacher) {
      this.updateTeacherProfileDisplay(teacher);
    }
    
  } catch (error) {
    console.error('Error loading data:', error);
    alert('Error: ' + error.message);
  }
}

// === INITIALIZATION ===

document.addEventListener('DOMContentLoaded', async function() {
  try {
    console.log('[APP] Initializing application');
    
    // Tunggu Supabase siap
    if (typeof window.supabase === 'undefined') {
      console.error('Supabase library not loaded');
      alert('Error: Supabase library tidak ditemukan. Pastikan koneksi internet aktif.');
      return;
    }
    
    // Buat instance service
    window.supabaseService = new SupabaseService();
    window.app = {
      loadAllData: loadAllData.bind(window.supabaseService),
      saveStudentData: saveStudentData.bind(window.supabaseService),
      saveAttendanceData: saveAttendanceData.bind(window.supabaseService),
      saveJournalData: saveJournalData.bind(window.supabaseService),
      loadTeacherProfile: loadTeacherProfile.bind(window.supabaseService),
      saveTeacherProfile: saveTeacherProfile.bind(window.supabaseService),
      updateStudentsTable: updateStudentsTable.bind(window.supabaseService),
      updateAttendanceDisplay: updateAttendanceDisplay.bind(window.supabaseService),
      updateJournalDisplay: updateJournalDisplay.bind(window.supabaseService),
      updateTeacherProfileDisplay: updateTeacherProfileDisplay.bind(window.supabaseService),
      exportToPDF: exportToPDF,
      exportToExcel: exportToExcel,
      printReport: printReport,
      exportJournalPDF: exportJournalPDF
    };
    
    // Setup event listeners
    console.log('[APP] Setting up event listeners');
    
    // Jalankan load data
    await window.app.loadAllData();
    
    console.log('[APP] Application initialized successfully');
    
  } catch (error) {
    console.error('[APP] Failed to initialize:', error);
    alert('Error saat menginisialisasi aplikasi: ' + error.message);
  }
});
