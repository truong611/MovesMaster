import { Component, OnInit, Input } from '@angular/core';
import { EncrDecrService } from '../../../shared/services/encrDecr.service';

@Component({
  selector: 'app-preview-new',
  templateUrl: './preview-new.component.html',
  styleUrls: ['./preview-new.component.css']
})
export class PreviewNewComponent implements OnInit {
  @Input() news: any = null;
  countImage: number = 1;

  constructor(
    private encrDecrService: EncrDecrService
  ) { }

  ngOnInit(): void { 
    if(this.news?.Moves_Company_ID) {
      this.countImage++;
    }
    if(this.news?.Appeal_ID) {
      this.countImage++;
    }
    if(this.news?.Campaign_ID) {
      this.countImage++;
    }
  }

  openLink(type) {
    let url;
    switch (type) {
      case 1:
        url = this.news.News_Url;
        break;
      case 2:
        url = this.news.Company_URL;
        break;
      case 3:
        url = this.news.Appeal_URL;
        break;
      case 4:
        url = this.news.Campaign_URL;
        break;
    }
    if (url) {
      window.open(url, '_blank').focus();
    }
  }

}
