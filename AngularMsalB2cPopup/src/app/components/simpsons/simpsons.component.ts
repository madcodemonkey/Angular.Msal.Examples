import { Component, OnInit } from '@angular/core';
import { AuthUser } from 'src/app/models/auth-user';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-simpsons',
  templateUrl: './simpsons.component.html',
  styleUrls: ['./simpsons.component.css']
})
export class SimpsonsComponent implements OnInit {
  user: AuthUser = new AuthUser();

  constructor(private authSevice: AuthService) {
  }

  ngOnInit() {
    this.authSevice.user.subscribe((user) => this.user = user);
  }

  logout() {
    this.authSevice.logout();
  }

}
