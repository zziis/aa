/**
 * ⚡ Main Application Controller & UI Coordinator
 * Handles Bottom Navigation Switching (Account, Rooms, Butterfly, Store, Support),
 * Mobile Viewport Toggle, Modals, Top Bar Balances, and Notifications.
 */

class ZelzalApp {
  constructor() {
    this.currentTab = 'butterfly';
  }

  init() {
    this.bindEvents();
    this.updateWalletDisplay();
    this.renderAccountTab();
    
    if (window.butterflyManager) window.butterflyManager.init();
    if (window.roomsManager) window.roomsManager.renderRoomsList();
    if (window.storeManager) window.storeManager.render();
    if (window.supportManager) window.supportManager.init();

    this.switchTab('butterfly');
  }

  switchTab(tabName) {
    this.currentTab = tabName;
    if (window.cyberAudio) window.cyberAudio.playClick();

    // Update Bottom Nav Buttons
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      if (btn.dataset.tab === tabName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Hide/Show Tab Sections
    const tabs = ['account', 'rooms', 'butterfly', 'store', 'support'];
    tabs.forEach(t => {
      const el = document.getElementById(`tab-${t}`);
      if (el) {
        if (t === tabName) {
          el.classList.add('active');
        } else {
          el.classList.remove('active');
        }
      }
    });

    // Specific tab refreshers
    if (tabName === 'account') this.renderAccountTab();
    if (tabName === 'rooms' && window.roomsManager) {
      if (!window.roomsManager.activeRoom) {
        window.roomsManager.renderRoomsList();
      }
    }
    if (tabName === 'butterfly' && window.butterflyManager) window.butterflyManager.render();
    if (tabName === 'store' && window.storeManager) window.storeManager.render();
  }

  updateWalletDisplay() {
    const user = window.authManager.currentUser;
    const pointsEl = document.getElementById('top-bar-points');
    const countersCountEl = document.getElementById('top-bar-counters');

    if (pointsEl) {
      pointsEl.textContent = user ? (user.points || 0).toLocaleString() : '0';
    }
    if (countersCountEl) {
      countersCountEl.textContent = user ? (user.countersOwned || []).length : '0';
    }
  }

  renderAccountTab() {
    const user = window.authManager.currentUser;
    if (!user) return;

    const avatarEl = document.getElementById('profile-avatar-img');
    const nameEl = document.getElementById('profile-name-display');
    const idEl = document.getElementById('profile-id-display');
    const emailEl = document.getElementById('profile-email-display');
    const phoneEl = document.getElementById('profile-phone-display');
    const pointsStatEl = document.getElementById('profile-points-stat');
    const countersStatEl = document.getElementById('profile-counters-stat');
    const passDisplayEl = document.getElementById('profile-password-display');

    if (avatarEl) avatarEl.src = user.avatar;
    if (nameEl) nameEl.textContent = user.name;
    if (idEl) idEl.textContent = user.customId;
    if (emailEl) emailEl.textContent = user.email;
    if (phoneEl) phoneEl.textContent = user.phone || 'غير مسجل';
    if (passDisplayEl) passDisplayEl.textContent = '••••••••';
    if (pointsStatEl) pointsStatEl.textContent = (user.points || 0).toLocaleString();
    if (countersStatEl) countersStatEl.textContent = (user.countersOwned || []).length;
  }

  // Edit Profile Modal Open
  openEditProfileModal() {
    const user = window.authManager.currentUser;
    if (!user) return;

    document.getElementById('edit-name-input').value = user.name;
    document.getElementById('edit-email-input').value = user.email;
    document.getElementById('edit-phone-input').value = user.phone || '';
    document.getElementById('edit-password-input').value = user.password;
    document.getElementById('edit-avatar-input').value = user.avatar;

    document.getElementById('edit-profile-modal').classList.remove('hidden');
  }

  closeEditProfileModal() {
    document.getElementById('edit-profile-modal').classList.add('hidden');
  }

  saveProfileChanges() {
    try {
      const name = document.getElementById('edit-name-input').value;
      const email = document.getElementById('edit-email-input').value;
      const phone = document.getElementById('edit-phone-input').value;
      const password = document.getElementById('edit-password-input').value;
      const avatar = document.getElementById('edit-avatar-input').value;

      window.authManager.updateProfile({ name, email, phone, password, avatar });
      this.closeEditProfileModal();
      this.renderAccountTab();
      if (window.cyberAudio) window.cyberAudio.playRewardChime();
      this.showNotification('✅ تم تحديث بيانات حسابك بنجاح!', 'success');
    } catch (err) {
      this.showNotification(err.message, 'error');
    }
  }

  showNotification(message, type = 'info') {
    const toast = document.getElementById('cyber-notification-toast');
    const textEl = document.getElementById('toast-message-text');
    const iconEl = document.getElementById('toast-icon');

    if (!toast || !textEl) return;

    textEl.textContent = message;
    if (type === 'success') {
      iconEl.textContent = '✅';
      toast.className = 'fixed top-5 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-emerald-950/95 border border-emerald-400 text-emerald-100 shadow-2xl flex items-center gap-3 transition-all transform scale-100 opacity-100';
    } else if (type === 'error') {
      iconEl.textContent = '❌';
      toast.className = 'fixed top-5 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-rose-950/95 border border-rose-400 text-rose-100 shadow-2xl flex items-center gap-3 transition-all transform scale-100 opacity-100';
    } else if (type === 'warning') {
      iconEl.textContent = '⚠️';
      toast.className = 'fixed top-5 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-amber-950/95 border border-amber-400 text-amber-100 shadow-2xl flex items-center gap-3 transition-all transform scale-100 opacity-100';
    } else {
      iconEl.textContent = '⚡';
      toast.className = 'fixed top-5 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-cyan-950/95 border border-cyan-400 text-cyan-100 shadow-2xl flex items-center gap-3 transition-all transform scale-100 opacity-100';
    }

    setTimeout(() => {
      toast.classList.add('opacity-0', 'pointer-events-none');
    }, 3800);
  }

  copyToClipboard(text, label = 'النص') {
    navigator.clipboard.writeText(text).then(() => {
      if (window.cyberAudio) window.cyberAudio.playClick();
      this.showNotification(`تم نسخ ${label} إلى الحافظة: ${text}`, 'success');
    });
  }

  toggleMobileFrame() {
    const wrapper = document.getElementById('main-app-shell');
    if (!wrapper) return;
    wrapper.classList.toggle('mobile-frame-mode');
    const isMobile = wrapper.classList.contains('mobile-frame-mode');
    this.showNotification(isMobile ? '📱 تم تفعيل عرض الهاتف' : '💻 تم تفعيل العرض الكامل', 'info');
  }

  openSupabaseModal() {
    const modal = document.getElementById('supabase-config-modal');
    if (modal) {
      document.getElementById('supabase-url-input').value = window.supabaseService.supabaseUrl || '';
      document.getElementById('supabase-key-input').value = window.supabaseService.supabaseAnonKey || '';
      modal.classList.remove('hidden');
    }
  }

  closeSupabaseModal() {
    const modal = document.getElementById('supabase-config-modal');
    if (modal) modal.classList.add('hidden');
  }

  saveSupabaseConfig() {
    const url = document.getElementById('supabase-url-input').value;
    const key = document.getElementById('supabase-key-input').value;
    window.supabaseService.setCredentials(url, key);
    this.closeSupabaseModal();
    this.showNotification('⚡ تم حفظ إعدادات الربط مع Supabase بنجاح!', 'success');
  }

  bindEvents() {
    // Bottom nav clicks
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        if (tab) this.switchTab(tab);
      });
    });

    // Sound toggle
    const soundBtn = document.getElementById('btn-toggle-sound');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        const enabled = window.cyberAudio.toggleSound();
        soundBtn.innerHTML = enabled ? '🔊 <span class="hidden sm:inline">الصوت مفعّل</span>' : '🔇 <span class="hidden sm:inline">الصوت صامت</span>';
      });
    }

    // Frame toggle
    const frameBtn = document.getElementById('btn-toggle-frame');
    if (frameBtn) {
      frameBtn.addEventListener('click', () => this.toggleMobileFrame());
    }
  }
}

window.zelzalApp = new ZelzalApp();
document.addEventListener('DOMContentLoaded', () => {
  window.zelzalApp.init();
});
