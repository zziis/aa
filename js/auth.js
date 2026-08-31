/**
 * ⚡ Authentication & Profile Management System
 * Handles Sign Up (Name, Email, Phone, Password, Mandatory ID),
 * Login via Email OR ID + Password, and Profile View/Edit.
 */

class AuthManager {
  constructor() {
    this.currentUser = null;
    this.users = window.supabaseService.getLocal('users', []);
    this.initDemoUserIfEmpty();
    this.loadSession();
  }

  // Generate unique high-tech ID e.g., 'ID-84920'
  generateUniqueId() {
    let newId = '';
    let exists = true;
    while (exists) {
      const rand = Math.floor(10000 + Math.random() * 90000);
      newId = 'ID-' + rand;
      exists = this.users.some(u => u.customId === newId);
    }
    return newId;
  }

  initDemoUserIfEmpty() {
    if (this.users.length === 0) {
      const demoUser = {
        id: 'user-demo-1',
        customId: 'ID-77291',
        name: 'قائد الزلزال التكنولوجي',
        email: 'user@zelzal.net',
        phone: '+9647801234567',
        password: 'password123',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        points: 1250,
        energy: 100,
        countersOwned: [],
        butterflyLastClaim: null,
        butterflySpinActiveUntil: null,
        roomsOwned: [],
        createdAt: new Date().toISOString()
      };
      this.users.push(demoUser);
      this.saveUsers();
    }
  }

  saveUsers() {
    window.supabaseService.setLocal('users', this.users);
  }

  loadSession() {
    const savedUserId = localStorage.getItem('zelzal_session_user_id');
    if (savedUserId) {
      this.currentUser = this.users.find(u => u.id === savedUserId || u.customId === savedUserId) || null;
    }
    if (!this.currentUser && this.users.length > 0) {
      this.currentUser = this.users[0];
      localStorage.setItem('zelzal_session_user_id', this.currentUser.id);
    }
  }

  // Register New User
  register({ name, email, phone, password, confirmPassword, customId, avatar }) {
    if (!name || !email || !password || !customId) {
      throw new Error('يرجى ملء جميع الحقول المطلوبة بما فيها الـ ID الإجباري');
    }

    if (password !== confirmPassword) {
      throw new Error('كلمتا المرور غير متطابقتين!');
    }

    if (password.length < 4) {
      throw new Error('كلمة المرور يجب أن تتكون من 4 أحرف أو أرقام على الأقل');
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanId = customId.trim();

    // Check uniqueness of Email and ID
    if (this.users.some(u => u.email.toLowerCase() === cleanEmail)) {
      throw new Error('البريد الإلكتروني مستخدم بالفعل بحساب آخر');
    }

    if (this.users.some(u => u.customId.toLowerCase() === cleanId.toLowerCase())) {
      throw new Error('معرف الحساب (ID) مستخدم بالفعل، يرجى اختيار ID آخر');
    }

    const newUser = {
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      customId: cleanId,
      name: name.trim(),
      email: cleanEmail,
      phone: phone ? phone.trim() : '+9647700000000',
      password: password,
      avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      points: 750, // Welcome gift points
      energy: 100,
      countersOwned: [],
      butterflyLastClaim: null,
      butterflySpinActiveUntil: null,
      roomsOwned: [],
      createdAt: new Date().toISOString()
    };

    this.users.push(newUser);
    this.saveUsers();
    this.currentUser = newUser;
    localStorage.setItem('zelzal_session_user_id', newUser.id);

    // Sync to Supabase if client active
    if (window.supabaseService.isConfigured && window.supabaseService.client) {
      window.supabaseService.client.from('users').insert([{
        id: newUser.id,
        custom_id: newUser.customId,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        points: newUser.points,
        avatar: newUser.avatar
      }]).then(res => console.log('Supabase user synced', res));
    }

    return newUser;
  }

  // Login via Email OR ID + Password
  login({ identifier, password }) {
    if (!identifier || !password) {
      throw new Error('يرجى إدخال البريد الإلكتروني أو الـ ID مع كلمة المرور');
    }

    const cleanIdent = identifier.trim().toLowerCase();
    const user = this.users.find(u => 
      (u.email.toLowerCase() === cleanIdent || u.customId.toLowerCase() === cleanIdent) && 
      u.password === password
    );

    if (!user) {
      throw new Error('بيانات الدخول غير صحيحة! تأكد من الـ ID أو البريد وكلمة المرور');
    }

    this.currentUser = user;
    localStorage.setItem('zelzal_session_user_id', user.id);
    return user;
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem('zelzal_session_user_id');
  }

  // Update Profile
  updateProfile({ name, email, phone, password, avatar }) {
    if (!this.currentUser) throw new Error('لا يوجد مستخدم مسجل حالياً');

    if (name) this.currentUser.name = name.trim();
    if (phone) this.currentUser.phone = phone.trim();
    if (avatar) this.currentUser.avatar = avatar.trim();

    if (email && email.trim().toLowerCase() !== this.currentUser.email.toLowerCase()) {
      const cleanEmail = email.trim().toLowerCase();
      if (this.users.some(u => u.id !== this.currentUser.id && u.email.toLowerCase() === cleanEmail)) {
        throw new Error('البريد الإلكتروني الجديد مستخدم بالفعل');
      }
      this.currentUser.email = cleanEmail;
    }

    if (password && password.trim().length >= 4) {
      this.currentUser.password = password.trim();
    }

    // Save to users array
    const idx = this.users.findIndex(u => u.id === this.currentUser.id);
    if (idx !== -1) {
      this.users[idx] = { ...this.currentUser };
    }
    this.saveUsers();

    // Supabase update if online
    if (window.supabaseService.isConfigured && window.supabaseService.client) {
      window.supabaseService.client.from('users').update({
        name: this.currentUser.name,
        email: this.currentUser.email,
        phone: this.currentUser.phone,
        avatar: this.currentUser.avatar
      }).eq('id', this.currentUser.id);
    }

    return this.currentUser;
  }

  // Points modification helper
  modifyPoints(delta, reason = 'نظام') {
    if (!this.currentUser) return false;
    const newTotal = (this.currentUser.points || 0) + delta;
    if (newTotal < 0) return false;

    this.currentUser.points = newTotal;
    const idx = this.users.findIndex(u => u.id === this.currentUser.id);
    if (idx !== -1) {
      this.users[idx].points = newTotal;
    }
    this.saveUsers();

    // Log transaction
    const transactions = window.supabaseService.getLocal('transactions', []);
    transactions.unshift({
      id: 'tx_' + Date.now(),
      userId: this.currentUser.id,
      delta,
      reason,
      totalAfter: newTotal,
      createdAt: new Date().toISOString()
    });
    window.supabaseService.setLocal('transactions', transactions.slice(0, 50));

    // Notify UI
    if (window.zelzalApp) {
      window.zelzalApp.updateWalletDisplay();
    }
    return true;
  }
}

window.authManager = new AuthManager();
