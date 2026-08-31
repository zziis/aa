/**
 * 💬 Cyber Support & FAQ AI Bot System
 * Handles:
 * 1. Contacting Specialized Support Team (مراسلة الفريق المختص) with ticket creation & live replies.
 * 2. Dedicated Cyber AI FAQ Bot (بوت مخصص للأسئلة الشائعة) with instant answers.
 */

class SupportManager {
  constructor() {
    this.tickets = window.supabaseService.getLocal('support_tickets', []);
    this.currentMode = 'bot'; // 'bot' or 'team'
    this.botChatHistory = [
      {
        id: 'bot-welcome',
        sender: 'bot',
        text: 'أهلاً بك في المساعد السيبراني لمنصة زلزال! 🤖⚡\nكيف يمكنني مساعدتك اليوم؟ يمكنك اختيار أحد الأسئلة الشائعة أدناه أو كتابة سؤالك مباشرة.',
        time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
      }
    ];

    this.faqDatabase = [
      {
        triggers: ['فراشة', 'عداد الفراشة', '50 نقطة', 'الدوران', 'فر', 'فراشه'],
        question: 'كيف يعمل عداد الفراشة الدوار والـ 50 نقطة اليومية؟',
        answer: '🦋 عند الضغط على زر "فر الفراشة"، تبدأ الفراشة بالدوران التكنولوجي وتفعّل دورة طاقة تدوم 24 ساعة متواصلة. يمكنك استلام 50 نقطة مجانية يومياً من العداد المجاني الموجود أسفل الفراشة فور اكتمال المؤقت!'
      },
      {
        triggers: ['روم', 'انشاء روم', '500', 'سعر الروم', 'انشاء', 'رومات'],
        question: 'كيف أنشئ روم جديدة وما هي شروطها؟',
        answer: '🎙️ لإنشاء روم صوتية، توجه إلى قسم "الرومات" واضغط على زر "إنشاء روم". يتطلب الإنشاء توفر 500 نقطة في محفظتك، مع تحديد اسم وصورة ونبذة الروم ورمز قفل اختياري.'
      },
      {
        triggers: ['اشراف', 'طرد', 'حظر', 'قفل', 'مالك', 'صاحب الروم'],
        question: 'ما هي صلاحيات صاحب الروم (رفع إشراف، طرد، حظر، قفل)؟',
        answer: '👑 صاحب الروم يمتلك لوحة تحكم كاملة تتيح له:\n1. رفع إشراف للمستخدمين 👑\n2. طرد أي مستخدم من الروم 🚫\n3. حظر المستخدمين المخالفين نهائياً 🔒\n4. قفل الروم برمز سري PIN.'
      },
      {
        triggers: ['متجر', 'شراء عداد', '1000', '1500', '2000', 'عدادات'],
        question: 'ما هي العدادات المتاحة في المتجر وما هي أرباحها؟',
        answer: '🛒 يتوفر في المتجر 4 فئات من العدادات التوربو:\n- عداد 500: ينتج +35 نقطة/يومياً\n- عداد 1000: ينتج +80 نقطة/يومياً\n- عداد 1500: ينتج +140 نقطة/يومياً\n- عداد 2000: ينتج +220 نقطة/يومياً\nتظهر أرباحها فوراً في خانة "عداد الشراء".'
      },
      {
        triggers: ['حسابي', 'تعديل', 'تغيير', 'كلمة مرور', 'هاتف', 'اسم', 'id'],
        question: 'كيف أعدل بيانات حسابي وكلمة المرور ومعرف الـ ID؟',
        answer: '👤 ادخل إلى تبويب "حسابي" في القائمة السفلية، ثم اضغط على زر "تعديل الملف الشخصي". يمكنك تعديل الاسم، البريد، رقم الهاتف، كلمة المرور، وتغيير صورة الأفاتار.'
      },
      {
        triggers: ['supabase', 'github', 'ربط', 'تطوير', 'رفع'],
        question: 'كيف أقوم بربط المشروع بـ Supabase ورفعه على GitHub؟',
        answer: '⚡ المشروع مجهز بالكامل:\n1. لربط Supabase: اضغط على زر السحابة أعلى الشاشة وأدخل URL و Anon Key، وقم بتنفيذ ملف supabase_schema.sql.\n2. لـ GitHub: المشروع يحتوي على README.md و .gitignore جاهز للرفع بأمر git push.'
      }
    ];
  }

  init() {
    this.renderBotChat();
    this.renderTicketsList();
  }

  switchSupportMode(mode) {
    this.currentMode = mode;
    const botView = document.getElementById('support-bot-view');
    const teamView = document.getElementById('support-team-view');
    const btnBot = document.getElementById('tab-support-bot-btn');
    const btnTeam = document.getElementById('tab-support-team-btn');

    if (mode === 'bot') {
      botView.classList.remove('hidden');
      teamView.classList.add('hidden');
      btnBot.classList.add('btn-neon-cyan');
      btnBot.classList.remove('bg-slate-800', 'text-slate-400');
      btnTeam.classList.remove('btn-neon-cyan');
      btnTeam.classList.add('bg-slate-800', 'text-slate-400');
    } else {
      botView.classList.add('hidden');
      teamView.classList.remove('hidden');
      btnTeam.classList.add('btn-neon-cyan');
      btnTeam.classList.remove('bg-slate-800', 'text-slate-400');
      btnBot.classList.remove('btn-neon-cyan');
      btnBot.classList.add('bg-slate-800', 'text-slate-400');
    }
  }

  // Ask Question to Bot
  askBot(query) {
    if (!query || !query.trim()) return;

    const user = window.authManager.currentUser;
    const cleanQuery = query.trim().toLowerCase();

    // 1. Push user message
    this.botChatHistory.push({
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: query.trim(),
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    });

    if (window.cyberAudio) window.cyberAudio.playClick();
    this.renderBotChat();

    // 2. Find best match in FAQ
    let bestMatch = null;
    for (const item of this.faqDatabase) {
      if (item.triggers.some(t => cleanQuery.includes(t)) || cleanQuery.includes(item.question.toLowerCase())) {
        bestMatch = item;
        break;
      }
    }

    // 3. Bot reply with slight delay
    setTimeout(() => {
      let botResponse = '';
      if (bestMatch) {
        botResponse = bestMatch.answer;
      } else {
        botResponse = 'لم أجد إجابة مطابقة تماماً لسؤالك، يمكنك مراسلة الفريق المختص عبر تبويب "مراسلة الفريق المختص" وسيقوم فريق الدعم بمساعدتك فوراً! ⚡';
      }

      this.botChatHistory.push({
        id: 'bot_' + Date.now(),
        sender: 'bot',
        text: botResponse,
        time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
      });

      if (window.cyberAudio) window.cyberAudio.playRewardChime();
      this.renderBotChat();
    }, 500);
  }

  // Create Support Ticket to Specialized Team
  submitTicket({ subject, category, message }) {
    const user = window.authManager.currentUser;
    if (!user) throw new Error('يرجى تسجيل الدخول أولاً');

    if (!subject || !message) {
      throw new Error('يرجى ملء موضوع المشكلة وتفاصيل الرسالة');
    }

    const newTicket = {
      id: 'TCK-' + Math.floor(10000 + Math.random() * 90000),
      userId: user.id,
      userName: user.name,
      userCustomId: user.customId,
      subject: subject.trim(),
      category: category || 'عام',
      message: message.trim(),
      status: 'قيد المراجعة',
      replies: [
        {
          id: 'rep_1',
          sender: 'فريق الدعم الفني',
          text: 'تم استلام تذكرتك بنجاح! جاري مراجعة التفاصيل من قبل المختصين.',
          time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
        }
      ],
      createdAt: new Date().toISOString()
    };

    this.tickets.unshift(newTicket);
    window.supabaseService.setLocal('support_tickets', this.tickets);

    if (window.cyberAudio) window.cyberAudio.playRewardChime();
    if (window.zelzalApp) {
      window.zelzalApp.showNotification(`📨 تم إرسال التذكرة رقم (${newTicket.id}) إلى الفريق المختص بنجاح!`, 'success');
    }

    // Simulate specialist team live response in 4 seconds
    setTimeout(() => {
      newTicket.status = 'تم الرد';
      newTicket.replies.push({
        id: 'rep_' + Date.now(),
        sender: 'المشرف التقني (فريق زلزال)',
        text: `مرحباً ${user.name}، تم الاطلاع على استفسارك بخصوص (${subject.trim()}). تم اتخاذ الإجراء اللازم وتحديث بياناتك بنجاح! يسعدنا خدمتك دائماً ⚡`,
        time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
      });
      window.supabaseService.setLocal('support_tickets', this.tickets);
      this.renderTicketsList();
      if (window.zelzalApp) {
        window.zelzalApp.showNotification(`🔔 وصلك رد جديد من الفريق المختص على التذكرة ${newTicket.id}!`, 'info');
      }
    }, 4500);

    this.renderTicketsList();
    return newTicket;
  }

  renderBotChat() {
    const container = document.getElementById('bot-messages-container');
    if (!container) return;

    container.innerHTML = this.botChatHistory.map(m => {
      const isBot = m.sender === 'bot';
      return `
        <div class="flex items-start gap-2.5 my-2.5 ${isBot ? '' : 'flex-row-reverse'}">
          <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-md ${isBot ? 'bg-gradient-to-tr from-purple-600 to-cyan-500 text-white' : 'bg-slate-700 text-slate-200'}">
            ${isBot ? '🤖' : '👤'}
          </div>
          <div class="max-w-[80%]">
            <div class="text-[10px] text-slate-400 mb-0.5 flex items-center gap-1.5 ${isBot ? '' : 'justify-end'}">
              <span class="font-black text-slate-300">${isBot ? 'المساعد الذكي (Zelzal Bot)' : 'أنت'}</span>
              <span>${m.time}</span>
            </div>
            <div class="p-3 text-xs leading-relaxed whitespace-pre-line rounded-2xl ${isBot ? 'chat-bubble-bot text-slate-100' : 'chat-bubble-user text-slate-100'}">
              ${m.text}
            </div>
          </div>
        </div>
      `;
    }).join('');

    container.scrollTop = container.scrollHeight;
  }

  renderTicketsList() {
    const container = document.getElementById('tickets-history-container');
    if (!container) return;

    const user = window.authManager.currentUser;
    const userTickets = user ? this.tickets.filter(t => t.userId === user.id) : this.tickets;

    if (userTickets.length === 0) {
      container.innerHTML = `
        <div class="text-center py-6 text-slate-500 text-xs">
          لا توجد تذاكر سابقة، يمكنك إرسال تذكرة جديدة للفريق المختص أعلاه.
        </div>
      `;
      return;
    }

    container.innerHTML = userTickets.map(t => `
      <div class="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 transition-all">
        <div class="flex items-center justify-between gap-2 mb-2">
          <div class="flex items-center gap-2">
            <span class="font-mono text-xs font-black text-cyan-400">${t.id}</span>
            <span class="text-xs font-bold text-slate-200">${t.subject}</span>
          </div>
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black ${t.status === 'تم الرد' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}">
            ${t.status}
          </span>
        </div>
        <p class="text-xs text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-900 leading-relaxed mb-3">
          ${t.message}
        </p>
        
        <div class="space-y-2 border-t border-slate-800 pt-2">
          ${(t.replies || []).map(r => `
            <div class="p-2.5 rounded-xl bg-purple-950/20 border border-purple-500/20 text-xs">
              <div class="flex items-center justify-between text-[10px] text-purple-300 font-bold mb-1">
                <span>🛡️ ${r.sender}</span>
                <span>${r.time}</span>
              </div>
              <p class="text-slate-300">${r.text}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  }
}

window.supportManager = new SupportManager();
