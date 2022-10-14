import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-preview-appeal',
  templateUrl: './preview-appeal.component.html',
  styleUrls: ['./preview-appeal.component.css']
})
export class PreviewAppealComponent implements OnInit {

  @Input() appeal: any = null;

  progress = null;

  constructor() { }

  ngOnInit(): void {
    
  }
  
  openLink(type) {
    let url;
    switch (type) {
      case 1:
        url = this.appeal.Charity_URL;
        break;
      case 2:
        url = this.appeal?.Appeal_URL;
        break;
    }
    if(url) {
      window.open(url, '_blank').focus();
    }
  }

}
