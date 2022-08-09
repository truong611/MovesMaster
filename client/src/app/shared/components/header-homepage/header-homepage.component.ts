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
  constructor(
    public router: Router,
    private authService: AuthenticationService,
  ) { }

  ngOnInit(): void {
    
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
    this.router.navigate(['/dashboard']);
    sessionStorage.setItem('dashboard', 'true');
  }

}
