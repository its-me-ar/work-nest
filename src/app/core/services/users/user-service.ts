import { Injectable, signal, computed } from '@angular/core';
import { User } from '../../models/user.model';
import { StorageService } from '../storage/storage-service';

@Injectable({ providedIn: 'root' })
export class UserService {
  private _user = signal<User | null>(null);

  user = computed(() => this._user());
  isLoggedIn = computed(() => !!this._user());

  constructor(private storage: StorageService) {
    this.loadUser();
  }

  setUser(user: User) {
    this._user.set(user);
    this.storage.setCookie('user', JSON.stringify(user));
    if (user.token) this.storage.setCookie('token', user.token);
  }

  clearUser() {
    this._user.set(null);
    this.storage.deleteCookie('user');
    this.storage.deleteCookie('token');
  }

  getToken(): string | null {
    return this.storage.getCookie('token');
  }

  private loadUser() {
    const raw = this.storage.getCookie('user');
    if (raw) this._user.set(JSON.parse(raw));
  }
}
