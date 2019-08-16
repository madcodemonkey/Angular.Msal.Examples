import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { TokenService } from '../services/token.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private tokenService: TokenService) { }

  canActivate(): boolean {
    if (this.tokenService.isTokenExpired()) {
      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }
}
