import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';

import { MessageService } from 'primeng/api';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit {
  loading: boolean = false;
  user = JSON.parse(localStorage.getItem('user'));
  
  @Input() type: number;
  @Input() objectId: number;
  @Input() isMyCharity: boolean;
  @Input() isMyCompany: boolean;

  Role: string;
  User_Id: string;
  User_Name: string;
  User_Email: string;

  constructor(
    private dashboardService: DashboardService,
    private messageService: MessageService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.getDashboardAccountInfo();
  }

  /* Nếu Input có thay đổi */
  ngOnChanges(changes: SimpleChanges) {
    if (!changes.objectId.firstChange) this.getDashboardAccountInfo();
  }

  async getDashboardAccountInfo() {
    try {
      this.loading = true;
      let { data, loading }: any = await this.dashboardService.getDashboardAccountInfo(this.type, this.objectId);
      this.loading = loading;

      if (data.getDashboardAccountInfo.messageCode == 200) {
        this.Role = data.getDashboardAccountInfo.Role;
        this.User_Id = data.getDashboardAccountInfo.User_Id;
        this.User_Name = data.getDashboardAccountInfo.Forename + ' ' + data.getDashboardAccountInfo.Surname;
        this.User_Email = data.getDashboardAccountInfo.User_Email;
      }
      else {
        this.showMessage('error', data.getDashboardAccountInfo.message);
      }
    }
    catch (e) {
      this.loading = false;
      this.showMessage('error', e);
    }
  }

  viewDetail() {
    this.router.navigate(['/user']);
  }

  showMessage(severity: string, detail: string) {
    let msg = { severity: severity, summary: 'Notification:', detail: detail, sticky:false };
    if(severity == 'error') {
      msg.sticky = true;
    }
    this.messageService.add(msg);
  }

}
