import { Component, OnInit, Input, SimpleChanges } from '@angular/core';

import { MessageService } from 'primeng/api';
import { DashboardService } from './../../../../dashboard/services/dashboard.service';

@Component({
  selector: 'app-dashboard-news',
  templateUrl: './dashboard-news.component.html',
  styleUrls: ['./dashboard-news.component.css']
})
export class DashboardNewsComponent implements OnInit {
  loading: boolean = false;

  @Input() type: number;
  @Input() objectId: number;

  listNew: any = [];

  constructor(
    private dashboardService: DashboardService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.getDashboardNews();
  }

  /* Nếu Input có thay đổi */
  ngOnChanges(changes: SimpleChanges) {
    if (!changes.objectId.firstChange) this.getDashboardNews();
  }

  async getDashboardNews() {
    try {
      this.loading = true;
      let { data, loading }: any = await this.dashboardService.getDashboardNews(this.type, this.objectId);
      this.loading = loading;

      if (data.getDashboardNews.messageCode == 200) {
        this.listNew = data.getDashboardNews.ListNew;
      }
      else {
        this.showMessage('error', data.getDashboardNews.message);
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
