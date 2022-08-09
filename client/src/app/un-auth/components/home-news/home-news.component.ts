import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Router, ActivatedRoute } from '@angular/router';

import { HomeService } from '../../services/home.service';
import { EncrDecrService } from '../../../shared/services/encrDecr.service';

@Component({
  selector: 'app-home-news',
  templateUrl: './home-news.component.html',
  styleUrls: ['./home-news.component.css']
})
export class HomeNewsComponent implements OnInit {
  loading: boolean = false;
  totalRecords: number;
  pageIndex: number = 0;
  perPage: number = 30;

  listAllNews: any = [];
  listNews: any = [];

  listStatus = [];

  globalFilter: string = null;

  constructor(
    private messageService: MessageService,
    private homeService: HomeService,
    private router: Router,
    private encrDecrService: EncrDecrService,
  ) { }

  ngOnInit(): void {
    this.getListNewsForHomePage();
  }

  async getListNewsForHomePage() {
    try {
      this.loading = true;
      let { data, loading }: any = await this.homeService.getListNewsForHomePage(this.pageIndex, this.perPage);
      this.loading = loading;

      if (data.getListNewsForHomePage.messageCode == 200) {
        this.listStatus = data.getListNewsForHomePage.listStatus;
        this.listAllNews = data.getListNewsForHomePage.listNews.map((item) =>
          Object.assign({
            Is_Manual_Text: item.Is_Manual ? 'M' : 'A',
            News_Icon_Image: item.News_Image ? item.News_Image : '/assets/img/Default Image.png'
          }, item)
        );

        this.listNews = this.listAllNews;
        this.totalRecords = data.getListNewsForHomePage.totalRecords;
      }
      else {
        this.showMessage('error', data.getListNewsForHomePage.message);
      }
    }
    catch (e) {
      this.loading = false;
      this.showMessage('error', e);
    }
  }

  searchNews() {
    let textSearch = this.globalFilter?.trim().toUpperCase();
    this.listNews = this.listAllNews;
    if (textSearch != null) {
      this.listNews = this.listAllNews.filter(x => textSearch != null
        && (x.News_Title.toUpperCase().includes(textSearch) ||
          (x.News_Content && x.News_Content.toUpperCase().includes(textSearch))
        ));
    }
  }

  onPageChange(event) {
    this.pageIndex = event.page + 1;
    this.perPage = event.rows;
    this.getListNewsForHomePage();
  }

  goToDetail(Id) {
    this.router.navigate(['/news-template', { id: this.encrDecrService.set(Id) }])
  }

  showMessage(severity: string, detail: string) {
    let msg = { severity: severity, summary: 'Notification:', detail: detail, sticky: false };
    if (severity == 'error') {
      msg.sticky = true;
    }
    this.messageService.add(msg);
  }

}
