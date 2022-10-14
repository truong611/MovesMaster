import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthenticationService } from "../../../auth/services/authentication.service";

@Component({
  selector: 'app-header-homepage',
  templateUrl: './header-homepage.component.html',
  styleUrls: ['./header-homepage.component.css']
})
export class HeaderHomepageComponent implements OnInit {
  user = JSON.parse(localStorage.getItem('user'));
  iconHeader: any = null;
  constructor(
    public router: Router,
    private authService: AuthenticationService,
  ) { }

  ngOnInit(): void {
    if(this.user?.IsAdmin) {
      this.iconHeader = '/assets/img/logo_text_white.png';
    } else {
      this.iconHeader = this.user?.Charity_icon ? this.user?.Charity_icon : (this.user?.Company_Icon ? this.user?.Company_Icon : '/assets/img/Default Image.png');
    }
    
  }

  login() {
    this.router.navigate(['/login']);
  }

  signup() {
    this.router.navigate(['/sign-up']);
  }

  logout() {
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('dashboard');
    this.authService.logout();
  }

  goToDashboard() {
    if(this.user?.Is_Web_App_User) {
      this.router.navigate(['/dashboard']);
      sessionStorage.setItem('dashboard', 'true');
    }
    
  }

}
