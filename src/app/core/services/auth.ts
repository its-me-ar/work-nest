import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class Auth {
  private loggedIn = false;

  isLoggedIn(): boolean {
    return this.loggedIn;
  }

  login() {
    this.loggedIn = true;
  }

  logout() {
    this.loggedIn = false;
  }
}
