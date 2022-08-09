import { Component, OnInit, HostListener, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent {

  constructor(
    // @Inject(DOCUMENT) private document: Document
  ) {
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
      if (document.getElementById('menu2') !== null) document.getElementById('menu2').classList.add('header-content-menu');
    } else {
      if (document.getElementById('menu2') !== null) document.getElementById('menu2').classList.remove('header-content-menu');
    }
  }

}
