import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import * as JSZip from 'jszip';

@Injectable({
  providedIn: 'root'
})
export class ExportFileWordService {

  constructor(
  ) {

  }
  saveFileWord(bodydata, filename) {
    // let url = environment.apiLaravel;
    // var req = new XMLHttpRequest();
    // req.open("POST", url, true);
    // req.setRequestHeader('Content-Type', 'application/json')
    // req.responseType = "blob"
    // req.addEventListener("load", function () {
    //    if (req.status === 200) {
    //      var a = document.createElement('a');
    //      a.href = window.URL.createObjectURL(req.response);
    //      a.download = filename;
    //      a.dispatchEvent(new MouseEvent('click'));
    //    }
    // });
    // req.send(JSON.stringify(bodydata));
  }

  async saveMultiFileWord(bodydatas, filename) {
    // var fileZip = new JSZip()
    // var data = 0
    // for (let bodydata of bodydatas) {
    //   await this.sendDataExport(bodydata).then((res: any) => {
    //     fileZip.file(bodydata.filename, res)
    //   })

    // }
    // return new Promise(function (resolve, reject) {
    //   fileZip.generateAsync({ type: 'base64' }).then(function (base64) {
    //     var a = document.createElement('a');
    //     a.href = 'data:application/zip;base64,' + base64;
    //     a.download = filename;
    //     a.dispatchEvent(new MouseEvent('click'));
    //   }).catch(err => {
    //     console.log(err)
    //     reject({
    //       status: 500,
    //       statusText: err
    //     })
    //   })
    //   resolve({
    //     status: 200,
    //     statusText: 'Tai thanh cong'
    //   })
    // })
  }

  sendDataExport(bodydata: any) {
    // let url = environment.apiLaravel;

    // return new Promise(function (resolve, reject) {
    //   var req = new XMLHttpRequest();
    //   req.open("POST", url, true);
    //   req.setRequestHeader('Content-Type', 'application/json')
    //   req.responseType = "blob"
    //   req.addEventListener("load", async function () {
    //     resolve(req.response);
    //   });

    //   req.send(JSON.stringify(bodydata));
    // })
  }
}
