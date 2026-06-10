// Custom MongoDB-backed authentication and Firebase client compatibility layer

class MongoDBAuth {
  private listeners: ((user: any) => void)[] = [];
  public currentUser: any = null;

  constructor() {
    this.loadUser();
  }

  private loadUser() {
    const saved = localStorage.getItem('gao_auth_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.email) {
          this.currentUser = this.wrapUserObject(parsed);
        }
      } catch (e) {
        this.currentUser = null;
      }
    }
    
    // Automatically seed a default admin session if MongoDB is active and no session exists
    if (!this.currentUser) {
      const defaultUser = {
        uid: 'sigmund_ts_boot',
        email: 'sigmund.t.d@gaostaff.com',
        displayName: 'sigmund.t.d'
      };
      this.currentUser = this.wrapUserObject(defaultUser);
      localStorage.setItem('gao_auth_user', JSON.stringify(defaultUser));
    }
  }

  private wrapUserObject(rawUser: any) {
    if (!rawUser) return null;
    return {
      ...rawUser,
      getIdTokenResult: async (forceRefresh?: boolean) => {
        // Find role from settings inside local storage or default to admin for bootstrapped user
        let role = 'operator';
        if (rawUser.email && rawUser.email.toLowerCase() === 'sigmund.t.d@gaostaff.com') {
          role = 'admin';
        } else {
          try {
            // Check custom role stored in database for uid
            const response = await fetch(`/api/mongodb/settings/user_role_${rawUser.uid}`);
            if (response.ok) {
              const resJson = await response.json();
              if (resJson && resJson.doc && resJson.doc.role) {
                role = resJson.doc.role;
              }
            }
          } catch (e) {
            console.warn('Could not load claim role from MongoDB backend, using default operator:', e);
          }
        }
        return {
          claims: {
            role: role
          }
        };
      },
      getIdToken: async () => 'mock-mongodb-token'
    };
  }

  onAuthStateChanged(callback: (user: any) => void) {
    this.listeners.push(callback);
    // Silent delay to prevent hydration flashes or race-conditions
    setTimeout(() => {
      callback(this.currentUser);
    }, 50);

    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  async signInWithEmailAndPassword(email: string, password: string) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Authentication credentials rejected.');
    }
    const data = await res.json();
    this.currentUser = this.wrapUserObject(data.user);
    localStorage.setItem('gao_auth_user', JSON.stringify(data.user));
    this.listeners.forEach(l => l(this.currentUser));
    return { user: this.currentUser };
  }

  async createUserWithEmailAndPassword(email: string, password: string) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Registration failed.');
    }
    const data = await res.json();
    this.currentUser = this.wrapUserObject(data.user);
    localStorage.setItem('gao_auth_user', JSON.stringify(data.user));
    this.listeners.forEach(l => l(this.currentUser));
    return { user: this.currentUser };
  }

  async signOut() {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    this.currentUser = null;
    localStorage.removeItem('gao_auth_user');
    this.listeners.forEach(l => l(null));
  }
}

export const auth = new MongoDBAuth();
export const db = {}; // keeps reference for type compatibility
export const storage = {
  ref: () => ({
    put: async () => ({ ref: { getDownloadURL: async () => "" } })
  })
};

// Also export equivalents of firebase/auth functions
export function signInWithEmailAndPassword(authInstance: any, email: string, password: string) {
  return authInstance.signInWithEmailAndPassword(email, password);
}

export function createUserWithEmailAndPassword(authInstance: any, email: string, password: string) {
  return authInstance.createUserWithEmailAndPassword(email, password);
}

export function signOut(authInstance: any) {
  return authInstance.signOut();
}
