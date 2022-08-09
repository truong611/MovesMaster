import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
})
export class ButtonComponent implements OnInit {

  @Input() value: string;
  @Input() color: string;
  @Input() shapes: string;
  @Input() sizes: string;
  @Input() outline: string;
  @Input() ghost: string;
  @Input() click;
  @Input() disabled: boolean;
  @Input() class: string;
  @Input() type: string;
  @Input() loading: boolean;

  constructor() {
    if (!this.value) {
      this.value = '';
    }
    if (!this.color) {
      this.color = 'primary';
    }
    if (!this.shapes) {
      this.shapes = 'rectangle';
    }
    if (!this.sizes) {
      this.sizes = 'medium';
    }
    if (!this.outline) {
      this.outline = '';
    }
    if (!this.ghost) {
      this.ghost = '';
    }
  }

  ngOnInit() {
  }

}
