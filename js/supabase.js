/**
 * Zuno - Supabase service
 * Keeps compatibility with the old project while using real Supabase Auth.
 */
class SupabaseService {
  constructor() {
    this.client = null;
    this.isConfigured = false;

    // Re-use old saved values if they already exist.
    this.supabaseUrl =
      localStorage.getItem('zuno_supabase_url') ||
      localStorage.getItem('zelzal_supabase_url') ||
      window.ZUNO_SUPABASE_URL || '';

    this.supabaseAnonKey =
      localStorage.getItem('zuno_supabase_anon_key') ||
      localStorage.getItem('zelzal_supabase_anon_key') ||
      window.ZUNO_SUPABASE_ANON_KEY || '';

    this.initClient();
  }

  initClient() {
    if (this.supabaseUrl && this.supabaseAnonKey && window.supabase) {
      try {
        this.client = window.supabase.createClient(
          this.supabaseUrl,
          this.supabaseAnonKey,
          {
            auth: {
              persistSession: true,
              autoRefreshToken: true,
              detectSessionInUrl: true
            }
          }
        );
        this.isConfigured = true;
        console.log('Zuno: Supabase connected');
      } catch (err) {
        console.error('Zuno: Supabase connection failed', err);
        this.client = null;
        this.isConfigured = false;
      }
    }
  }

  setCredentials(url, anonKey) {
    this.supabaseUrl = (url || '').trim();
    this.supabaseAnonKey = (anonKey || '').trim();

    localStorage.setItem('zuno_supabase_url', this.supabaseUrl);
    localStorage.setItem('zuno_supabase_anon_key', this.supabaseAnonKey);

    // Keep old keys for full compatibility with the current project.
    localStorage.setItem('zelzal_supabase_url', this.supabaseUrl);
    localStorage.setItem('zelzal_supabase_anon_key', this.supabaseAnonKey);

    this.initClient();
    return this.isConfigured;
  }

  clearCredentials() {
    this.supabaseUrl = '';
    this.supabaseAnonKey = '';
    ['zuno_supabase_url','zuno_supabase_anon_key','zelzal_supabase_url','zelzal_supabase_anon_key']
      .forEach(k => localStorage.removeItem(k));
    this.client = null;
    this.isConfigured = false;
  }

  getLocal(key, defaultValue = null) {
    try {
      const data =
        localStorage.getItem('zuno_db_' + key) ??
        localStorage.getItem('zelzal_db_' + key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (_) {
      return defaultValue;
    }
  }

  setLocal(key, value) {
    try {
      localStorage.setItem('zuno_db_' + key, JSON.stringify(value));
    } catch (e) {
      console.error('LocalStorage error:', e);
    }
  }
}

window.supabaseService = new SupabaseService();
