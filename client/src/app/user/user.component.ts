import { Component, OnInit } from '@angular/core';

import { PermissionService } from './../shared/services/permission.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  data: any;
  permissionTypeCode = 'CMU';
  permissionActive: boolean;

  constructor(
    private permissionService: PermissionService,
  ) { }

  ngOnInit(): void {

    this.getUserPermission();
  }

  handleResults(searchObj) {
    this.data = searchObj
  }

  async getUserPermission() {
    let { data }: any = await this.permissionService.getUserPermission();

    if (data.getUserPermission.messageCode == 200) {
      let list_permission = data.getUserPermission.List_Permission;
      let user_permission = list_permission.find(x => x.Permission_Type_Code == this.permissionTypeCode);
      this.permissionActive = user_permission?.Is_Active ?? false;
    }
  }

}
