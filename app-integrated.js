// App Integrated - Fase 1 Final
const supabaseService = new SupabaseService();

// Fungsi utama load data
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
