import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';

import { IntroduceCompanyComponent } from '../introduce-company/introduce-company.component';

@Component({
  selector: 'app-directory',
  templateUrl: './directory.component.html',
  styleUrls: ['./directory.component.css']
})
export class DirectoryComponent implements OnInit {
  @Input() isMyCharity: boolean;
  @Input() charity: any;
  @Input() permissionActive: boolean;

  constructor(
    private router: Router,
    private messageService: MessageService,
    private dialogService: DialogService,
  ) { }

  ngOnInit(): void {
  }

  goToDirectory() {
    let user = JSON.parse(localStorage.getItem('user'));
    if (user?.Is_Remove_Privileges) {
      this.messageService.add({ severity: 'error', summary: 'Notification:', detail: 'This action is not available while your privileges have been removed. Please contact Moves Matter Admin', sticky: true});
      return;
    }

    this.router.navigate(['/directory'])
  }

  introduce() {
    if (!this.permissionActive) {
      this.messageService.add({ severity: 'error', summary: 'Notification:', detail: 'You do not have permission to Introduce Company', sticky: true});
      return;
    }

    let ref = this.dialogService.open(IntroduceCompanyComponent, {
      data: {

      },
      header: '',
      width: '500px',
      styleClass: 'custom-dialog',
      baseZIndex: 1030,
      contentStyle: {
        "min-height": "280px",
        "max-height": "100%",
        "overflow": "auto"
      }
    });
    ref.onClose.subscribe(async (result: any) => {

    });
  }

}
