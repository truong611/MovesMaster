import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { MessageService } from 'primeng/api';

import { UserService } from '../../services/user.service';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-list-user',
  templateUrl: './list-user.component.html',
  styleUrls: ['./list-user.component.css']
})
export class ListUserComponent implements OnInit {
  @Output() public found = new EventEmitter<any>();
  loading: boolean = false;

  listUser: any = [];

  number = 0;

  @Input() public permissionActive: boolean;
  constructor(
    private userService: UserService,
    private messageService: MessageService,
    private dataService: DataService
  ) { }

  ngOnInit(): void {
    this.dataService.currentMessage.subscribe(message => 
      this.getListUser()
    );
    this.getListUser();
  }

  async getListUser() {
    try {
      this.loading = true;
      let { data, loading }: any = await this.userService.getListUser();
      this.loading = loading;

      if (data.getListUser.messageCode == 200) {
        this.listUser = data.getListUser.ListUser.map((item) =>
          Object.assign({
            UserName: item.Forename + ' ' + item.Surname
          }, item)
        );
      }
      else {
        this.showMessage('error', data.getListUser.message);
      }
    }
    catch (e) {
      this.loading = false;
      this.showMessage('error', e);
    }
  }

  showMessage(severity: string, detail: string) {
    let msg = { severity: severity, summary: 'Notification:', detail: detail, sticky:false };
    if(severity == 'error') {
      msg.sticky = true;
    }
    this.messageService.add(msg);
  }

  detailUser(User_ID) {
    this.found.emit({ action: "detail", user_ID: User_ID });
  }

  addUser() {
    if(this.permissionActive) {
      this.found.emit({ action: "add", number: this.number++ });
    } else {
      this.showMessage('error', 'You do not have maintain user permissions');
    }  
  }

}
