// App Integrated - Fase 1 Final
const supabaseService = new SupabaseService();

// === UI UPDATE FUNCTIONS - FASE 1 ===

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

// === CORE FUNCTIONS - FASE 1 ===

async function loadAllData() {
  try {
    console.log('Loading data from Supabase...');
    
    // Load semua data sekaligus
    const [students, attendance, journals] = await Promise.all([
      supabaseService.getStudents(),
      supabaseService.getAttendance(),
      supabaseService.getJournals()
    ]);

    console.log('Students loaded:', students.length);
    console.log('Attendance loaded:', attendance.length);
    console.log('Journals loaded:', journals.length);

    // Update UI dengan data yang didapat
    updateStudentsTable(students);
    updateAttendanceDisplay(attendance);
    updateJournalDisplay(journals);
    
  } catch (error) {
    console.error('Error loading data:', error);
    alert('Error: ' + error.message);
  }
}

// Fungsi simpan data
async function saveStudentData(formData) {
  try {
    console.log('Saving student:', formData);
    const saved = await supabaseService.saveStudent(formData);
    console.log('Student saved:', saved);
    
    // Refresh data
    await loadAllData();
    alert('Siswa berhasil disimpan!');
    
  } catch (error) {
    console.error('Error saving student:', error);
    alert('Error: ' + error.message);
  }
}

async function saveAttendanceData(attendanceData) {
  try {
    console.log('Saving attendance:', attendanceData);
    const saved = await supabaseService.saveAttendance(attendanceData);
    console.log('Attendance saved:', saved);
    
    // Refresh data
    await loadAllData();
    alert('Presensi berhasil disimpan!');
    
  } catch (error) {
    console.error('Error saving attendance:', error);
    alert('Error: ' + error.message);
  }
}

async function saveJournalData(journalData) {
  try {
    console.log('Saving journal:', journalData);
    const saved = await supabaseService.saveJournal(journalData);
    console.log('Journal saved:', saved);
    
    // Refresh data
    await loadAllData();
    alert('Jurnal berhasil disimpan!');
    
  } catch (error) {
    console.error('Error saving journal:', error);
    alert('Error: ' + error.message);
  }
}

// Jalankan saat halaman load
document.addEventListener('DOMContentLoaded', loadAllData);

// Export untuk digunakan di file lain
window.updateStudentsTable = updateStudentsTable;
window.updateAttendanceDisplay = updateAttendanceDisplay;
window.updateJournalDisplay = updateJournalDisplay;
