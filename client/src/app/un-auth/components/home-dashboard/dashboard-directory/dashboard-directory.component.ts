import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard-directory',
  templateUrl: './dashboard-directory.component.html',
  styleUrls: ['./dashboard-directory.component.css']
})
export class DashboardDirectoryComponent implements OnInit {
  constructor(
    private router: Router,
  ) { }

  ngOnInit(): void {
  }

  goToDirectory() {
    this.router.navigate(['/home'])
  }


}
