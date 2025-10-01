import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { User } from '../../models/user.model';
import { UserService } from '../users/user-service';
import { environment } from '../../../../environment/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient, private userService: UserService) {}

  login(email: string, password: string): Observable<User | null> {
    return this.http.get<User[]>(`${this.api}/users`, {
      params: { email, password }
    }).pipe(
      map(users => users[0] || null), // pick first matching user
      tap(user => {
        if (user) this.userService.setUser(user);
      })
    );
  }

  logout() {
    this.userService.clearUser();
  }
}
