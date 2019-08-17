import { Component, OnInit } from '@angular/core';
import { AuthUser } from 'src/app/models/auth-user';
import { AuthSecurityService } from 'src/app/services/auth-service.service';

@Component({
  selector: 'app-simpsons',
  templateUrl: './simpsons.component.html',
  styleUrls: ['./simpsons.component.css']
})
export class SimpsonsComponent implements OnInit {
  user: AuthUser = new AuthUser(null);

  constructor(private authSevice: AuthSecurityService) {
  }

  ngOnInit() {
    this.authSevice.user.subscribe((user) => this.user = user);
  }

  logout() {
    this.authSevice.logout();
  }

}
