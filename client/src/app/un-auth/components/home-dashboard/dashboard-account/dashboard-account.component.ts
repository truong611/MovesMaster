import { Component, OnInit, Input, SimpleChanges } from '@angular/core';

import { MessageService } from 'primeng/api';
import { DashboardService } from './../../../../dashboard/services/dashboard.service';

@Component({
  selector: 'app-dashboard-account',
  templateUrl: './dashboard-account.component.html',
  styleUrls: ['./dashboard-account.component.css']
})
export class DashboardAccountComponent implements OnInit {
  loading: boolean = false;
  user = JSON.parse(localStorage.getItem('user'));
  
  @Input() type: number;
  @Input() objectId: number;

  Role: string;
  User_Id: string;
  User_Name: string;
  User_Email: string;

  constructor(
    private dashboardService: DashboardService,
    private messageService: MessageService,
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

  showMessage(severity: string, detail: string) {
    let msg = { severity: severity, summary: 'Notification:', detail: detail, sticky:false };
    if(severity == 'error') {
      msg.sticky = true;
    }
    this.messageService.add(msg);
  }

}
