/**
 * Zuno Smart Butterfly 24H
 * Modern electronic butterfly, left-origin ticker, and real 24H cloud state.
 */
class ButterflyManager {
  constructor() {
    this.spinCycleDuration = 24 * 60 * 60 * 1000;
    this.timerInterval = null;
    this.isSpinningTurbo = false;
  }

  init() {
    this.injectStyles();
    this.upgradeTicker();
    this.upgradeButterflyGraphic();
    this.startCountdownLoop();
    this.render();
  }

  injectStyles() {
    if (document.getElementById('zuno-butterfly-style')) return;
    const s = document.createElement('style');
    s.id = 'zuno-butterfly-style';
    s.textContent = `
      @keyframes zunoTickerFromLeft {
        from { transform:translateX(-105%); }
        to   { transform:translateX(105%); }
      }
      .ticker-wrap { direction:ltr !important; overflow:hidden !important; }
      .ticker-move {
        direction:rtl !important;
        white-space:nowrap !important;
        animation:zunoTickerFromLeft 24s linear infinite !important;
        width:max-content;
      }

      #tab-butterfly { max-width:760px !important; }
      .butterfly-container {
        width:min(82vw, 430px) !important;
        height:min(82vw, 430px) !important;
        margin-inline:auto !important;
      }

      .zuno-smart-butterfly {
        position:absolute; inset:50% auto auto 50%;
        width:62%; height:55%;
        transform:translate(-50%,-50%);
        filter:drop-shadow(0 0 14px rgba(0,226,255,.65))
               drop-shadow(0 0 26px rgba(178,76,255,.38));
        transform-style:preserve-3d;
      }
      .zuno-smart-butterfly svg { width:100%; height:100%; overflow:visible; }
      .zuno-wing-left, .zuno-wing-right {
        transform-box:fill-box;
        transform-origin:center right;
      }
      .zuno-wing-right { transform-origin:center left; }

      .butterfly-wrapper.idle .zuno-wing-left,
      .butterfly-wrapper.idle .zuno-wing-right,
      .butterfly-wrapper.idle .zuno-core {
        animation:none !important;
      }

      @keyframes zunoWingL {
        0%,100% { transform:perspective(400px) rotateY(8deg) rotateZ(-2deg); }
        50% { transform:perspective(400px) rotateY(58deg) rotateZ(4deg); }
      }
      @keyframes zunoWingR {
        0%,100% { transform:perspective(400px) rotateY(-8deg) rotateZ(2deg); }
        50% { transform:perspective(400px) rotateY(-58deg) rotateZ(-4deg); }
      }
      @keyframes zunoCorePulse {
        0%,100% { opacity:.75; filter:drop-shadow(0 0 4px #4de8ff); }
        50% { opacity:1; filter:drop-shadow(0 0 13px #d75cff); }
      }
      @keyframes zunoFloat {
        0%,100% { transform:translate(-50%,-50%) translateY(-3px) scale(1); }
        50% { transform:translate(-50%,-50%) translateY(5px) scale(1.025); }
      }
      @keyframes zunoTurbo {
        from { transform:translate(-50%,-50%) rotate(0deg) scale(.88); }
        60% { transform:translate(-50%,-50%) rotate(540deg) scale(1.12); }
        to { transform:translate(-50%,-50%) rotate(720deg) scale(1); }
      }

      .butterfly-wrapper.active-24h .zuno-smart-butterfly {
        animation:zunoFloat 3.3s ease-in-out infinite;
      }
      .butterfly-wrapper.active-24h .zuno-wing-left {
        animation:zunoWingL .72s ease-in-out infinite;
      }
      .butterfly-wrapper.active-24h .zuno-wing-right {
        animation:zunoWingR .72s ease-in-out infinite;
      }
      .butterfly-wrapper.active-24h .zuno-core {
        animation:zunoCorePulse 1.2s ease-in-out infinite;
      }
      .butterfly-wrapper.spinning .zuno-smart-butterfly {
        animation:zunoTurbo 1.2s cubic-bezier(.2,.8,.2,1) both;
      }
      .butterfly-wrapper.spinning .zuno-wing-left {
        animation:zunoWingL .13s ease-in-out infinite;
      }
      .butterfly-wrapper.spinning .zuno-wing-right {
        animation:zunoWingR .13s ease-in-out infinite;
      }

      @media(max-width:640px){
        #tab-butterfly { width:100% !important; max-width:100% !important; }
        .butterfly-container {
          width:min(78vw, 340px) !important;
          height:min(78vw, 340px) !important;
        }
        #tab-butterfly .cyber-card { padding:16px !important; }
      }
    `;
    document.head.appendChild(s);
  }

  upgradeTicker() {
    const label = document.querySelector('#tab-butterfly .ticker-wrap')?.previousElementSibling;
    if (label) label.textContent = 'إعلان Zuno';
    const move = document.querySelector('#tab-butterfly .ticker-move');
    if (move) {
      move.textContent = 'مرحباً بكم في Zuno • فعّل الفراشة الذكية لتشغيل عداد 24 ساعة • استلم 50 نقطة يومياً • اكتشف الرومات والمتجر والخدمات الجديدة';
    }
  }

  upgradeButterflyGraphic() {
    const el = document.getElementById('neon-butterfly-element');
    if (!el || el.dataset.zunoUpgraded === '1') return;
    el.dataset.zunoUpgraded = '1';
    el.innerHTML = `
      <div class="zuno-smart-butterfly" aria-label="Zuno Smart Butterfly">
        <svg viewBox="0 0 300 220" role="img">
          <defs>
            <linearGradient id="zunoWingA" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stop-color="#23e7ff" stop-opacity=".95"/>
              <stop offset=".5" stop-color="#655cff" stop-opacity=".82"/>
              <stop offset="1" stop-color="#ec4dff" stop-opacity=".90"/>
            </linearGradient>
            <linearGradient id="zunoWingB" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#ec4dff"/>
              <stop offset=".55" stop-color="#4a78ff"/>
              <stop offset="1" stop-color="#22e5ff"/>
            </linearGradient>
            <filter id="zunoGlow">
              <feGaussianBlur stdDeviation="2.4" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          <g class="zuno-wing-left" filter="url(#zunoGlow)">
            <path d="M145 108 C112 31 39 12 16 54 C-2 88 51 114 137 116 Z"
                  fill="url(#zunoWingA)" fill-opacity=".23" stroke="#51e9ff" stroke-width="2"/>
            <path d="M139 117 C82 118 34 137 42 177 C50 211 108 184 146 129 Z"
                  fill="url(#zunoWingB)" fill-opacity=".20" stroke="#7f73ff" stroke-width="2"/>
            <path d="M128 94 L69 51 M126 108 L40 87 M129 125 L72 164"
                  stroke="#66e8ff" stroke-opacity=".55" stroke-width="1.4"/>
            <circle cx="70" cy="73" r="4" fill="#77f5ff"/>
            <circle cx="82" cy="152" r="3.5" fill="#a77cff"/>
          </g>

          <g class="zuno-wing-right" filter="url(#zunoGlow)">
            <path d="M155 108 C188 31 261 12 284 54 C302 88 249 114 163 116 Z"
                  fill="url(#zunoWingA)" fill-opacity=".23" stroke="#d85fff" stroke-width="2"/>
            <path d="M161 117 C218 118 266 137 258 177 C250 211 192 184 154 129 Z"
                  fill="url(#zunoWingB)" fill-opacity=".20" stroke="#ea5cff" stroke-width="2"/>
            <path d="M172 94 L231 51 M174 108 L260 87 M171 125 L228 164"
                  stroke="#df6fff" stroke-opacity=".55" stroke-width="1.4"/>
            <circle cx="230" cy="73" r="4" fill="#ef72ff"/>
            <circle cx="218" cy="152" r="3.5" fill="#60dfff"/>
          </g>

          <g class="zuno-core" filter="url(#zunoGlow)">
            <path d="M150 64 C139 82 139 145 150 176 C161 145 161 82 150 64Z"
                  fill="#b7f8ff" stroke="#ffffff" stroke-width="1.5"/>
            <circle cx="150" cy="61" r="8" fill="#73efff"/>
            <path d="M147 56 C134 42 126 39 119 43 M153 56 C166 42 174 39 181 43"
                  stroke="#8eefff" stroke-width="2" fill="none"/>
            <circle cx="118" cy="43" r="3.5" fill="#54eaff"/>
            <circle cx="182" cy="43" r="3.5" fill="#e35dff"/>
          </g>
        </svg>
      </div>
    `;
  }

  async spinButterfly() {
    const user = window.authManager.currentUser;
    if (!user) return window.authManager.showGate('login');

    window.cyberAudio?.playSpinHum?.();

    const now = Date.now();
    const newEnd = new Date(now + this.spinCycleDuration).toISOString();
    user.butterflySpinActiveUntil = newEnd;

    const butterflyEl = document.getElementById('neon-butterfly-element');
    this.isSpinningTurbo = true;
    if (butterflyEl) {
      butterflyEl.classList.remove('idle','active-24h');
      butterflyEl.classList.add('spinning');
    }

    // Persist active timer in Supabase.
    if (window.supabaseService.client) {
      const { error } = await window.supabaseService.client
        .from('profiles')
        .update({ butterfly_spin_until: newEnd })
        .eq('id', user.id);
      if (error) console.error(error);
    }

    setTimeout(() => {
      this.isSpinningTurbo = false;
      if (butterflyEl) {
        butterflyEl.classList.remove('spinning');
        butterflyEl.classList.add('active-24h');
      }
      this.render();
      window.zelzalApp?.showNotification('تم تشغيل الفراشة الذكية لمدة 24 ساعة', 'success');
    }, 1200);
  }

  async claimDailyFreePoints() {
    const user = window.authManager.currentUser;
    if (!user) return window.authManager.showGate('login');
    if (!window.supabaseService.client) return;

    const btn = document.getElementById('btn-claim-daily-free');
    if (btn) btn.disabled = true;

    const { data, error } = await window.supabaseService.client.rpc('zuno_claim_daily_reward');
    if (error) {
      if (btn) btn.disabled = false;
      window.zelzalApp?.showNotification(error.message || 'تعذر استلام المكافأة', 'error');
      return;
    }

    if (!data?.ok) {
      window.zelzalApp?.showNotification(data?.message || 'المكافأة غير متاحة الآن', 'warning');
      await window.authManager.refreshFromCloud();
      this.render();
      return;
    }

    user.points = Number(data.points || user.points);
    user.butterflyLastClaim = data.claimed_at;
    window.zelzalApp?.updateWalletDisplay();
    window.cyberAudio?.playRewardChime?.();
    this.render();
    window.zelzalApp?.showNotification('تمت إضافة 50 نقطة إلى حسابك', 'success');
  }

  collectPurchasedCountersYield() {
    const user = window.authManager.currentUser;
    if (!user) return;
    const counters = user.countersOwned || [];
    if (!counters.length) {
      window.zelzalApp?.showNotification('لا توجد عدادات شراء نشطة حالياً', 'info');
      return;
    }

    let totalYield = 0;
    const now = Date.now();
    counters.forEach(c => {
      const lastCollect = c.lastCollectedAt ? new Date(c.lastCollectedAt).getTime() : new Date(c.purchasedAt).getTime();
      const hoursElapsed = (now - lastCollect) / 3600000;
      const accrued = Math.floor(hoursElapsed * ((c.dailyYield || 50) / 24));
      if (accrued > 0) {
        totalYield += accrued;
        c.lastCollectedAt = new Date(now).toISOString();
      }
    });

    if (totalYield > 0) {
      window.authManager.modifyPoints(totalYield, `أرباح العدادات (${counters.length})`);
      window.authManager.saveUsers();
      window.zelzalApp?.showNotification(`تم جمع +${totalYield} نقطة`, 'success');
    } else {
      window.zelzalApp?.showNotification('العدادات ما زالت تعمل، انتظر قليلاً', 'info');
    }
    this.render();
  }

  startCountdownLoop() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => this.updateTimersDisplay(), 1000);
  }

  updateTimersDisplay() {
    const user = window.authManager.currentUser;
    if (!user) return;

    const now = Date.now();
    const spinUntil = user.butterflySpinActiveUntil ? new Date(user.butterflySpinActiveUntil).getTime() : 0;
    const spinTimerEl = document.getElementById('butterfly-spin-timer');
    const spinStatusEl = document.getElementById('butterfly-spin-status');
    const butterflyEl = document.getElementById('neon-butterfly-element');

    if (spinUntil > now) {
      const formatted = this.formatMs(spinUntil - now);
      if (spinTimerEl) spinTimerEl.textContent = formatted;
      if (spinStatusEl) {
        spinStatusEl.textContent = 'الفراشة الذكية تعمل الآن';
        spinStatusEl.className = 'text-xs font-black text-emerald-400 text-center';
      }
      if (butterflyEl && !this.isSpinningTurbo) {
        butterflyEl.classList.remove('idle','spinning');
        butterflyEl.classList.add('active-24h');
      }
    } else {
      if (spinTimerEl) spinTimerEl.textContent = '24:00:00';
      if (spinStatusEl) {
        spinStatusEl.textContent = 'جاهزة للتشغيل';
        spinStatusEl.className = 'text-xs font-black text-amber-400 text-center';
      }
      if (butterflyEl && !this.isSpinningTurbo) {
        butterflyEl.classList.remove('active-24h','spinning');
        butterflyEl.classList.add('idle');
      }
    }

    const lastClaim = user.butterflyLastClaim ? new Date(user.butterflyLastClaim).getTime() : 0;
    const cooldown = 24 * 60 * 60 * 1000;
    const dailyBtn = document.getElementById('btn-claim-daily-free');
    const dailyTimerEl = document.getElementById('daily-free-timer');

    if (lastClaim && now - lastClaim < cooldown) {
      const remaining = cooldown - (now - lastClaim);
      if (dailyTimerEl) dailyTimerEl.textContent = 'المطالبة التالية بعد: ' + this.formatMs(remaining);
      if (dailyBtn) {
        dailyBtn.disabled = true;
        dailyBtn.textContent = 'تم استلام 50 نقطة اليوم';
      }
    } else {
      if (dailyTimerEl) dailyTimerEl.textContent = 'المطالبة متاحة الآن (+50 نقطة)';
      if (dailyBtn) {
        dailyBtn.disabled = false;
        dailyBtn.textContent = 'استلم 50 نقطة اليومية الآن';
      }
    }
  }

  formatMs(ms) {
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }

  render() {
    const user = window.authManager.currentUser;
    if (!user) return;

    const counters = user.countersOwned || [];
    const countEl = document.getElementById('purchased-counters-count');
    const powerEl = document.getElementById('purchased-counters-power');
    const listEl = document.getElementById('purchased-counters-list');

    if (countEl) countEl.textContent = counters.length;
    const total = counters.reduce((sum,c) => sum + Number(c.dailyYield || 0), 0);
    if (powerEl) powerEl.textContent = `+${total} نقطة/يومياً`;

    if (listEl && counters.length === 0) {
      listEl.innerHTML = `
        <div class="text-center py-6 px-4 bg-slate-900/50 rounded-2xl border border-dashed border-slate-800">
          <span class="text-3xl mb-2 block">⚡</span>
          <p class="text-slate-400 text-sm font-semibold">لا توجد عدادات شراء نشطة</p>
        </div>`;
    }

    this.updateTimersDisplay();
  }
}

window.butterflyManager = new ButterflyManager();
