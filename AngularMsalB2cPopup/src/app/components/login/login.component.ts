import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { AuthRedirectService } from 'src/app/core/services/auth-redirect.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(private authService: AuthService, private redirectService: AuthRedirectService) { }

  ngOnInit() {
    if (this.authService.hasTokenExpired()) {
      this.authService.login();
    } else {
      // If this is the origin/start page, you will be stuck here if
      // we don't navigate you away from the page.  In other words, msal.js thinks the
      // login page is where you started from so it routed you back to here.
      this.redirectService.navigateToSavedRoute();
    }
  }
}
