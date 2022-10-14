import { Component, ElementRef, OnInit, ViewChild, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { NewsService } from '../../../news/services/news.service';
import { EncrDecrService } from '../../../shared/services/encrDecr.service';

@Component({
  selector: 'app-news-template',
  templateUrl: './news-template.component.html',
  styleUrls: ['./news-template.component.css']
})
export class NewsTemplateComponent implements OnInit {
  id: number = null;

  loading: boolean = false;
  news = null;
  listAppeal: any = [];
  listCompany: any = [];
  listAllCampaign: any = [];
  listCampaign: any = [];

  @ViewChild('currentLogo') currentLogo: ElementRef;
  currentLogoUrl: any = '/assets/img/Default Image.png';

  constructor(
    private route: ActivatedRoute,
    private domSanitizer: DomSanitizer,
    private newsService: NewsService,
    private encrDecrService: EncrDecrService
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.id = Number(this.encrDecrService.get(params['id']));
      
    });
    this.getDetailNews();
  }

  async getDetailNews() {
    this.loading = true;
    let { data, loading }: any = await this.newsService.getDetailNews(this.id);
    this.loading = loading;

    if (data.getDetailNews.messageCode != 200) {
      return;
    }

    this.news = data.getDetailNews.News;

    if (this.news.News_Image) {
      this.currentLogoUrl = this.news.News_Image;
    }

    this.listCompany = data.getDetailNews.ListCompany.map((item) =>
      Object.assign({
        Company_Text: item.Company_Number + ' - ' + item.Company_Name
      }, item)
    );
    this.listAppeal = data.getDetailNews.ListAppeal;
    this.listAllCampaign = data.getDetailNews.ListCampaign;

    if (this.news.Appeal_ID) {
      this.listCampaign = this.listAllCampaign.filter(x => x.Appeal_ID == this.news.Appeal_ID);
    } else {
      this.listCampaign = this.listAllCampaign.filter(x => !x.Appeal_ID);
    }
  }

  transform(url) {
    return this.domSanitizer.bypassSecurityTrustResourceUrl(url);
  }

  goToLink() {
    if(this.news.News_Url) {
      window.open(this.news.News_Url, '_blank').focus();
    }
  }

}
