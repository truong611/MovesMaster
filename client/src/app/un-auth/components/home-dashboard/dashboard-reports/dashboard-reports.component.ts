import { Component, OnInit, Input, SimpleChanges } from '@angular/core';

import { MessageService } from 'primeng/api';
import { DashboardService } from './../../../../dashboard/services/dashboard.service';

@Component({
  selector: 'app-dashboard-reports',
  templateUrl: './dashboard-reports.component.html',
  styleUrls: ['./dashboard-reports.component.css']
})
export class DashboardReportsComponent implements OnInit {
  loading: boolean = false;

  @Input() type: number;
  @Input() objectId: number;

  totalAppeal: number;
  totalCampaign: number;
  totalDonation: number;

  constructor(
    private dashboardService: DashboardService,
    private messageService: MessageService,
  ) { }

  ngOnInit(): void {
    this.getDashboardReport();
  }

  /* Nếu Input có thay đổi */
  ngOnChanges(changes: SimpleChanges) {
    if (changes?.objectId) {
      if (!changes.objectId.firstChange) this.getDashboardReport();
    }
  }

  async getDashboardReport() {
    try {
      this.loading = true;
      let { data, loading }: any = await this.dashboardService.getDashboardReport(this.type, this.objectId);
      this.loading = loading;

      if (data.getDashboardReport.messageCode == 200) {
        this.totalAppeal = data.getDashboardReport.TotalAppeal;
        this.totalCampaign = data.getDashboardReport.TotalCampaign;
        this.totalDonation = data.getDashboardReport.TotalDonation;
      }
      else {
        this.showMessage('error', data.getDashboardReport.message);
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
