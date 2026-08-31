/**
 * 🦋 Neon 24H Spinning Butterfly & Daily Counter Logic
 * Handles interactive spinning vortex, 24-hour cycle timer,
 * Free daily 50 points claim, and Purchased Counters yield tracking.
 */

class ButterflyManager {
  constructor() {
    this.spinCycleDuration = 24 * 60 * 60 * 1000;
    this.timerInterval = null;
    this.isSpinningTurbo = false;
  }

  init() {
    this.startCountdownLoop();
    this.render();
  }

  // Spin Butterfly Action ('فر الفراشة')
  spinButterfly() {
    const user = window.authManager.currentUser;
    if (!user) return;

    if (window.cyberAudio) {
      window.cyberAudio.playSpinHum();
    }

    const now = Date.now();

    // Trigger turbo spin animation
    this.isSpinningTurbo = true;
    const butterflyEl = document.getElementById('neon-butterfly-element');
    if (butterflyEl) {
      butterflyEl.classList.remove('idle', 'active-24h');
      butterflyEl.classList.add('spinning');
    }

    // Set 24h active cycle timestamp
    const newEndTime = new Date(now + this.spinCycleDuration).toISOString();
    user.butterflySpinActiveUntil = newEndTime;
    window.authManager.saveUsers();

    setTimeout(() => {
      this.isSpinningTurbo = false;
      if (butterflyEl) {
        butterflyEl.classList.remove('spinning');
        butterflyEl.classList.add('active-24h');
      }
      this.render();
      if (window.zelzalApp) {
        window.zelzalApp.showNotification('🦋 تم تدوير الفراشة بنجاح! العداد التكنولوجي يعمل الآن لمدة 24 ساعة متواصلة', 'success');
      }
    }, 1200);
  }

  // Claim Daily Free 50 Points
  claimDailyFreePoints() {
    const user = window.authManager.currentUser;
    if (!user) return;

    const now = Date.now();
    const lastClaim = user.butterflyLastClaim ? new Date(user.butterflyLastClaim).getTime() : 0;
    const cooldown = 24 * 60 * 60 * 1000; // 24 hours cooldown

    if (lastClaim && (now - lastClaim) < cooldown) {
      if (window.cyberAudio) window.cyberAudio.playError();
      const remainingMs = cooldown - (now - lastClaim);
      const remainingHours = Math.ceil(remainingMs / (1000 * 60 * 60));
      if (window.zelzalApp) {
        window.zelzalApp.showNotification(`⏳ العداد المجاني قيد العمل، يمكنك المطالبة بعد ${remainingHours} ساعة`, 'warning');
      }
      return;
    }

    // Reward 50 Points
    user.butterflyLastClaim = new Date(now).toISOString();
    window.authManager.modifyPoints(50, 'المكافأة اليومية من العداد المجاني');

    if (window.cyberAudio) {
      window.cyberAudio.playRewardChime();
    }

    this.render();
    if (window.zelzalApp) {
      window.zelzalApp.showNotification('🎉 مبروك! استلمت 50 نقطة مجانية من العداد اليومي!', 'success');
    }
  }

  // Collect Turbo Points from Purchased Counters
  collectPurchasedCountersYield() {
    const user = window.authManager.currentUser;
    if (!user) return;

    const counters = user.countersOwned || [];
    if (counters.length === 0) {
      if (window.zelzalApp) {
        window.zelzalApp.showNotification('🛒 لا يوجد عدادات شراء نشطة لديك حالياً، يمكنك شراؤها من المتجر', 'info');
      }
      return;
    }

    let totalYield = 0;
    const now = Date.now();

    counters.forEach(c => {
      const lastCollect = c.lastCollectedAt ? new Date(c.lastCollectedAt).getTime() : new Date(c.purchasedAt).getTime();
      const hoursElapsed = (now - lastCollect) / (1000 * 60 * 60);
      const hourlyRate = (c.dailyYield || 50) / 24;
      const accrued = Math.floor(hoursElapsed * hourlyRate);

      if (accrued > 0) {
        totalYield += accrued;
        c.lastCollectedAt = new Date(now).toISOString();
      }
    });

    if (totalYield > 0) {
      window.authManager.modifyPoints(totalYield, `أرباح عدادات الشراء (${counters.length} عداد)`);
      window.authManager.saveUsers();
      if (window.cyberAudio) window.cyberAudio.playRewardChime();
      if (window.zelzalApp) {
        window.zelzalApp.showNotification(`⚡ تم جمع +${totalYield} نقطة من عدادات الشراء الخاصة بك!`, 'success');
      }
    } else {
      if (window.zelzalApp) {
        window.zelzalApp.showNotification('⏳ العدادات قيد التعدين، يرجى الانتظار لتراكم المزيد من النقاط', 'info');
      }
    }

    this.render();
  }

  startCountdownLoop() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.updateTimersDisplay();
    }, 1000);
  }

  updateTimersDisplay() {
    const user = window.authManager.currentUser;
    if (!user) return;

    const now = Date.now();

    // 1. Butterfly 24h Spin Timer
    const spinUntil = user.butterflySpinActiveUntil ? new Date(user.butterflySpinActiveUntil).getTime() : 0;
    const spinTimerEl = document.getElementById('butterfly-spin-timer');
    const spinStatusEl = document.getElementById('butterfly-spin-status');
    const butterflyEl = document.getElementById('neon-butterfly-element');

    if (spinUntil > now) {
      const diff = spinUntil - now;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      const formatted = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      if (spinTimerEl) spinTimerEl.textContent = formatted;
      if (spinStatusEl) {
        spinStatusEl.innerHTML = `<span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping inline-block ml-1.5"></span> الفراشة تدور بنشاط (24H)`;
        spinStatusEl.className = 'text-xs font-black text-emerald-400 flex items-center justify-center';
      }
      if (butterflyEl && !this.isSpinningTurbo) {
        butterflyEl.classList.remove('idle');
        butterflyEl.classList.add('active-24h');
      }
    } else {
      if (spinTimerEl) spinTimerEl.textContent = '24:00:00';
      if (spinStatusEl) {
        spinStatusEl.innerHTML = `<span class="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block ml-1.5"></span> جاهزة للفر والدوران`;
        spinStatusEl.className = 'text-xs font-black text-amber-400 flex items-center justify-center';
      }
      if (butterflyEl && !this.isSpinningTurbo) {
        butterflyEl.classList.remove('active-24h', 'spinning');
        butterflyEl.classList.add('idle');
      }
    }

    // 2. Daily Free 50 Points Cooldown
    const lastClaim = user.butterflyLastClaim ? new Date(user.butterflyLastClaim).getTime() : 0;
    const cooldown = 24 * 60 * 60 * 1000;
    const dailyBtn = document.getElementById('btn-claim-daily-free');
    const dailyTimerEl = document.getElementById('daily-free-timer');

    if (lastClaim && (now - lastClaim) < cooldown) {
      const diff = cooldown - (now - lastClaim);
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      const formatted = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

      if (dailyTimerEl) dailyTimerEl.textContent = `المطالبة التالية بعد: ${formatted}`;
      if (dailyBtn) {
        dailyBtn.disabled = true;
        dailyBtn.className = 'w-full py-3 rounded-2xl bg-slate-800/80 text-slate-400 font-bold text-xs border border-slate-700 cursor-not-allowed';
        dailyBtn.textContent = '⏳ تم الاستلام اليوم (50 نقطة)';
      }
    } else {
      if (dailyTimerEl) dailyTimerEl.textContent = 'المطالبة متاحة الآن (+50 نقطة مجانية)!';
      if (dailyBtn) {
        dailyBtn.disabled = false;
        dailyBtn.className = 'w-full py-3 rounded-2xl btn-neon-cyan font-black text-xs shadow-lg';
        dailyBtn.textContent = '🎁 استلم 50 نقطة اليومية الآن';
      }
    }
  }

  render() {
    const user = window.authManager.currentUser;
    if (!user) return;

    // Purchased Counters Display (Starts at 0 as requested)
    const counters = user.countersOwned || [];
    const countEl = document.getElementById('purchased-counters-count');
    const powerEl = document.getElementById('purchased-counters-power');
    const countersListEl = document.getElementById('purchased-counters-list');

    if (countEl) countEl.textContent = counters.length; // '0' initially

    let totalDailyPower = 0;
    counters.forEach(c => totalDailyPower += (c.dailyYield || 0));

    if (powerEl) powerEl.textContent = `+${totalDailyPower} نقطة/يومياً`;

    if (countersListEl) {
      if (counters.length === 0) {
        countersListEl.innerHTML = `
          <div class="text-center py-6 px-4 bg-slate-900/50 rounded-2xl border border-dashed border-slate-800">
            <span class="text-3xl mb-2 block">⚡</span>
            <p class="text-slate-400 text-sm font-semibold">يوجد حالياً 0 عدادات شراء نشطة</p>
            <p class="text-xs text-slate-500 mt-1">تفضل بزيارة قسم المتجر لشراء عدادات التوربو (500، 1000، 1500، 2000)</p>
            <button onclick="window.zelzalApp.switchTab('store')" class="mt-3 px-4 py-1.5 rounded-xl btn-neon-outline text-xs font-bold">
              🛒 الانتقال إلى المتجر
            </button>
          </div>
        `;
      } else {
        countersListEl.innerHTML = counters.map((c, i) => `
          <div class="p-3.5 rounded-2xl bg-slate-900/80 border border-purple-500/30 flex items-center justify-between gap-3 hover:border-purple-400 transition-all">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center text-xl shadow-lg shadow-purple-500/20">
                ⚡
              </div>
              <div>
                <div class="font-black text-sm text-slate-100">${c.name}</div>
                <div class="text-[11px] text-cyan-400 font-bold">إنتاجية: +${c.dailyYield} نقطة / 24 ساعة</div>
              </div>
            </div>
            <div class="text-left">
              <span class="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black animate-pulse">
                🟢 يعمل الآن
              </span>
            </div>
          </div>
        `).join('');
      }
    }

    this.updateTimersDisplay();
  }
}

window.butterflyManager = new ButterflyManager();
