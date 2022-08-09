import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FileUpload } from 'primeng/fileupload';

@Injectable({
  providedIn: 'root'
})
export class HandleFileService {

  constructor() { }

  saveFile(base64: string, type: string, fileName: string) {
    let binaryString = atob(base64);
    let fileType = type;
    let binaryLen = binaryString.length;
    let bytes = new Uint8Array(binaryLen);
    for (let idx = 0; idx < binaryLen; idx++) {
      let ascii = binaryString.charCodeAt(idx);
      bytes[idx] = ascii;
    }
    let windowNavigator: any = window.navigator;
    let file = new Blob([bytes], { type: fileType });
    if (windowNavigator && windowNavigator.msSaveOrOpenBlob) {
      windowNavigator.msSaveOrOpenBlob(file);
    } else {
      let fileURL = URL.createObjectURL(file);
      let anchor = document.createElement("a");
      anchor.download = fileName;
      anchor.href = fileURL;
      anchor.click();
    }
  }

  convertFileName(fileUpload: FileUpload): Array<File> {
    let now = new Date();
    let hour = now.getHours();
    let minute = now.getMinutes();
    let second = now.getSeconds();
    let date = now.getDate();
    let month = now.getMonth() + 1;
    let year = now.getFullYear();

    let postfix = '_' + date + month + year + hour + minute + second;

    let files = [];
    for (let file of fileUpload.files) {
      let index = file.name.lastIndexOf('.');
      let fileName = file.name.substring(0, index);
      let fileType = file.name.substring(index + 1);
      let myRenamedFile = new File([file], fileName + postfix + '.' + fileType);
      files.push(myRenamedFile);
    }

    return files;
  }

  convertFileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }

  saveFileStatic(url, fileName) {
    var req = new XMLHttpRequest();
    req.open("GET", url, true);
    req.setRequestHeader('Content-Type', 'application/xml')
    req.responseType = "blob"
    req.addEventListener("load", function () {
      if (req.status === 200) {
        var a = document.createElement('a');
        a.href = window.URL.createObjectURL(req.response);
        a.download = fileName;
        a.dispatchEvent(new MouseEvent('click'));
      }
    });
    req.send();
  }

}
