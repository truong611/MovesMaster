import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { EncrDecrService } from '../../../shared/services/encrDecr.service';

@Component({
  selector: 'app-preview-campaign',
  templateUrl: './preview-campaign.component.html',
  styleUrls: ['./preview-campaign.component.css']
})
export class PreviewCampaignComponent implements OnInit {
  @Input() campaign: any = null;
  countImage: number = 0;

  constructor(
    private encrDecrService: EncrDecrService
  ) { }

  ngOnInit(): void {
    console.log(this.campaign)
  }

  /* Nếu Input có thay đổi */
  ngOnChanges(changes: SimpleChanges) {
    if (changes?.campaign) {
      this.countImage = 0;
      if (this.campaign?.Charity_icon) {
        this.countImage++;
      }
      if (this.campaign?.Company_Icon) {
        this.countImage++;
      }
      if (this.campaign?.Appeal_Icon) {
        this.countImage++;
      }
      if (this.campaign?.Campaign_Icon) {
        this.countImage++;
      }
      console.log(this.countImage)
    }
  }

  openLink(type) {
    let url;
    switch (type) {
      case 1:
        url = this.campaign.Charity_URL;
        break;
      case 2:
        url = this.campaign.Company_URL;
        break;
      case 3:
        url = this.campaign.Appeal_URL;
        break;
      case 4:
        url = this.campaign.Campaign_URL;
        break;
    }
    if (url) {
      window.open(url, '_blank').focus();
    }
  }
}
