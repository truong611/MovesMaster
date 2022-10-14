import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ValidaytorsService {

  public regex =
    {
      url: /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/,
      email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
      phone_number: /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\.\/0-9]*$/,
      password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{6,}$/,//ít nhất 6 kí tự, 1 kí tự thường, 1 kí tự hoa, 1 số
      // /^(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,//ít nhất 6 kí tự, 1 kí tự thường, 1 kí tự hoa, 1 kí tự đặc biệt
    }

  constructor() { }

  forbiddenSpaceText(control: FormControl) {
    let text = control.value;
    if (text && text.trim() == "") {
      return {
        forbiddenSpaceText: {
          parsedDomain: text
        }
      }
    }
    return null;
  }

  isValidHttpUrl(control: FormControl) {
    let url = control.value;
    var r = new RegExp(/^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/);

    if (url && !r.test(url)) {
      return {
        invalidUrl: {
          parsedDomain: url
        }
      }
    }
    return null;
  }

  isValidEmail(control: FormControl) {
    let email = control.value;
    var r = new RegExp(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/);

    if (email && !r.test(email)) {
      return {
        invalidEmail: {
          parsedDomain: email
        }
      }
    }
    return null;
  }

  isValidPhoneNumber(control: FormControl) {
    let phone_number = control.value;
    var r = new RegExp(/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\.\/0-9]*$/);

    if (phone_number && !r.test(phone_number)) {
      return {
        invalidPhoneNumber: {
          parsedDomain: phone_number
        }
      }
    }
    return null;
  }

  isValidPassword(control: FormControl) {
    let password = control.value;
    var r = new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{6,}$/);

    if (password && !r.test(password)) {
      return {
        invalidPassword: {
          parsedDomain: password
        }
      }
    }
    return null;
  }
}
