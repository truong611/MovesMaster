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

  openLink() {
    if(this.appeal?.Appeal_URL) {
      window.open(this.appeal?.Appeal_URL, '_blank').focus();
    }
  }

}
