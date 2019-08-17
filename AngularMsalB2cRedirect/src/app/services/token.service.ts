import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { AuthUser } from '../models/auth-user';

export function tokenGetter() {
  return localStorage.getItem('b2c.todo.access.token');
}

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private LocalStorageKey = 'auth.jwt.access.token';

  constructor(private jwtHelper: JwtHelperService) { }

  public isTokenExpired(): boolean {
    const token = this.getAccessToken();
    // Check whether the token is expired and return
    // true or false
    return this.jwtHelper.isTokenExpired(token);
  }

  public getAccessToken(): string {
    if (localStorage.hasOwnProperty(this.LocalStorageKey)) {
      return localStorage.getItem(this.LocalStorageKey);
    }
    return '';
  }

  public getUser(): AuthUser {
    const tokenData = this.decodeToken();
    const result = new AuthUser(tokenData);
    return result;
  }

  public saveAccessToken(accessToken: string): void {
    localStorage.setItem(this.LocalStorageKey, accessToken);
  }

  public removeAccessToken(): void {
    localStorage.removeItem(this.LocalStorageKey);
  }

  private decodeToken(): any {
    // Attempt to get it from local storage.
    const token: string = this.getAccessToken();

    if (token) {
      const decodedToken: any = this.jwtHelper.decodeToken(token);
      return decodedToken;
    }
  }
}
