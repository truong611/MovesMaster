import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { EncrDecrService } from '../../../shared/services/encrDecr.service';

@Component({
  selector: 'app-preview-new',
  templateUrl: './preview-new.component.html',
  styleUrls: ['./preview-new.component.css']
})
export class PreviewNewComponent implements OnInit {
  @Input() news: any = null;
  countImage: number = 0;

  constructor(
    private encrDecrService: EncrDecrService
  ) { }

  ngOnInit(): void {

  }

  /* Nếu Input có thay đổi */
  ngOnChanges(changes: SimpleChanges) {
    if (changes?.news) {
      this.countImage = 0;
      if (this.news?.Charity_icon) {
        this.countImage++;
      }
      if (this.news?.Company_Icon) {
        this.countImage++;
      }
      if (this.news?.Appeal_Icon) {
        this.countImage++;
      }
      if (this.news?.Campaign_Icon) {
        this.countImage++;
      }
    }
  }

  openLink(type) {
    let url;
    switch (type) {
      case 1:
        url = this.news.Charity_URL;
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
      case 5:
        url = this.news.News_Url;
        break;
    }
    if (url) {
      window.open(url, '_blank').focus();
    }
  }

}
