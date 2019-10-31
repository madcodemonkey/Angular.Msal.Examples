import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { AuthUser } from 'src/app/models/auth-user';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit {
  user: AuthUser = new AuthUser(null);
  constructor(private authSevice: AuthService) { }

  ngOnInit() {
    this.user = this.authSevice.getUser();
  }

  logout() {
    this.authSevice.logout();
  }

  logUserInfo() {
    console.log(this.user);
  }
}
