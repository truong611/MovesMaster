import { Component, OnInit, Input } from '@angular/core';
import { EncrDecrService } from '../../../shared/services/encrDecr.service';

@Component({
  selector: 'app-preview-campaign',
  templateUrl: './preview-campaign.component.html',
  styleUrls: ['./preview-campaign.component.css']
})
export class PreviewCampaignComponent implements OnInit {
  @Input() campaign: any = null;

  constructor(
    private encrDecrService: EncrDecrService
  ) { }

  ngOnInit(): void {

  }

  openLink(type) {
    let url;
    switch (type) {
      case 1:
        url = this.campaign.Campaign_URL;
        break;
      case 2:
        url = this.campaign.Charity_Appeal_Url;
        break;
      case 3:
        url = this.campaign.Company_URL;
        break;
    }
    if(url) {
      window.open(url, '_blank').focus();
    }
  }
}
