import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.css']
})
export class LogoutComponent implements OnInit {
  errorMessage: string;
  constructor(private authService: AuthService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    if (this.authService.hasTokenExpired() === false) {
      this.authService.logout();
    }

    this.route.queryParams.subscribe(params => {
      console.log(params);
      this.errorMessage = params['errorMessage'];
    });
  }

  loginClick() {
    this.router.navigate(['/login']);
  }

}
