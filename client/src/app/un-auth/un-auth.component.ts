import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-un-auth',
  templateUrl: './un-auth.component.html',
  styleUrls: ['./un-auth.component.css']
})
export class UnAuthComponent implements OnInit {
  checkHome: boolean = false;
  constructor() { }

  ngOnInit(): void {
    let dashboard = JSON.parse(sessionStorage.getItem('dashboard'));
    this.checkHome = dashboard ? false : true;
  }

}
