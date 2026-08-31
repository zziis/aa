/**
 * 🎙️ Cyber Voice Rooms & Room Moderation Engine
 * Handles Room Creation (Enforcing 500 Points Fee),
 * Stage Seat Management, Live Chat, and Owner Controls:
 * (Promote Moderator, Kick User, Ban User, Lock Room with PIN)
 */

class RoomsManager {
  constructor() {
    this.rooms = window.supabaseService.getLocal('rooms', []);
    this.activeRoom = null;
    this.initDefaultRoomsIfEmpty();
  }

  initDefaultRoomsIfEmpty() {
    if (this.rooms.length === 0) {
      this.rooms = [
        {
          id: 'room-1',
          name: '⚡ رواد التكنولوجيا والنيون السيبراني',
          avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
          bio: 'المجلس الرسمي لمنصة زلزال لمناقشة أحدث تقنيات الذكاء الاصطناعي وتطوير الويب السيبراني.',
          ownerId: 'usr_owner_1',
          ownerName: 'المهندس سيف',
          ownerCustomId: 'ID-10001',
          isLocked: false,
          passcode: '',
          moderators: ['usr_owner_1'],
          bannedUsers: [],
          membersCount: 48,
          seats: [
            { seatNum: 1, userId: 'usr_owner_1', name: 'المهندس سيف (المالك)', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80', isMuted: false, isSpeaking: true, role: 'owner' },
            { seatNum: 2, userId: 'usr_mod_1', name: 'سارة التقنية', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80', isMuted: false, isSpeaking: false, role: 'moderator' },
            { seatNum: 3, userId: null },
            { seatNum: 4, userId: null },
            { seatNum: 5, userId: null },
            { seatNum: 6, userId: null },
            { seatNum: 7, userId: null },
            { seatNum: 8, userId: null }
          ],
          messages: [
            { id: 'm1', senderName: 'نظام زلزال', senderAvatar: '⚡', text: 'أهلاً بكم في الغرفة الصوتية السيبرانية!', isSystem: true, time: '14:00' },
            { id: 'm2', senderName: 'المهندس سيف', senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80', text: 'مرحباً بالجميع! الصوت واضح للكل؟ 🎙️', isSystem: false, time: '14:01' }
          ],
          createdAt: new Date().toISOString()
        },
        {
          id: 'room-2',
          name: '🚀 ديوانية زلزال للدردشة والألعاب',
          avatar: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=150&auto=format&fit=crop&q=80',
          bio: 'جلسات ترفيهية، مسابقات يومية، وتوزيع نقاط وجوائز للمشاركين المتفاعلين.',
          ownerId: 'usr_owner_2',
          ownerName: 'الكابتن علي',
          ownerCustomId: 'ID-20002',
          isLocked: true,
          passcode: '1234',
          moderators: ['usr_owner_2'],
          bannedUsers: [],
          membersCount: 32,
          seats: [
            { seatNum: 1, userId: 'usr_owner_2', name: 'الكابتن علي', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80', isMuted: false, isSpeaking: true, role: 'owner' },
            { seatNum: 2, userId: null },
            { seatNum: 3, userId: null },
            { seatNum: 4, userId: null },
            { seatNum: 5, userId: null },
            { seatNum: 6, userId: null },
            { seatNum: 7, userId: null },
            { seatNum: 8, userId: null }
          ],
          messages: [
            { id: 'm1', senderName: 'نظام زلزال', senderAvatar: '⚡', text: 'هذه الروم مقفلة برمز سري للحماية.', isSystem: true, time: '13:50' }
          ],
          createdAt: new Date().toISOString()
        },
        {
          id: 'room-3',
          name: '💎 صالون VIP الماسي',
          avatar: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=150&auto=format&fit=crop&q=80',
          bio: 'غرفة خاصة لكبار الشخصيات وممتلكي العدادات التوربو (1500 و 2000 نقطة).',
          ownerId: 'user-demo-1',
          ownerName: 'قائد الزلزال التكنولوجي',
          ownerCustomId: 'ID-77291',
          isLocked: false,
          passcode: '',
          moderators: ['user-demo-1'],
          bannedUsers: [],
          membersCount: 19,
          seats: [
            { seatNum: 1, userId: 'user-demo-1', name: 'قائد الزلزال (أنت)', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80', isMuted: false, isSpeaking: false, role: 'owner' },
            { seatNum: 2, userId: null },
            { seatNum: 3, userId: null },
            { seatNum: 4, userId: null },
            { seatNum: 5, userId: null },
            { seatNum: 6, userId: null },
            { seatNum: 7, userId: null },
            { seatNum: 8, userId: null }
          ],
          messages: [],
          createdAt: new Date().toISOString()
        }
      ];
      this.saveRooms();
    }
  }

  saveRooms() {
    window.supabaseService.setLocal('rooms', this.rooms);
  }

  // Create Room (Enforces 500 Points Required)
  createRoom({ name, avatar, bio, passcode }) {
    const user = window.authManager.currentUser;
    if (!user) throw new Error('يرجى تسجيل الدخول أولاً');

    const ROOM_PRICE = 500;

    // Check user points balance
    if ((user.points || 0) < ROOM_PRICE) {
      if (window.cyberAudio) window.cyberAudio.playError();
      throw new Error(`⚠️ لا يمكنك إنشاء روم! الرصيد المطلوب هو ${ROOM_PRICE} نقطة، ورصيدك الحالي هو ${user.points || 0} نقطة.`);
    }

    if (!name || !name.trim()) {
      throw new Error('يرجى إدخال اسم الروم');
    }

    // Deduct 500 points
    const successDeduct = window.authManager.modifyPoints(-ROOM_PRICE, `إنشاء روم جديدة: ${name.trim()}`);
    if (!successDeduct) {
      throw new Error('فشل خصم نقاط إنشاء الروم');
    }

    const newRoom = {
      id: 'room_' + Date.now(),
      name: name.trim(),
      avatar: avatar && avatar.trim() ? avatar.trim() : 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=150&auto=format&fit=crop&q=80',
      bio: bio && bio.trim() ? bio.trim() : 'روم صوتية سيبرانية جديدة على منصة زلزال',
      ownerId: user.id,
      ownerName: user.name,
      ownerCustomId: user.customId,
      isLocked: Boolean(passcode && passcode.trim()),
      passcode: passcode ? passcode.trim() : '',
      moderators: [user.id],
      bannedUsers: [],
      membersCount: 1,
      seats: [
        { seatNum: 1, userId: user.id, name: user.name, avatar: user.avatar, isMuted: false, isSpeaking: false, role: 'owner' },
        { seatNum: 2, userId: null },
        { seatNum: 3, userId: null },
        { seatNum: 4, userId: null },
        { seatNum: 5, userId: null },
        { seatNum: 6, userId: null },
        { seatNum: 7, userId: null },
        { seatNum: 8, userId: null }
      ],
      messages: [
        { id: 'm_' + Date.now(), senderName: 'نظام زلزال', senderAvatar: '⚡', text: `تم إنشاء الروم بواسطة ${user.name} بنجاح!`, isSystem: true, time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) }
      ],
      createdAt: new Date().toISOString()
    };

    this.rooms.unshift(newRoom);
    this.saveRooms();

    if (window.cyberAudio) window.cyberAudio.playRewardChime();

    this.renderRoomsList();
    this.enterRoom(newRoom.id);
    return newRoom;
  }

  // Enter Room (Checks Banned and Passcode)
  enterRoom(roomId, inputPasscode = null) {
    const user = window.authManager.currentUser;
    const room = this.rooms.find(r => r.id === roomId);
    if (!room) {
      if (window.zelzalApp) window.zelzalApp.showNotification('الروم غير موجودة أو تم حذفها', 'error');
      return;
    }

    // Check Ban
    if (user && room.bannedUsers && room.bannedUsers.includes(user.id)) {
      if (window.cyberAudio) window.cyberAudio.playError();
      if (window.zelzalApp) window.zelzalApp.showNotification('🚫 تم حظرك من هذه الروم من قبل صاحب الروم', 'error');
      return;
    }

    // Check Passcode if locked and user is not owner
    if (room.isLocked && room.passcode && (!user || room.ownerId !== user.id)) {
      if (inputPasscode === null) {
        this.promptPasscodeModal(room);
        return;
      }
      if (inputPasscode !== room.passcode) {
        if (window.cyberAudio) window.cyberAudio.playError();
        if (window.zelzalApp) window.zelzalApp.showNotification('❌ رمز القفل غير صحيح!', 'error');
        return;
      }
    }

    this.activeRoom = room;
    if (window.cyberAudio) window.cyberAudio.playRoomJoin();

    this.renderActiveRoomStage();
    document.getElementById('rooms-list-view').classList.add('hidden');
    document.getElementById('room-stage-view').classList.remove('hidden');
  }

  leaveRoom() {
    this.activeRoom = null;
    document.getElementById('room-stage-view').classList.add('hidden');
    document.getElementById('rooms-list-view').classList.remove('hidden');
    this.renderRoomsList();
  }

  promptPasscodeModal(room) {
    const modal = document.getElementById('passcode-prompt-modal');
    const input = document.getElementById('room-passcode-input');
    const roomTitle = document.getElementById('passcode-modal-room-name');

    if (roomTitle) roomTitle.textContent = room.name;
    if (input) input.value = '';
    if (modal) {
      modal.classList.remove('hidden');
      modal.dataset.roomId = room.id;
    }
  }

  submitPasscode() {
    const modal = document.getElementById('passcode-prompt-modal');
    const input = document.getElementById('room-passcode-input');
    const roomId = modal ? modal.dataset.roomId : null;
    const code = input ? input.value.trim() : '';

    if (modal) modal.classList.add('hidden');
    if (roomId) {
      this.enterRoom(roomId, code);
    }
  }

  // --- OWNER & MODERATOR ACTIONS ---

  // 1. Promote Moderator (رفع إشراف)
  promoteModerator(targetUserId, targetUserName) {
    const user = window.authManager.currentUser;
    if (!this.activeRoom || !user || this.activeRoom.ownerId !== user.id) {
      if (window.zelzalApp) window.zelzalApp.showNotification('هذا الإجراء متاح فقط لصاحب الروم', 'error');
      return;
    }

    if (!this.activeRoom.moderators.includes(targetUserId)) {
      this.activeRoom.moderators.push(targetUserId);
      this.activeRoom.messages.push({
        id: 'm_' + Date.now(),
        senderName: 'إشعار إداري',
        senderAvatar: '👑',
        text: `تمت ترقية ${targetUserName} إلى رتبة مشرف بالروم بواسطة المالك`,
        isSystem: true,
        time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
      });
      this.saveRooms();
      this.renderActiveRoomStage();
      if (window.zelzalApp) window.zelzalApp.showNotification(`👑 تم رفع ${targetUserName} إلى مشرف بنجاح!`, 'success');
    } else {
      this.activeRoom.moderators = this.activeRoom.moderators.filter(id => id !== targetUserId);
      this.saveRooms();
      this.renderActiveRoomStage();
      if (window.zelzalApp) window.zelzalApp.showNotification(`تمت إزالة الإشراف عن ${targetUserName}`, 'info');
    }
  }

  // 2. Kick User (طرد من الروم)
  kickUser(targetUserId, targetUserName) {
    const user = window.authManager.currentUser;
    if (!this.activeRoom || !user || (this.activeRoom.ownerId !== user.id && !this.activeRoom.moderators.includes(user.id))) {
      if (window.zelzalApp) window.zelzalApp.showNotification('ليس لديك صلاحية الطرد', 'error');
      return;
    }

    // Remove from seats if on seat
    this.activeRoom.seats.forEach(s => {
      if (s.userId === targetUserId) {
        s.userId = null;
        delete s.name;
        delete s.avatar;
        delete s.role;
      }
    });

    this.activeRoom.messages.push({
      id: 'm_' + Date.now(),
      senderName: 'نظام الحماية',
      senderAvatar: '🚫',
      text: `تم طرد ${targetUserName} من الروم`,
      isSystem: true,
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    });

    this.saveRooms();
    this.renderActiveRoomStage();
    if (window.cyberAudio) window.cyberAudio.playError();
    if (window.zelzalApp) window.zelzalApp.showNotification(`🚫 تم طرد ${targetUserName} من الروم`, 'warning');
  }

  // 3. Ban User (حظر من الروم)
  banUser(targetUserId, targetUserName) {
    const user = window.authManager.currentUser;
    if (!this.activeRoom || !user || this.activeRoom.ownerId !== user.id) {
      if (window.zelzalApp) window.zelzalApp.showNotification('الحظر متاح فقط لصاحب الروم', 'error');
      return;
    }

    if (!this.activeRoom.bannedUsers.includes(targetUserId)) {
      this.activeRoom.bannedUsers.push(targetUserId);
      this.kickUser(targetUserId, targetUserName);
      if (window.zelzalApp) window.zelzalApp.showNotification(`🔒 تم حظر ${targetUserName} نهائياً من دخول الروم`, 'error');
    }
  }

  // 4. Lock / Unlock Room with Passcode (قفل الروم برمز)
  toggleLockRoom() {
    const user = window.authManager.currentUser;
    if (!this.activeRoom || !user || this.activeRoom.ownerId !== user.id) {
      if (window.zelzalApp) window.zelzalApp.showNotification('قفل الروم متاح فقط لصاحب الروم', 'error');
      return;
    }

    if (this.activeRoom.isLocked) {
      this.activeRoom.isLocked = false;
      this.activeRoom.passcode = '';
      this.saveRooms();
      this.renderActiveRoomStage();
      if (window.zelzalApp) window.zelzalApp.showNotification('🔓 تم إلغاء قفل الروم وأصبحت عامة للجميع', 'success');
    } else {
      const newPin = prompt('أدخل رمز القفل السري للروم (أرقام أو حروف):', '1234');
      if (newPin && newPin.trim()) {
        this.activeRoom.isLocked = true;
        this.activeRoom.passcode = newPin.trim();
        this.saveRooms();
        this.renderActiveRoomStage();
        if (window.zelzalApp) window.zelzalApp.showNotification(`🔒 تم قفل الروم بنجاح بالرمز: ${this.activeRoom.passcode}`, 'success');
      }
    }
  }

  // Seat Click (Take seat or leave seat)
  handleSeatClick(seatIndex) {
    const user = window.authManager.currentUser;
    if (!this.activeRoom || !user) return;

    const seat = this.activeRoom.seats[seatIndex];
    if (seat.userId === user.id) {
      seat.userId = null;
      delete seat.name;
      delete seat.avatar;
      delete seat.role;
      if (window.zelzalApp) window.zelzalApp.showNotification('نزلت من مقعد التحدث', 'info');
    } else if (!seat.userId) {
      this.activeRoom.seats.forEach(s => {
        if (s.userId === user.id) {
          s.userId = null;
          delete s.name;
          delete s.avatar;
          delete s.role;
        }
      });

      seat.userId = user.id;
      seat.name = user.name;
      seat.avatar = user.avatar;
      seat.isMuted = false;
      seat.isSpeaking = true;
      seat.role = this.activeRoom.ownerId === user.id ? 'owner' : (this.activeRoom.moderators.includes(user.id) ? 'moderator' : 'member');
      if (window.cyberAudio) window.cyberAudio.playClick();
      if (window.zelzalApp) window.zelzalApp.showNotification('🎙️ تم الصعود على مقعد المتحدثين!', 'success');
    } else {
      this.showUserManageModal(seat);
    }

    this.saveRooms();
    this.renderActiveRoomStage();
  }

  showUserManageModal(seat) {
    const user = window.authManager.currentUser;
    if (!user || !this.activeRoom) return;

    const isOwner = this.activeRoom.ownerId === user.id;
    const isMod = this.activeRoom.moderators.includes(user.id);
    const targetUserId = seat.userId;
    const targetUserName = seat.name;

    if (!isOwner && !isMod) {
      if (window.zelzalApp) window.zelzalApp.showNotification(`المتحدث: ${targetUserName}`, 'info');
      return;
    }

    if (targetUserId === user.id) return;

    const modal = document.getElementById('user-moderation-modal');
    if (modal) {
      document.getElementById('mod-target-name').textContent = targetUserName;
      document.getElementById('mod-target-avatar').src = seat.avatar;
      
      const promoteBtn = document.getElementById('btn-mod-promote');
      const isAlreadyMod = this.activeRoom.moderators.includes(targetUserId);
      promoteBtn.textContent = isAlreadyMod ? '👑 إزالة الإشراف' : '👑 رفع إشراف';
      
      promoteBtn.onclick = () => {
        modal.classList.add('hidden');
        this.promoteModerator(targetUserId, targetUserName);
      };

      document.getElementById('btn-mod-kick').onclick = () => {
        modal.classList.add('hidden');
        this.kickUser(targetUserId, targetUserName);
      };

      document.getElementById('btn-mod-ban').onclick = () => {
        modal.classList.add('hidden');
        this.banUser(targetUserId, targetUserName);
      };

      modal.classList.remove('hidden');
    }
  }

  // Send Chat Message in Room
  sendMessage(text) {
    const user = window.authManager.currentUser;
    if (!this.activeRoom || !user || !text || !text.trim()) return;

    const newMsg = {
      id: 'm_' + Date.now(),
      senderId: user.id,
      senderName: user.name,
      senderAvatar: user.avatar,
      text: text.trim(),
      isSystem: false,
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    };

    this.activeRoom.messages.push(newMsg);
    this.saveRooms();
    if (window.cyberAudio) window.cyberAudio.playClick();
    this.renderRoomMessages();
  }

  // Render Functions
  renderRoomsList() {
    const container = document.getElementById('rooms-grid-container');
    if (!container) return;

    if (this.rooms.length === 0) {
      container.innerHTML = `
        <div class="col-span-full text-center py-12 text-slate-400">
          <span class="text-4xl block mb-2">🎙️</span>
          <p class="font-bold">لا توجد رومات صوتية نشطة حالياً</p>
          <p class="text-xs text-slate-500 mt-1">كن أول من ينشئ روماً تكنولوجية بـ 500 نقطة</p>
        </div>
      `;
      return;
    }

    container.innerHTML = this.rooms.map(r => `
      <div class="cyber-card p-4 flex flex-col justify-between gap-4 group cursor-pointer hover:border-cyan-400 transition-all" onclick="window.roomsManager.enterRoom('${r.id}')">
        <div>
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3">
              <div class="relative">
                <img src="${r.avatar}" alt="${r.name}" class="w-14 h-14 rounded-2xl object-cover border-2 border-cyan-400/40 shadow-lg group-hover:border-cyan-400 transition-all">
                ${r.isLocked ? '<span class="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs shadow-md">🔒</span>' : ''}
              </div>
              <div>
                <h3 class="font-black text-slate-100 text-sm sm:text-base group-hover:text-cyan-400 transition-colors line-clamp-1">${r.name}</h3>
                <div class="flex items-center gap-2 mt-1 text-xs text-slate-400">
                  <span>👑 ${r.ownerName}</span>
                  <span class="text-[10px] text-cyan-400 font-mono">(${r.ownerCustomId || 'ID'})</span>
                </div>
              </div>
            </div>
            <span class="px-2 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-black flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              ${r.membersCount || 1} متصل
            </span>
          </div>
          <p class="text-xs text-slate-400 mt-3 line-clamp-2 leading-relaxed bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
            ${r.bio || 'لا توجد نبذة'}
          </p>
        </div>

        <div class="flex items-center justify-between pt-2 border-t border-slate-800/80">
          <div class="flex items-center -space-x-2 space-x-reverse">
            ${r.seats.filter(s => s.userId).slice(0, 3).map(s => `
              <img src="${s.avatar}" class="w-6 h-6 rounded-full border border-cyan-400 object-cover">
            `).join('') || '<span class="text-[11px] text-slate-500">المقاعد شاغرة</span>'}
          </div>
          <button class="px-3.5 py-1.5 rounded-xl btn-neon-cyan text-xs font-black shadow-md flex items-center gap-1.5">
            <span>دخول الروم</span>
            <span>🎙️</span>
          </button>
        </div>
      </div>
    `).join('');
  }

  renderActiveRoomStage() {
    if (!this.activeRoom) return;
    const r = this.activeRoom;
    const user = window.authManager.currentUser;
    const isOwner = user && r.ownerId === user.id;

    // Header
    const titleEl = document.getElementById('stage-room-name');
    const bioEl = document.getElementById('stage-room-bio');
    const avatarEl = document.getElementById('stage-room-avatar');
    const ownerControlsEl = document.getElementById('stage-owner-controls');
    const lockStatusBadge = document.getElementById('stage-lock-status');

    if (titleEl) titleEl.textContent = r.name;
    if (bioEl) bioEl.textContent = r.bio;
    if (avatarEl) avatarEl.src = r.avatar;

    if (lockStatusBadge) {
      lockStatusBadge.innerHTML = r.isLocked 
        ? '<span class="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold">🔒 مقفلة برمز</span>'
        : '<span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">🔓 روم عامة</span>';
    }

    if (ownerControlsEl) {
      if (isOwner) {
        ownerControlsEl.classList.remove('hidden');
        document.getElementById('btn-owner-lock-toggle').textContent = r.isLocked ? '🔓 إلغاء قفل الروم' : '🔒 قفل الروم برمز';
      } else {
        ownerControlsEl.classList.add('hidden');
      }
    }

    // 8 Speaker Seats Grid
    const seatsContainer = document.getElementById('stage-seats-grid');
    if (seatsContainer) {
      seatsContainer.innerHTML = r.seats.map((seat, index) => {
        if (seat.userId) {
          const isSeatOwner = seat.role === 'owner';
          const isSeatMod = seat.role === 'moderator';
          return `
            <div class="flex flex-col items-center cursor-pointer group" onclick="window.roomsManager.handleSeatClick(${index})">
              <div class="relative speaker-avatar ${seat.isSpeaking ? 'speaking' : ''}">
                <img src="${seat.avatar}" alt="${seat.name}" class="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 ${isSeatOwner ? 'border-amber-400' : isSeatMod ? 'border-purple-400' : 'border-cyan-400'} shadow-lg group-hover:scale-105 transition-all">
                <span class="absolute -top-1 -right-1 text-xs">${isSeatOwner ? '👑' : isSeatMod ? '🛡️' : '🎙️'}</span>
                ${seat.isMuted ? '<span class="absolute -bottom-1 -left-1 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px]">🔇</span>' : ''}
              </div>
              <span class="text-[11px] font-black text-slate-200 mt-1.5 text-center line-clamp-1 max-w-[70px]">${seat.name}</span>
              <span class="text-[9px] ${isSeatOwner ? 'text-amber-400' : isSeatMod ? 'text-purple-400' : 'text-cyan-400'} font-bold">
                ${isSeatOwner ? 'المالك' : isSeatMod ? 'مشرف' : 'متحدث'}
              </span>
            </div>
          `;
        } else {
          return `
            <div class="flex flex-col items-center cursor-pointer group" onclick="window.roomsManager.handleSeatClick(${index})">
              <div class="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-900/90 border-2 border-dashed border-slate-700 flex items-center justify-center group-hover:border-cyan-400 group-hover:bg-cyan-500/10 transition-all shadow-inner">
                <span class="text-xl text-slate-500 group-hover:text-cyan-400 transition-colors">+</span>
              </div>
              <span class="text-[11px] font-semibold text-slate-500 mt-1.5">مقعد ${index + 1}</span>
              <span class="text-[9px] text-slate-600 font-bold">فارغ</span>
            </div>
          `;
        }
      }).join('');
    }

    this.renderRoomMessages();
  }

  renderRoomMessages() {
    const container = document.getElementById('stage-messages-list');
    if (!container || !this.activeRoom) return;

    const user = window.authManager.currentUser;
    container.innerHTML = (this.activeRoom.messages || []).map(m => {
      if (m.isSystem) {
        return `
          <div class="text-center my-2">
            <span class="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-[11px] font-semibold inline-flex items-center gap-1.5">
              <span>⚡</span> ${m.text}
            </span>
          </div>
        `;
      }

      const isMe = user && m.senderId === user.id;
      return `
        <div class="flex items-start gap-2.5 my-2 ${isMe ? 'flex-row-reverse' : ''}">
          <img src="${m.senderAvatar}" class="w-8 h-8 rounded-full object-cover border border-cyan-400/40">
          <div class="max-w-[75%]">
            <div class="text-[10px] text-slate-400 mb-0.5 flex items-center gap-1.5 ${isMe ? 'justify-end' : ''}">
              <span class="font-black text-slate-300">${m.senderName}</span>
              <span>${m.time}</span>
            </div>
            <div class="p-2.5 text-xs text-slate-100 rounded-2xl ${isMe ? 'chat-bubble-user' : 'chat-bubble-other'} leading-relaxed">
              ${m.text}
            </div>
          </div>
        </div>
      `;
    }).join('');

    container.scrollTop = container.scrollHeight;
  }
}

window.roomsManager = new RoomsManager();
