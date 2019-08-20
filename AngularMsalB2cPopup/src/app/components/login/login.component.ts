import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
    this.authService.user.subscribe((user) => {
      if (user.email) { this.router.navigate(['/welcome']);
    }});

    if (this.authService.isAuthenticated() === false) {
      this.authService.login();
    }
  }
}
