const db = require('../../../../data/knex-db');
const authenticated = require('../../../../middleware/authenticated-guard');
const sendEmail = require('../../../../common/sendEmail');
const { saveFile, deleteFile, downloadFile } = require('../../../../common/handleFile');
const { MESSAGE_COUNT } = require('../../../subscription/const-subscription');
const { PubSub, withFilter } = require('graphql-subscriptions');
const pubsub = new PubSub();

const resolvers = {
  //QUERY
  Query: {
    getListMessage: authenticated(async (parent, args, context) => {
      try 
      {
        let userId = context.currentUser.id;
        let FromCreatedDate = args.GetListMessageInput.FromCreatedDate;
        let ToCreatedDate = args.GetListMessageInput.ToCreatedDate;
        let FromSendDate = args.GetListMessageInput.FromSendDate;
        let ToSendDate = args.GetListMessageInput.ToSendDate;
        let ListStatus = args.GetListMessageInput.ListStatus;

        let result = await db.select().table('Message')
          .orderBy('CreatedDate', 'desc')
          .where(builder => {
            builder.where('CreatedBy', userId);

            if (FromCreatedDate)
              builder.whereRaw('??::date >= ?::date', ['CreatedDate', FromCreatedDate]);

            if (ToCreatedDate)
              builder.whereRaw('??::date <= ?::date', ['CreatedDate', ToCreatedDate]);

            if (FromSendDate)
              builder.whereRaw('??::date >= ?::date', ['SendDate', FromSendDate]);

            if (ToSendDate)
              builder.whereRaw('??::date <= ?::date', ['SendDate', ToSendDate]);
            
            if (ListStatus.length > 0)
              builder.whereIn('Status', ListStatus);
          });

        result.forEach(item => {
          item.StatusName = item.Status == 0 ? "Lưu nháp" : "Đã gửi";
        });

        return {
          listMessage: result,
          messageCode: 200,
          message: 'message.get_list_message.success'
        }
      } 
      catch (e) 
      {
        return {
          listMessage: [],
          messageCode: 500,
          message: e.toString()
        }
      }
    }),
    getMasterDataMessageDialog: authenticated(async (parent, args, context) => { 
      try 
      {
        let messageObject = {
          Id: 0,
          TieuDe: "",
          NoiDung: "",
          NhomNguoiNhan: 1,
          PhuongThucGui: "",
          GuiTatCa: null,
          SendDate: null,
          Status: null,
          CreatedDate: null,
          StatusName: null
        };

        //List file đính kèm
        let fileUploadMes = [];

        //Lấy list đơn vị
        let list_don_vi = await db.table('DonVi')
          .whereIn('Level', [0, 1])
          .select('Id', 'TenDonVi', 'ParentId').orderBy('Id');

        //Lấy list người dùng
        let list_nguoi_dung = await db.table('NguoiDung').select('Id', 'HoTen', 'DonVi_Id');
        
        let list_data_send_mess = [];
        list_don_vi.forEach(item => {
          let data_send_mess = {
            Id: item.Id,
            Name: item.TenDonVi,
            ParentId: null,
            Level: 0,
            NguoiDung_Id: null,
            SoNguoiThuocNhomQuyen: 0,
            Selectable: true
          };
          list_data_send_mess.push(data_send_mess);
        });

        let maxId = Math.max(...list_data_send_mess.map(x => x.Id));
        list_nguoi_dung.forEach(item => {
          let data_send_mess = {
            Id: ++maxId,
            Name: item.HoTen,
            ParentId: item.DonVi_Id,
            Level: 1,
            NguoiDung_Id: item.Id,
            SoNguoiThuocNhomQuyen: 0,
            Selectable: true
          };
          list_data_send_mess.push(data_send_mess);
        });

        //Lấy list nhóm quyền
        let list_nhom_quyen = await db.table('NhomQuyen').select('Id', 'TenNhomQuyen');
        let list_phan_quyen = await db.table('PhanQuyen').select('NguoiDung_Id', 'NhomQuyen_Id');

        let list_data_permission_group = [];
        list_nhom_quyen.forEach(item => {
          //Lấy số người thuộc nhóm quyền
          let count_user = list_phan_quyen.filter(x => x.NhomQuyen_Id == item.Id).length;
          let selectable = true; //count_user == 0 ? false : true;

          let data_send_mess = {
            Id: item.Id,
            Name: item.TenNhomQuyen,
            ParentId: null,
            Level: 0,
            NguoiDung_Id: null,
            SoNguoiThuocNhomQuyen: count_user,
            Selectable: selectable
          };
          list_data_permission_group.push(data_send_mess);
        });

        //Nếu là lấy lại thông tin Message
        let listKeys = [];
        let listPartial = [];
        if (args.Id) {
          let message = await db.table('Message').where('Id', args.Id).first();
        
          messageObject.Id = message.Id;
          messageObject.TieuDe = message.TieuDe;
          messageObject.NoiDung = message.NoiDung;
          messageObject.NhomNguoiNhan = message.NhomNguoiNhan;
          messageObject.PhuongThucGui = message.PhuongThucGui;
          messageObject.GuiTatCa = message.GuiTatCa;
          messageObject.Status = message.Status;
          messageObject.StatusName = message.Status == 0 ? "Lưu nháp" : "Đã gửi";

          //Lấy list selected và list PartialSelected nếu là Nhóm người nhận là Theo người dùng
          if (messageObject.NhomNguoiNhan == 1) {
            //Lấy list User đã gửi
            let _listNguoiDungId = await db.table('Message_NguoiDung')
              .where('Message_Id', message.Id)
              .select('NguoiDung_Id');
            let listNguoiDungId = _listNguoiDungId?.map(x => x.NguoiDung_Id);
            listKeys = list_data_send_mess.filter(x => listNguoiDungId
              .includes(x.NguoiDung_Id)).map(x => x.Id.toString());

            let listNode = list_data_send_mess.filter(x => x.Level == 0);
            listNode.forEach(item => {
              let countChild = list_data_send_mess.filter(x => x.ParentId == item.Id).length;
              let count = list_data_send_mess.filter(x => x.ParentId == item.Id)
                .filter(x => listKeys.includes(x.Id.toString())).length;

              //Nếu tất cả node con đều đc chọn
              if (countChild == count && countChild != 0) {
                listKeys.push(item.Id.toString())
              }
              //Nếu có ít nhất 1 node con đc chọn
              else if (count > 0) {
                listPartial.push(item.Id)
              }
              //Nếu không có node con nào đc chọn
              else if (count == 0) {
                let listChildId = list_data_send_mess.filter(x => x.ParentId == item.Id).map(x => x.Id);
                let exists = false;
                listChildId.forEach(child => {
                  if (listPartial.includes(child)) exists = true;
                });

                //Nếu có ít nhất 1 node con là partial
                if (exists) listPartial.push(item.Id)
              }
            });
          }
          //Lấy list selected của nhóm quyền
          else {
            let list_nhom_quyen_id = await db.table('Message_NhomQuyen')
              .where('Message_Id', message.Id).select('NhomQuyen_Id');
            listKeys = list_nhom_quyen_id.map(x => x.NhomQuyen_Id.toString());
          }

          let listFileDinhKem = await db.table('FileDinhKemMesssage')
            .where('Message_Id', args.Id)
            .select('Id', 'TenTaiLieu');

          listFileDinhKem.forEach(item => {
            let index = item.TenTaiLieu.lastIndexOf('.');
            let fileName = item.TenTaiLieu.substring(0, index);
            let fileType = item.TenTaiLieu.substring(index + 1);
            let indexSpecial = fileName.lastIndexOf('_');
            fileName = fileName.substring(0, indexSpecial) + '.' + fileType;

            let fileDinhKem = {
              Id: item.Id,
              TenTaiLieu: fileName
            };
            fileUploadMes.push(fileDinhKem);
          });
        }

        return {
          messageObject: messageObject,
          listDataSendMess: list_data_send_mess,
          listDataPermissionGroup: list_data_permission_group,
          listKeys: listKeys,
          listPartial: listPartial,
          fileUploadMes: fileUploadMes,
          messageCode: 200,
          message: 'message.get_master_data_message_dialog.success'
        }
      } 
      catch (e) 
      {
        return {
          listMessage: [],
          messageCode: 500,
          message: e.toString()
        }
      }
    }),
    getCountMessageByUserId: authenticated(async (parent, args, context) => {
      try {
        let userId = context.currentUser.id;
        let count = await db.table('Message_NguoiDung')
          .innerJoin('Message', 'Message_NguoiDung.Message_Id', '=', 'Message.Id')
          .where(builder => {
            builder.where('Message_NguoiDung.NguoiDung_Id', userId);

            builder.where('Message_NguoiDung.DaXem', false);

            builder.where('Message_NguoiDung.Status', 1);

            builder.where('Message.Type', 0);
          })
          .count('Message_NguoiDung.Id');

        return {
          count: Number.parseInt(count[0].count),
          messageCode: 200,
          message: 'message.count_mes_by_user.success'
        }
      }
      catch (e) {
        return {
          messageCode: 500,
          message: e.toString()
        }
      }
    }),
    getListMessageByUserId: authenticated(async (parent, args, context) => {
      try {
        let Keyword = args.Keyword;
        let userId = context.currentUser.id;
        let _listMessage = await db
          .select(
            'Message_NguoiDung.Id',
            'Message.Id AS Message_Id',
            'Message.TieuDe',
            'Message.NoiDung',
            'Message.SendDate',
            'Message.CreatedBy',
            'Message_NguoiDung.DaXem'
          )
          .orderBy('Message.SendDate', 'desc')
          .from('Message_NguoiDung')
          .innerJoin('Message', 'Message_NguoiDung.Message_Id', 'Message.Id')
          .where(builder => {
            builder.where('Message_NguoiDung.NguoiDung_Id', userId);

            builder.where('Message_NguoiDung.Status', 1);

            builder.where('Message.Type', 0);

            if (Keyword) {
              builder
                .where('TieuDe', 'like', `%${Keyword.trim()}%`)
                .orWhere('NoiDung', 'like', `%${Keyword.trim()}%`);
            }
          });

        let listFile = await db.table('FileDinhKemMesssage')
          .select('Id', 'TenTaiLieu', 'Message_Id')
          .whereIn('Message_Id', _listMessage.map(x => x.Message_Id));
        
        if (listFile.length > 0) {
          _listMessage.forEach(item => {
            let files = listFile.filter(x => x.Message_Id == item.Message_Id);
            files.forEach(file => {
              let index = file.TenTaiLieu.lastIndexOf('.');
              let fileName = file.TenTaiLieu.substring(0, index);
              let fileType = file.TenTaiLieu.substring(index + 1);
              let indexSpecial = fileName.lastIndexOf('_');
              file.TenTaiLieu = fileName.substring(0, indexSpecial) + '.' + fileType;
            });
            item.fileUploadMes = files;
          });
        }

        //Lấy list người tạo message
        let listCreatedBy = _listMessage.map(x => x.CreatedBy);
        let listNguoiDung = await db.table('NguoiDung')
          .select('Id', 'HoTen')
          .whereIn('Id', listCreatedBy);

        let listMessage = [];
        _listMessage.forEach(item => {
          let newItem = {
            Id: item.Id,
            TieuDe: item.TieuDe,
            NoiDung: item.NoiDung,
            SendDate: item.SendDate,
            CreatedName: listNguoiDung.find(x => x.Id == item.CreatedBy)?.HoTen,
            DaXem: item.DaXem,
            ListFile: item.fileUploadMes ? item.fileUploadMes : []
          }
          listMessage.push(newItem);
        })

        return {
          listMessage: listMessage,
          messageCode: 200,
          message: 'message.get_list_mess_by_user.success'
        };
      }
      catch (e) {
        return {
          messageCode: 500,
          message: e.toString()
        }
      }
    })
  },

  //MUTATION
  Mutation: {
    createMessage: authenticated(async (parent, args, context) => {
      try 
      {
        let userId = context.currentUser.id;
        let trx_result = await db.transaction(async trx => {
          let messageInput = args.MessageInput;

          //Tạo Message
          let result = await trx.table('Message')
            .returning(['Id']).insert({
              TieuDe: messageInput.TieuDe, 
              NoiDung: messageInput.NoiDung,
              NhomNguoiNhan: messageInput.NhomNguoiNhan,
              PhuongThucGui: messageInput.PhuongThucGui,
              GuiTatCa: messageInput.GuiTatCa,
              Status: 0, //Lưu nháp
              CreatedBy: userId
            });

          let Message_Id = result[0].Id;
          
          //Theo người dùng
          if (messageInput.NhomNguoiNhan == 1) {
            //Thêm vào bảng mapping
            let listMessage_NguoiDung = [];
            messageInput.ListSelectedId?.forEach(item => {
              let message_nguoiDung = {
                Message_Id: Message_Id,
                NguoiDung_Id: item,
                Status: 0
              };
              listMessage_NguoiDung.push(message_nguoiDung);
            });

            if (listMessage_NguoiDung.length > 0) {
              let createMessage_NguoiDung = await trx.table('Message_NguoiDung')
                .insert(listMessage_NguoiDung);
            }
          }
          //Theo nhóm quyền
          else if (messageInput.NhomNguoiNhan == 2) {
            //Thêm vào bảng mapping
            let listMessage_NhomQuyen = [];
            messageInput.ListSelectedId?.forEach(item => {
              let message_nhomQuyen = {
                Message_Id: Message_Id,
                NhomQuyen_Id: item
              };
              listMessage_NhomQuyen.push(message_nhomQuyen);
            });

            if (listMessage_NhomQuyen.length > 0) {
              let createMessage_NhomQuyen = await trx.table('Message_NhomQuyen')
                .insert(listMessage_NhomQuyen);
            }
          }

          //Lưu file db
          let thuMuc = await trx.table('ThuMuc').where('Id', 1).first();
          let thuMucId = thuMuc.Id;
          let listFileDinhKem = [];
          for (let file of args.files) {
            let { filename, mimetype, createReadStream } = await file;

            let fileDinhKem = {
              TenTaiLieu: filename,
              ThuMuc_Id: thuMucId,
              Message_Id: Message_Id
            };

            listFileDinhKem.push(fileDinhKem);
          }

          if (listFileDinhKem.length > 0)
            await trx.table('FileDinhKemMesssage').insert(listFileDinhKem);

          //Lưu file vật lý
          await saveFile(args.files, thuMuc.TenThuMuc);

          return {
            Id: Message_Id,
            messageCode: 200,
            message: 'message.tao_moi.success'
          }
        });

        return trx_result;
      }
      catch (e)
      {
        console.log(e)
        return {
          messageCode: 500,
          message: 'message.tao_moi.error'
        }
      }
    }),
    updateMessage: authenticated(async (parent, args, context) => {
      try 
      {
        let trx_result = await db.transaction(async trx => {
          let messageInput = args.MessageInput;
          //Update Message
          let result = await trx.table('Message')
            .where('Id', args.Id)
            .update({
              TieuDe: messageInput.TieuDe, 
              NoiDung: messageInput.NoiDung,
              NhomNguoiNhan: messageInput.NhomNguoiNhan,
              PhuongThucGui: messageInput.PhuongThucGui,
              GuiTatCa: messageInput.GuiTatCa
            });

          //Theo người dùng
          if (messageInput.NhomNguoiNhan == 1) {
            //Xóa bảng mapping
            let del = await trx.table('Message_NguoiDung')
              .where('Message_Id', args.Id).del();
            
            //Thêm vào bảng mapping
            let listMessage_NguoiDung = [];
            messageInput.ListSelectedId?.forEach(item => {
              let message_nguoiDung = {
                Message_Id: args.Id,
                NguoiDung_Id: item,
                Status: 0
              };
              listMessage_NguoiDung.push(message_nguoiDung);
            });

            if (listMessage_NguoiDung.length > 0) {
              let createMessage_NguoiDung = await trx.table('Message_NguoiDung')
                .insert(listMessage_NguoiDung);
            }
          }
          //Theo nhóm quyền
          else if (messageInput.NhomNguoiNhan == 2) {
            //Xóa bảng mapping
            let del = await trx.table('Message_NhomQuyen')
              .where('Message_Id', args.Id).del();
            
            //Thêm vào bảng mapping
            let listMessage_NhomQuyen = [];
            messageInput.ListSelectedId?.forEach(item => {
              let message_nhomQuyen = {
                Message_Id: args.Id,
                NhomQuyen_Id: item
              };
              listMessage_NhomQuyen.push(message_nhomQuyen);
            });

            if (listMessage_NhomQuyen.length > 0) {
              let createMessage_NhomQuyen = await trx.table('Message_NhomQuyen')
                .insert(listMessage_NhomQuyen);
            }
          }

          //Lưu file db
          let thuMuc = await trx.table('ThuMuc').where('Id', 1).first();
          let thuMucId = thuMuc.Id;
          let listFileDinhKem = [];
          for (let file of args.files) {
            let { filename, mimetype, createReadStream } = await file;

            let fileDinhKem = {
              TenTaiLieu: filename,
              ThuMuc_Id: thuMucId,
              Message_Id: args.Id
            };

            listFileDinhKem.push(fileDinhKem);
          }

          if (listFileDinhKem.length > 0)
            await trx.table('FileDinhKemMesssage').insert(listFileDinhKem);

          //Lưu file vật lý
          await saveFile(args.files, thuMuc.TenThuMuc);

          return {
            messageCode: 200,
            message: 'message.cap_nhat.success'
          }
        });
        
        return trx_result;
      }
      catch (e)
      {
        console.log(e)
        return {
          messageCode: 500,
          message: 'message.cap_nhat.error'
        }
      }
    }),
    deleteMessage: authenticated(async (parent, args, context) => {
      try {
        let trx_result = await db.transaction(async trx => {
          let _message = await trx.table('Message').where('Id', args.Id).first();

          //Nếu tin nhắn ở trạng thái Đã gửi
          if (_message.Status == 1) 
            throw new Error('message.xoa.error_tin_nhan_da_gui');
          
          //Xóa các bảng mapping
          let list_message_nguoiDung = await trx.table('Message_NguoiDung')
            .where('Message_Id', _message.Id).del();
          
          let list_message_nhomQuyen = await trx.table('Message_NhomQuyen')
            .where('Message_Id', _message.Id).del();

          let folder = await trx.table('ThuMuc').where('Id', 1).first();
          let list_file_dinh_kem = await trx.table('FileDinhKemMesssage')
            .where('Message_Id', args.Id).then((files) => {
              if (files.length > 0) {
                let listUrl = [];
                //Xóa file vật lý
                for (let file of files) {
                  let url = folder.Path + '/' + file.TenTaiLieu;
                  listUrl.push(url);
                }
                
                deleteFile(listUrl);
              }
            });

          //xóa file trên db
          let del_file = await trx.table('FileDinhKemMesssage')
            .where('Message_Id', args.Id).del();

          //Xóa message
          let del = await trx.table('Message').where('Id', args.Id).del();
          
          return {
            messageCode: 200,
            message: 'message.xoa.success'
          }
        });
        
        return trx_result;
      }
      catch (e) 
      {
        console.log(e)
        return {
          messageCode: 500,
          message: 'message.xoa.error'
        }
      }
    }),
    sendMessage: authenticated(async (parent, args, context) => {
      try {
        let userId = context.currentUser.id;

        let trx_result = await db.transaction(async trx => {
          let _message = await trx.table('Message').where('Id', args.Id).first();

          //Nếu tin nhắn ở trạng thái Đã gửi
          if (!_message) {
            throw new Error('message.send_message.error_message_not_found');
          }

          let list_phuong_thuc = _message.PhuongThucGui.split(',');
          
          //Cập nhật trạng thái message
          let update_mess_status = await trx.table('Message').where('Id', args.Id)
            .update({
              Status: 1,
              SendDate: new Date()
            });
          
          //Theo người dùng
          if (_message.NhomNguoiNhan == 1) {
            //Đếm số người nhận
            let list_nguoi_dung_id = await trx.table('Message_NguoiDung')
              .where('Message_Id', args.Id)
              .select('NguoiDung_Id')
              .pluck('NguoiDung_Id');
            
            if (list_nguoi_dung_id.length === 0) {
              throw new Error('message.send_message.error_user_not_found');
            }

            //Gửi trên Hệ thống
            if (list_phuong_thuc.includes('GTHT')) {
              //Cập nhật trạng thái bảng mapping
              let update_mess_mapping = await trx.table('Message_NguoiDung')
                .where('Message_Id', args.Id)
                .update({
                  Status: 1
                });
              
              //Thông báo cho client
              pubsub.publish(MESSAGE_COUNT, { RefreshMessageCount: true });
            }

            //Gửi email
            if (list_phuong_thuc.includes('GE')) {
              //Lấy list Email
              let list_email = await trx.table('NguoiDung')
                .whereIn('Id', list_nguoi_dung_id)
                .select('Email')
                .pluck('Email');
                
              let convertTitle =  _message.TieuDe + ' - Người gửi: ' + context.currentUser.HoTen;

              //Lấy list file đính kèm
              let folder = await trx.table('ThuMuc').where('Id', 1).andWhere('Type', 0).first();
              if (!folder) 
                throw new Error('message.send_message.error_folder_not_found');

              let listFileDinhKem = await trx.table('FileDinhKemMesssage')
                .where('Message_Id', args.Id)
                .select('TenTaiLieu')
                .pluck('TenTaiLieu');

              //convert attachments
              let attachments = [];
              listFileDinhKem.forEach(item => {
                let attachment = {
                  filename: item, 
                  content: `${folder.TenThuMuc}/${item}`
                };
                attachments.push(attachment);
              });

              sendEmail.sendEmail(list_email.join(','), convertTitle, _message.NoiDung, attachments, 'stream')
                .catch(console.error);
            }
          }
          //Theo nhóm quyền
          else if (_message.NhomNguoiNhan == 2) {
            //Đếm số Nhóm quyền đc chọn
            let count = await trx.table('Message_NhomQuyen')
              .where('Message_Id', args.Id)
              .count('Id');
            
            if (Number.parseInt(count[0].count) === 0) {
              throw new Error('message.send_message.error_permission_not_found');
            }

            //Lấy ra list UserId gắn với các nhóm quyền
            let list_nhom_quyen_id = await trx.table('Message_NhomQuyen')
              .where('Message_Id', args.Id)
              .select('NhomQuyen_Id')
              .pluck('NhomQuyen_Id');
            
            let list_nguoi_dung = await trx.table('PhanQuyen')
              .whereIn('NhomQuyen_Id', list_nhom_quyen_id)
              .select('NguoiDung_Id')
              .distinct();
            
            if (list_nguoi_dung.length == 0) 
              throw new Error('message.send_message.error_user_not_found');

            //Gửi trên Hệ thống
            if (list_phuong_thuc.includes('GTHT')) {
              //Thêm người dùng vào bảng mapping
              let list_nguoi_dung_id = list_nguoi_dung.map(x => x.NguoiDung_Id);
              let list_message_nguoiDung = [];
              list_nguoi_dung_id.forEach(item => {
                let message_nguoiDung = {
                  Message_Id: args.Id,
                  NguoiDung_Id: item,
                  Status: 1
                };
                list_message_nguoiDung.push(message_nguoiDung);
              });

              await trx.table('Message_NguoiDung')
                .insert(list_message_nguoiDung);

              //Thông báo cho client
              pubsub.publish(MESSAGE_COUNT, { RefreshMessageCount: true });
            }

            //Gửi email
            if (list_phuong_thuc.includes('GE')) {
              //Lấy list Email
              let list_email = await trx.table('NguoiDung')
                .whereIn('Id', [1])
                .select('Email')
                .pluck('Email');
              
              let convertTitle =  _message.TieuDe + ' - Người gửi: ' + context.currentUser.HoTen;
              
              //Lấy list file đính kèm
              let folder = await trx.table('ThuMuc').where('Id', 1).andWhere('Type', 0).first();
              if (!folder) 
                throw new Error('message.send_message.error_folder_not_found');

              let listFileDinhKem = await trx.table('FileDinhKemMesssage')
                .where('Message_Id', args.Id)
                .select('TenTaiLieu')
                .pluck('TenTaiLieu');
              
              //convert attachments
              let attachments = [];
              listFileDinhKem.forEach(item => {
                let attachment = {
                  filename: item, 
                  content: `${folder.TenThuMuc}/${item}`
                };
                attachments.push(attachment);
              });

              sendEmail.sendEmail(list_email.join(','), convertTitle, _message.NoiDung, attachments, 'stream')
                .catch(console.error);
            }
          }
          
          return {
            messageCode: 200,
            message: 'message.send_message.success'
          }
        });
        
        return trx_result;
      }
      catch (e) 
      {
        return {
          messageCode: 500,
          message: e.toString()
        }
      }
    }),
    deleteFileDinhKemMessage: authenticated(async (parent, args, context) => {
      try {
        let fileDinhKem = await db.table('FileDinhKemMesssage')
          .where('Id', args.Id).first();
        
        if (!fileDinhKem)
          return {
            messageCode: 500,
            message: 'message.delete_file_dinh_kem.error'
          }

        let _message = await db.table('Message')
          .where('Id', fileDinhKem.Message_Id).first();

        if (_message.Status == 1)
          return {
            messageCode: 500,
            message: 'message.delete_file_dinh_kem.error_tin_nhan_da_gui'
          }
        
        let trx_result = await db.transaction(async trx => {
          let del = await trx.table('FileDinhKemMesssage')
          .where('Id', args.Id).first().del();

          //Xóa file vật lý
          let folder = await trx.table('ThuMuc').where('Id', fileDinhKem.ThuMuc_Id).first();
          deleteFile([folder.Path + '/' + fileDinhKem.TenTaiLieu]);

          return {
            messageCode: 200,
            message: 'message.delete_file_dinh_kem.success'
          }
        });
        
        return trx_result;
      }
      catch (e) {
        return {
          messageCode: 500,
          message: e.toString()
        }
      }
    }),
    downloadFileMess: authenticated(async (parent, args, context) => {
      try {
        let fileDinhKem = await db.table('FileDinhKemMesssage')
          .where('Id', args.Id).first();
        let folder = await db.table('ThuMuc').where('Id', fileDinhKem.ThuMuc_Id).first();
        
        if (!fileDinhKem)
          return {
            messageCode: 500,
            message: 'message.downloadFile.error_file_not_found'
          }
        
        let { base64, type } = downloadFile(folder.Path + '/' + fileDinhKem.TenTaiLieu);

        return {
          base64: base64,
          type: type,
          messageCode: 200,
          message: 'message.downloadFile.success'
        }
      }
      catch (e) {
        return {
          messageCode: 500,
          message: e.toString()
        }
      }
    }),
    xemMessage: authenticated(async (parent, args, context) => {
      try {
        let userId = context.currentUser.id;

        let _updateMessage = await db.table('Message_NguoiDung')
          .where('Id', args.Id).update({
            DaXem: true
          });

        //Thông báo cho client
        pubsub.publish(MESSAGE_COUNT, { RefreshMessageCount: true });
        
        return {
          messageCode: 200,
          message: 'message.xemMessage.success'
        }
      }
      catch (e) {
        return {
          messageCode: 500,
          message: e.toString()
        }
      }
    })
  },

  //SUBSCRIPTIONS
  Subscription: {
    RefreshMessageCount: {
      // More on pubsub below
      subscribe: withFilter(
        () => pubsub.asyncIterator(MESSAGE_COUNT),
        (payload, variables) => {
          // Only push an update if the comment is on
          // the correct repository for this operation

          return true;
        },
      ),
    },
  },
}

module.exports = resolvers