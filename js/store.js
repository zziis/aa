/**
 * 🛒 Cyber Store & Counter Matrix Manager
 * Handles purchasing Turbo Counters:
 * - 500 Points (Basic Cyber Core) -> +35 pts/day
 * - 1000 Points (Advanced Quantum Core) -> +80 pts/day
 * - 1500 Points (Plasma Turbo Core) -> +140 pts/day
 * - 2000 Points (Omega Supernova Core) -> +220 pts/day
 * Also handles Points Refill for testing.
 */

class StoreManager {
  constructor() {
    this.countersCatalog = [
      {
        id: 'counter-500',
        name: '⚡ عداد التوربو 500 (Basic Cyber Core)',
        price: 500,
        dailyYield: 35,
        color: 'from-cyan-500 to-blue-600',
        borderColor: 'border-cyan-400',
        description: 'عداد كهرومغناطيسي خفيف ينتج 35 نقطة إضافية كل 24 ساعة لتسريع نمو نقاطك.',
        badge: 'الأكثر شعبية'
      },
      {
        id: 'counter-1000',
        name: '🔮 عداد الكوانتوم 1000 (Quantum Core)',
        price: 1000,
        dailyYield: 80,
        color: 'from-purple-500 to-indigo-600',
        borderColor: 'border-purple-400',
        description: 'معالج كمومي متطور يضاعف إنتاج الطاقة ويمنحك 80 نقطة يومياً مع هالة نيون بنفسجية.',
        badge: 'قوة مضاعفة'
      },
      {
        id: 'counter-1500',
        name: '🔥 عداد البلازما 1500 (Plasma Turbo Core)',
        price: 1500,
        dailyYield: 140,
        color: 'from-amber-500 to-rose-600',
        borderColor: 'border-amber-400',
        description: 'مولد بلازما حراري فائق السرعة يولد 140 نقطة كل 24 ساعة مع شارة VIP في الرومات.',
        badge: 'إصدار احترافي'
      },
      {
        id: 'counter-2000',
        name: '👑 عداد الأوميغا 2000 (Omega Legendary Core)',
        price: 2000,
        dailyYield: 220,
        color: 'from-emerald-400 via-teal-500 to-cyan-600',
        borderColor: 'border-emerald-400',
        description: 'أقوى عداد سيبراني في منصة زلزال، يمنحك 220 نقطة يومياً مع أولوية المقاعد والإشراف.',
        badge: 'الأسطوري VIP'
      }
    ];
  }

  buyCounter(counterId) {
    const user = window.authManager.currentUser;
    if (!user) {
      if (window.zelzalApp) window.zelzalApp.showNotification('يرجى تسجيل الدخول أولاً', 'error');
      return;
    }

    const item = this.countersCatalog.find(c => c.id === counterId);
    if (!item) return;

    // Check Points Balance
    if ((user.points || 0) < item.price) {
      if (window.cyberAudio) window.cyberAudio.playError();
      if (window.zelzalApp) {
        window.zelzalApp.showNotification(`⚠️ رصيدك الحالي (${user.points || 0} نقطة) لا يكفي لشراء ${item.name} بسعر ${item.price} نقطة.`, 'error');
      }
      return;
    }

    // Deduct points
    const success = window.authManager.modifyPoints(-item.price, `شراء ${item.name}`);
    if (!success) return;

    if (!user.countersOwned) user.countersOwned = [];

    const newPurchasedCounter = {
      instanceId: 'inst_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      catalogId: item.id,
      name: item.name,
      dailyYield: item.dailyYield,
      purchasedAt: new Date().toISOString(),
      lastCollectedAt: new Date().toISOString()
    };

    user.countersOwned.push(newPurchasedCounter);
    window.authManager.saveUsers();

    if (window.cyberAudio) window.cyberAudio.playRewardChime();

    if (window.zelzalApp) {
      window.zelzalApp.showNotification(`🎉 مبروك! تم شراء ${item.name} بنجاح وإضافته إلى عداد الشراء الخاص بك!`, 'success');
    }

    this.render();
    if (window.butterflyManager) {
      window.butterflyManager.render();
    }
  }

  // Free Points Refill for testing
  rechargeTestPoints(amount = 1000) {
    window.authManager.modifyPoints(amount, `شحن رصيد تجريبي (+${amount} نقطة)`);
    if (window.cyberAudio) window.cyberAudio.playRewardChime();
    if (window.zelzalApp) {
      window.zelzalApp.showNotification(`⚡ تم شحن محفظتك بـ +${amount} نقطة بنجاح!`, 'success');
    }
    this.render();
  }

  render() {
    const container = document.getElementById('store-counters-grid');
    if (!container) return;

    const user = window.authManager.currentUser;
    const userPoints = user ? (user.points || 0) : 0;

    container.innerHTML = this.countersCatalog.map(c => {
      const canAfford = userPoints >= c.price;
      return `
        <div class="cyber-card p-5 flex flex-col justify-between gap-4 relative overflow-hidden border ${c.borderColor}/40 hover:${c.borderColor} transition-all">
          <span class="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-slate-900/90 text-cyan-400 border border-cyan-500/30 text-[10px] font-black">
            ${c.badge}
          </span>
          
          <div>
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr ${c.color} flex items-center justify-center text-2xl shadow-lg mb-3">
              ⚡
            </div>
            <h3 class="font-black text-base text-slate-100 leading-snug">${c.name}</h3>
            <p class="text-xs text-slate-400 mt-2 leading-relaxed">${c.description}</p>
            
            <div class="mt-4 p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <span class="text-xs text-slate-400 font-semibold">الإنتاج اليومي:</span>
              <span class="text-xs font-black text-emerald-400">+${c.dailyYield} نقطة / 24H</span>
            </div>
          </div>

          <div class="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
            <div>
              <div class="text-[10px] text-slate-400 font-semibold">السعر المطلوب:</div>
              <div class="text-lg font-black text-amber-400 font-cyber">${c.price.toLocaleString()} <span class="text-xs font-bold">نقطة</span></div>
            </div>
            
            <button onclick="window.storeManager.buyCounter('${c.id}')" 
                    class="px-4 py-2 rounded-xl text-xs font-black shadow-lg transition-all ${canAfford ? 'btn-neon-cyan' : 'bg-slate-800 text-slate-400 border border-slate-700'}">
              ${canAfford ? '⚡ شراء وتفعيل' : 'نقاط غير كافية'}
            </button>
          </div>
        </div>
      `;
    }).join('');
  }
}

window.storeManager = new StoreManager();
