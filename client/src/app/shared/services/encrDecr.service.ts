import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class EncrDecrService {
  private keys: string = 'secretmykeys2022';

  constructor() { }

  replace(hash: any, mode: boolean) {
    let result = '';

    //Mã hóa
    if (mode) {
      result = hash.replaceAll('+', '--plus--')
        .replaceAll(';', '--cp--')
        .replaceAll('/', '--ch--')
        .replaceAll('?', '--ho--')
        .replaceAll(':', '--hc--')
        .replaceAll('@', '--ac--')
        .replaceAll('&', '--vv--')
        .replaceAll('=', '--bb--')
        .replaceAll('$', '--tt--')
        .replaceAll(',', '--pp--')
    }
    //giải mã
    else {
      result = hash.replaceAll('--plus--', '+')
        .replaceAll('--cp--', ';')
        .replaceAll('--ch--', '/')
        .replaceAll('--ho--', '?')
        .replaceAll('--hc--', ':')
        .replaceAll('--ac--', '@')
        .replaceAll('--vv--', '&')
        .replaceAll('--bb--', '=')
        .replaceAll('--tt--', '$')
        .replaceAll('--pp--', ',')
    }

    return result;
  }

  //The set method is use for encrypt the value.
  set(value) {
    try {
      let key = CryptoJS.enc.Utf8.parse(this.keys);
      let iv = CryptoJS.enc.Utf8.parse(this.keys);
      let encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(value.toString()), key,
        {
          keySize: 128 / 8,
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7
        });

      
      let hash: any = this.replace(encrypted.toString(), true);
      return hash.toString();
    } 
    catch (e) {
      console.log(e)
    }
  }

  //The get method is use for decrypt the value.
  get(value) {
    try {
      value = this.replace(value, false);

      let key = CryptoJS.enc.Utf8.parse(this.keys);
      let iv = CryptoJS.enc.Utf8.parse(this.keys);
      let decrypted = CryptoJS.AES.decrypt(value, key, {
        keySize: 128 / 8,
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });
  
      return decrypted.toString(CryptoJS.enc.Utf8);
    }
    catch (e) {
      console.log(e)
    }
  }
}