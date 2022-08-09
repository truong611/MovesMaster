const fs = require('fs');
const path = require('path');
const { unlinkSync } = require('fs');
const JSZip = require("jszip");

const handleFile = {
  saveFileBase64: async (dataBase64, folderUrl, filename) => {
    try {
      let fileContents = Buffer.from(dataBase64, 'base64');
      let locaiton = path.join(__dirname, `../upload/${folderUrl}/`, `${filename}`);
      fs.writeFileSync(locaiton, fileContents);
    }
    catch (e) {
      throw new Error(e)
    }
  },
  saveFile: async (files, folderUrl, _fileName = null) => {
    try {
      for (let file of files) {
        let { filename, mimetype, createReadStream } = await file;
        let location = _fileName ? path.join(__dirname, `../upload/${folderUrl}/`, `${_fileName}`) : 
          path.join(__dirname, `../upload/${folderUrl}/`, `${filename}`);
        let myfile = createReadStream();
        await myfile.pipe(fs.createWriteStream(location));
      }
    }
    catch (e) {
      throw new Error(e)
    }
  },
  deleteFile: (listUrl) => {
    try {
      for (let url of listUrl)
        unlinkSync(path.join(__dirname, `../upload/${url}`));
    }
    catch (e) {
      throw new Error(e)
    }
  },
  zipFile: async (paths) => {
    try {
      const zip = new JSZip();
      for (let i = 0; i <= paths.length - 1; i++) {
        // đọc file và thêm file đó vào zip
        const stream = fs.createReadStream(path.join(__dirname, `../upload/${paths[i]}`));
        zip.file(paths[i], stream);
      }
      return await zip.generateAsync({ type: "base64" })
    } catch (e) {
      throw new Error(e)
    }
  },
  downloadFile: (url) => {
    try {
      let extension = url.substring(url.lastIndexOf('.'));
      let type = '';
      switch (extension) {
        case ".zip": type = "application/zip"; break;
        case ".rar": type = "application/x-rar-compressed"; break;
        case ".ppt": type = "application/vnd.ms-powerpoint"; break;
        case ".pptx": type = "application/vnd.openxmlformats-officedocument.presentationml.presentation"; break;
        case ".pdf": type = "application/pdf"; break;
        case ".txt": type = "text/plain"; break;
        case ".jpeg": type = "image/jpeg"; break;
        case ".jpg": type = "image/jpeg"; break;
        case ".tif": type = "image/tiff"; break;
        case ".tiff": type = "image/tiff"; break;
        case ".png": type = "image/png"; break;
        case ".bmp": type = "image/bmp"; break;
        case ".gif": type = "image/gif"; break;
        case ".ico": type = "image/x-icon"; break;
        case ".svg": type = "image/svg+xml"; break;
        case ".webp": type = "image/webp"; break;
        case ".doc": type = "application/msword"; break;
        case ".docx": type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"; break;
        case ".xls": type = "application/vnd.ms-excel"; break;
        case ".xlsx": type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"; break;
        default: type = ""; break;
      }

      let base64 = fs.readFileSync(path.join(__dirname, `../upload/${url}`), { encoding: 'base64' });

      return {
        base64: base64,
        type: type
      }
    }
    catch (e) {
      throw new Error(e)
    }
  },
  existFile: async (filename, folderUrl) => {
    if (!filename) return false
    let location = path.join(__dirname, `../upload/${folderUrl}/`, `${filename}`);
    return fs.existsSync(location)
  },
  copyFile: (srcPath, destPath) => {
    try {
      let _srcPath = path.join(__dirname, `../upload/${srcPath}`);
      let _destPath = path.join(__dirname, `../upload/${destPath}`);
      fs.copyFileSync(_srcPath, _destPath);
    } 
    catch (e) {
      throw new Error(e)
    }
  },
  convertFileName: (fileName) => {
    let now = new Date();
    let hour = now.getHours();
    let minute = now.getMinutes();
    let second = now.getSeconds();
    let millisecond = now.getMilliseconds();
    let date = now.getDate();
    let month = now.getMonth() + 1;
    let year = now.getFullYear();

    let postfix = '_' + date + month + year + hour + minute + second + millisecond;

    return fileName + postfix;
  }
}

module.exports = handleFile;