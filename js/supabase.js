/**
 * ⚡ Supabase Client & Local Persistence Adapter
 * Provides seamless connection to Supabase cloud database,
 * with an automatic, zero-configuration local storage engine fallback.
 */

class SupabaseService {
  constructor() {
    this.client = null;
    this.isConfigured = false;
    this.supabaseUrl = localStorage.getItem('zelzal_supabase_url') || '';
    this.supabaseAnonKey = localStorage.getItem('zelzal_supabase_anon_key') || '';
    this.initClient();
  }

  initClient() {
    if (this.supabaseUrl && this.supabaseAnonKey && window.supabase) {
      try {
        this.client = window.supabase.createClient(this.supabaseUrl, this.supabaseAnonKey);
        this.isConfigured = true;
        console.log('⚡ Supabase Cloud Connected Successfully!');
      } catch (err) {
        console.warn('⚠️ Supabase connection error, falling back to local database engine:', err);
        this.isConfigured = false;
      }
    } else {
      this.isConfigured = false;
    }
  }

  setCredentials(url, anonKey) {
    this.supabaseUrl = url.trim();
    this.supabaseAnonKey = anonKey.trim();
    localStorage.setItem('zelzal_supabase_url', this.supabaseUrl);
    localStorage.setItem('zelzal_supabase_anon_key', this.supabaseAnonKey);
    this.initClient();
    return this.isConfigured;
  }

  clearCredentials() {
    this.supabaseUrl = '';
    this.supabaseAnonKey = '';
    localStorage.removeItem('zelzal_supabase_url');
    localStorage.removeItem('zelzal_supabase_anon_key');
    this.client = null;
    this.isConfigured = false;
  }

  // Local Storage Database Engine
  getLocal(key, defaultValue = null) {
    try {
      const data = localStorage.getItem('zelzal_db_' + key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  }

  setLocal(key, value) {
    try {
      localStorage.setItem('zelzal_db_' + key, JSON.stringify(value));
    } catch (e) {
      console.error('LocalStorage write error:', e);
    }
  }
}

window.supabaseService = new SupabaseService();
