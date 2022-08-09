import {Component, Input, OnInit, OnChanges, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit, OnChanges {
  @Input() data: any;
  @Output() deleteEvent = new EventEmitter<string>();
  @Output() updateEvent = new EventEmitter<string>();
  @Input() settings: any = new Array<any>();
  dataTable: any;
  perPage: number = 5;
  page: number = 1;
  Math = Math;

  constructor() {
  }

  ngOnInit(): void {
  }

  ngOnChanges() {
    this.refreshTable();
  }

  update(item) {
    this.updateEvent.emit(item)
  }

  delete(item) {
    this.deleteEvent.emit(item?.Id)
  }

  nextPage(boolean) {
    if (boolean) {
      this.page = this.page + 1;
    } else {
      this.page = this.page - 1;
    }
    this.refreshTable();
  }

  changePage() {
    if (this.page < 1) {
      this.page = 1
    } else if (this.page > Math.ceil(this.data.length / this.perPage)) {
      this.page = Math.ceil(this.data.length / this.perPage)
    } else {
    }
    this.refreshTable();
  }

  changePer(event) {
    this.perPage = event.target.value;
    this.page = 1;
    this.refreshTable();
  }

  refreshTable() {
    this.dataTable = this.data.slice((this.page - 1) * this.perPage, this.page * this.perPage);
  }

}
