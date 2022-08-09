import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class FormatDateService {

  constructor() { }

  convertToUTCTime(time: Date) {
    if (time)
      return new Date(
        Date.UTC(
          time.getFullYear(), 
          time.getMonth(), 
          time.getDate(), 
          time.getHours(), 
          time.getMinutes(), 
          time.getSeconds()
        )
      );
    else 
      return null;
  }

}
