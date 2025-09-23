// Supabase Service - Fase 1 Final
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

  // === CORE FUNCTIONS - FASE 1 ===
  
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
}

// Export untuk digunakan di file lain
window.SupabaseService = SupabaseService;
