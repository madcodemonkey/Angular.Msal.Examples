import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private LocalStorageKey = 'auth.jwt.access.token';

  public getAccessToken(): string {
    if (localStorage.hasOwnProperty(this.LocalStorageKey)) {
      return localStorage.getItem(this.LocalStorageKey);
    }
    return '';
  }

  public saveAccessToken(accessToken: string): void {
    localStorage.setItem(this.LocalStorageKey, accessToken);
  }

  public removeAccessToken(): void {
    localStorage.removeItem(this.LocalStorageKey);
  }
}
