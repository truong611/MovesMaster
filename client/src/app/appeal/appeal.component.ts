import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DialogService } from 'primeng/dynamicdialog';
import { PopupPreviewComponent } from '../dashboard/components/popup-preview/popup-preview.component';

@Component({
  selector: 'app-appeal',
  templateUrl: './appeal.component.html',
  styleUrls: ['./appeal.component.css']
})
export class AppealComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
