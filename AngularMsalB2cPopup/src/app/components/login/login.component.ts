import { Component, OnInit } from '@angular/core';
import { AuthSecurityService } from 'src/app/services/auth-service.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(private authService: AuthSecurityService, private router: Router) { }

  ngOnInit() {
    if (this.authService.isLoginInProgress() === false &&
       this.authService.isAuthenticated() === false) {
      this.authService.login();
    } else {
      this.router.navigate(['/welcome']);
    }
  }
}
