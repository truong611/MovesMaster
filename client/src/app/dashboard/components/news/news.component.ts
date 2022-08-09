import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';

import { MessageService } from 'primeng/api';
import { DashboardService } from '../../services/dashboard.service';
import { EncrDecrService } from '../../../shared/services/encrDecr.service';

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.css']
})
export class NewsComponent implements OnInit {
  loading: boolean = false;
  user = JSON.parse(localStorage.getItem('user'));

  @Input() type: number;
  @Input() objectId: number;
  @Input() isMyCharity: boolean;
  @Input() isMyCompany: boolean;

  listNew: any = [];

  constructor(
    private dashboardService: DashboardService,
    private messageService: MessageService,
    private router: Router,
    private encrDecrService: EncrDecrService
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

  goToDetail(Id) {
    if(this.isMyCharity || this.isMyCompany || (this.user?.IsAdmin && !this.objectId)) {
      this.router.navigate(['/news/detail-new', { id: this.encrDecrService.set(Id) }])
    }
    
  }

  goToListNew() {
    this.router.navigate(['/news/list-new']);
  }

  showMessage(severity: string, detail: string) {
    let msg = { severity: severity, summary: 'Notification:', detail: detail, sticky:false };
    if(severity == 'error') {
      msg.sticky = true;
    }
    this.messageService.add(msg);
  }

}
