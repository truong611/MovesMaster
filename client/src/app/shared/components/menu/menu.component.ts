import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
declare var $: any;
import * as AdminLte from 'admin-lte';
import { QueryRef } from 'apollo-angular';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {
  private queryListChucNangManHinh: QueryRef<any>;

  menus = [];
  infoUser: any
  listChucNang = []
  activeDirectory: boolean = false;

  checkHome: boolean = false;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService,
  ) {
    this.infoUser = JSON.parse(localStorage.getItem('user'))
  }

  ngOnInit(): void {
    if (this.router.url == '/directory') {
      this.activeDirectory = true;
    }

    let dashboard = JSON.parse(sessionStorage.getItem('dashboard'));
    this.checkHome = dashboard ? false : true;
  }

  goToHome() {
    sessionStorage.removeItem('dashboard');
    this.router.navigate(['/home'])
      .then(() => {
        window.location.reload();
      });
  }

  checkRemove() {
    if (this.infoUser?.Is_Remove_Privileges) {
      this.messageService.add({ severity: 'error', summary: 'Notification:', detail: 'This action is not available while your privileges have been removed. Please contact Moves Matter Admin', sticky: true });
      return;
    }
    this.router.navigate(['/directory'])
  }

}
