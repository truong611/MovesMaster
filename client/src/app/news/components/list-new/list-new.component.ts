import { Component, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { Router } from '@angular/router';

import { MessageService } from 'primeng/api';

import { NewsService } from '../../services/news.service';
import { EncrDecrService } from '../../../shared/services/encrDecr.service';

@Component({
  selector: 'app-list-new',
  templateUrl: './list-new.component.html',
  styleUrls: ['./list-new.component.css']
})
export class ListNewComponent implements OnInit {
  loading: boolean = false;
  user = JSON.parse(localStorage.getItem('user'));
  
  colHeader: any = [];
  totalNews: number = 0;
  listAllNews: any;
  listNews: any;
  activeIndex = 0;

  listStatus = []

  globalFilter: string = null;
  selectedStatus: any = null;
  @ViewChild('myTable') myTable: Table;

  constructor(
    private messageService: MessageService,
    private newsService: NewsService,
    private router: Router,
    private encrDecrService: EncrDecrService
  ) { }

  ngOnInit(): void {
    this.colHeader = [
      { field: 'News_Icon_Image', header: '', textAlign: 'left', display: 'table-cell', colWith: '8vw' },
      { field: 'Is_Manual_Text', header: 'A/M', textAlign: 'center', display: 'table-cell', colWith: '8vw' },
      { field: 'News_Status_Name', header: 'Status', textAlign: 'left', display: 'table-cell', colWith: '10vw' },
      { field: 'Charity_Name', header: 'Charity', textAlign: 'left', display: 'table-cell', colWith: '15vw' },
      { field: 'Appeal_Name', header: 'Appeal', textAlign: 'left', display: 'table-cell', colWith: '15vw' },
      { field: 'Company_Name', header: 'Company', textAlign: 'left', display: 'table-cell', colWith: '15vw' },
      { field: 'Campaign_Name', header: 'Campaign', textAlign: 'left', display: 'table-cell', colWith: '15vw' },
      { field: 'News_Title', header: 'Title', textAlign: 'left', display: 'table-cell', colWith: '12vw' },
      { field: 'News_Publish_Date', header: 'Published', textAlign: 'left', display: 'table-cell', colWith: '12vw' },
      { field: 'CreateBy', header: 'By', textAlign: 'left', display: 'table-cell', colWith: '10vw' }
    ]

    this.getListNews();

  }

  async getListNews() {
    try {
      this.loading = true;
      let { data, loading }: any = await this.newsService.getListNews();
      this.loading = loading;

      if (data.getListNews.messageCode == 200) {
        this.listStatus = data.getListNews.listStatus;
        this.totalNews = data.getListNews.listNews.all.length;
        this.listAllNews = data.getListNews.listNews.all.map((item) =>
          Object.assign({
            Is_Manual_Text: item.Is_Manual ? 'M' : 'A',
            News_Icon_Image: item.News_Image ? item.News_Image : '/assets/img/Default Image.png'
          }, item)
        );

        this.listNews = this.listAllNews;
      }
      else {
        this.showMessage('error', data.getListNews.message);
      }
    }
    catch (e) {
      this.loading = false;
      this.showMessage('error', e);
    }
  }

  search() {
    let listStatus = this.selectedStatus?.map(x => parseInt(x));
    let keySearch = this.globalFilter?.trim().toUpperCase();

    this.listNews = this.listAllNews;

    if (keySearch != null) {
      this.listNews = this.listNews.filter(x => keySearch != null 
        && (x.News_Title.toUpperCase().includes(keySearch) || 
        (x.Charity_Name && x.Charity_Name.toUpperCase().includes(keySearch)) || 
        (x.Company_Name && x.Company_Name.toUpperCase().includes(keySearch)) ||
        (x.Appeal_Name && x.Appeal_Name.toUpperCase().includes(keySearch)) ||
        (x.Campaign_Name && x.Campaign_Name.toUpperCase().includes(keySearch)) ||
        (x.CreateBy && x.CreateBy.toUpperCase().includes(keySearch))
        ));
    }

    if(this.selectedStatus) {
      this.listNews = this.listNews.filter(x => listStatus.includes(x.News_Status_ID));
    }
    
  }

  refresh() {
    this.globalFilter = null;
    this.selectedStatus = null;
    this.getListNews();
  }

  createNews() {
    let user = JSON.parse(localStorage.getItem('user'));
    if (user?.Is_Remove_Privileges) {
      this.showMessage('error', 'This action is not available while your privileges have been removed. Please contact Moves Matter Admin');
      return;
    }
    
    this.router.navigate(['/news/create-new']);
  }

  goToDetail(Id) {
    this.router.navigate(['/news/detail-new', { id: this.encrDecrService.set(Id) }])
  }

  showMessage(severity: string, detail: string) {
    let msg = { severity: severity, summary: 'Notification:', detail: detail, sticky:false };
    if(severity == 'error') {
      msg.sticky = true;
    }
    this.messageService.add(msg);
  }

}
