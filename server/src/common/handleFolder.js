const fs = require('fs');
const path = require('path');
const db = require('../data/knex-db');
const { deleteFile } = require('../common/handleFile');

const handFolder = {
  createThuMuc: (pathFolder) => {
    try {
      let location = path.join(__dirname, `../upload/`, `${pathFolder}`);
      if (!fs.existsSync(location)) {
        fs.mkdirSync(location, { recursive: false });
      }
    }
    catch (e) {
      throw new Error(e)
    }
  },

  updateFolder: async (duong_dan_cu, duong_dan_moi) => {
    let oldpath = path.join(__dirname, `../upload/`, `${duong_dan_cu}`);
    let newpath = path.join(__dirname, `../upload/`, `${duong_dan_moi}`);
    if (!fs.existsSync(newpath)) {
      try {
        fs.renameSync(oldpath, newpath)
      }
      catch (err) {
        throw new Error(err);
      }
    }
  },

  deleteThuMuc: async (ThuMuc_Id, table_TaiLieu) => {
    try {
      //node cha thì return
      let listChild = await db.table('ThuMuc').where('ParentID', ThuMuc_Id);
      if (listChild.length > 0) return false;

      let trx_result = await db.transaction(async trx => {
        const folder = await trx('ThuMuc').where('Id', ThuMuc_Id).first();
        if (folder) {
          // Xóa tài liệu
          const files = await trx(table_TaiLieu).where('ThuMuc_Id', ThuMuc_Id);
          let listPath = [];
          for (let file of files) {
            let location = folder.Path + '/' + file.TenTaiLieu;
            listPath.push(location);
          }

          try {
            deleteFile(listPath);
            const del_file = await trx(table_TaiLieu).where('ThuMuc_Id', ThuMuc_Id).del();
            // Xóa folder
            const del_folder = await trx('ThuMuc').where('Id', ThuMuc_Id).del();
            // Xóa folder vật lí
            fs.rmdir(path.join(__dirname, `../upload/`, `${folder.Path}`), { recursive: true }, (err) => {
              // @ts-ignore
              if (err) throw new Error(err);
            });
          }
          catch (e) {
            throw new Error(e)
          }

          return true;
        }
      });
      return trx_result;
    }
    catch (e) {
      throw new Error(e)
    }
  },

  getListFileInFolder: (pathFolder) => {
    try {
      let listFile = [];
      let location = path.join(__dirname, `../upload/`, `${pathFolder}`);
      if (fs.existsSync(location)) {
        listFile = fs.readdirSync(location);
      }

      return listFile;
    }
    catch (e) {
      throw new Error(e)
    }
  }
}

module.exports = handFolder;