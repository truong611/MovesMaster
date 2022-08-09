import { Component, OnInit, Input } from '@angular/core';

import { MessageService } from 'primeng/api';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-popup-preview',
  templateUrl: './popup-preview.component.html',
  styleUrls: ['./popup-preview.component.css']
})
export class PopupPreviewComponent implements OnInit {
  loading: boolean = false;

  @Input() type: number;
  @Input() formData: any;
  @Input() icon: any;

  @Input() totalAppeal: number;
  @Input() totalCampaign: number;
  @Input() totalDonation: number;

  constructor(
    private dashboardService: DashboardService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
  }

  openLink() {
    let url = (this.type == 1) ? this.formData?.Charity_URL : this.formData?.Company_URL;
    if(url) {
      window.open(url, '_blank').focus();
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
