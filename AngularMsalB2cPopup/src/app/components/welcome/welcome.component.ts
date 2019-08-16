import { Component, OnInit } from '@angular/core';
import { AuthSecurityService } from 'src/app/services/auth-service.service';
import { AuthUser } from 'src/app/models/auth-user';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit {
  user: AuthUser = new AuthUser(null);
  constructor(private authSevice: AuthSecurityService) { }

  ngOnInit() {
    this.authSevice.user.subscribe((user) => this.user = user);
  }

  logout() {
     this.authSevice.logout();
  }
}
