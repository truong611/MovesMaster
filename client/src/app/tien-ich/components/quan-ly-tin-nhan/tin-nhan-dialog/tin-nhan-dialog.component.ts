import { Component, OnInit, ViewChild } from '@angular/core';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MessageService, TreeNode } from 'primeng/api';
import { MessageAppService } from './../../../services/message-app.service';
import { Message } from '../../../models/tin-nhan/message.model';
import { ValidaytorsService } from '../../../../shared/services/validaytors.service';
import { FileUpload } from 'primeng/fileupload';
import { HandleFileService } from '../../../../shared/services/handleFile.service';

class NhomNguoiNhan {
  name: string;
  value: number;
}

class MessageInput {
  TieuDe: string;
  NoiDung: string;
  NhomNguoiNhan: number;
  PhuongThucGui: string;
  GuiTatCa: boolean;
  ListSelectedId: Array<number>;
}

class DataSendMess {
  Id: number;
  Name: string;
  ParentId: number;
  Level: number;
  NguoiDung_Id: number;
  SoNguoiThuocNhomQuyen: number;
  Selectable: boolean;

  //Virtual
  PartialSelected: boolean;
}

@Component({
  selector: 'app-tin-nhan-dialog',
  templateUrl: './tin-nhan-dialog.component.html',
  styleUrls: ['./tin-nhan-dialog.component.css'],
  providers: [MessageService]
})
export class TinNhanDialogComponent implements OnInit {
  defaultLimitedFileSize: 30000000; //30Mb
  type: number = null; //0: Create, 1: Update
  id: number = null; //Id message
  awaitRes: boolean = false;

  tinNhanForm: FormGroup;
  tieuDeControl: FormControl;
  noiDungControl: FormControl;
  nhomNguoiNhanControl: FormControl;
  guiTatCaControl: FormControl;

  listNhomNguoiNhan: Array<NhomNguoiNhan> = [
    { name: 'Theo người dùng', value: 1 },
    { name: 'Theo nhóm quyền', value: 2 }
  ];

  selectedPhuongThuc: Array<any> = ['GTHT'];

  message: Message;
  listDataSendMess: Array<DataSendMess> = [];
  listDataPermissionGroup: Array<DataSendMess> = [];
  listKeys: Array<string> = [];

  listTree: Array<TreeNode> = [];
  listSelected: TreeNode[] = [];
  cols: any[];
  fileUploadMes: Array<any> = [];

  @ViewChild('fileUpload') fileUpload: FileUpload;

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    public messageAppService: MessageAppService,
    public messageService: MessageService,
    public validaytorsService: ValidaytorsService,
    public handleFileService: HandleFileService
  ) {
    this.type = this.config.data.type;
    this.id = Number.parseInt(this.config.data.id);
  }

  ngOnInit(): void {
    this.initForm();
    this.initTable();
    this.getMasterData();
  }

  initForm() {
    this.tieuDeControl = new FormControl(null, [Validators.required, this.validaytorsService.forbiddenSpaceText, Validators.maxLength(255)]);
    this.noiDungControl = new FormControl(null, [Validators.required, this.validaytorsService.forbiddenSpaceText]);
    this.nhomNguoiNhanControl = new FormControl(this.listNhomNguoiNhan[0]);
    this.guiTatCaControl = new FormControl(false);

    this.tinNhanForm = new FormGroup({
      tieuDeControl: this.tieuDeControl,
      noiDungControl: this.noiDungControl,
      nhomNguoiNhanControl: this.nhomNguoiNhanControl,
      guiTatCaControl: this.guiTatCaControl
    });
  }

  initTable() {
    this.cols = [
      { field: 'Stt', header: 'STT', textAlign: 'center', display: 'table-cell', colWith: '10%' },
      { field: 'TenTaiLieu', header: 'Tên Tài liệu', textAlign: 'left', display: 'table-cell', colWith: '70%' },
      { field: 'Actions', header: 'Tác vụ', textAlign: 'center', display: 'table-cell', colWith: '20%' },
    ];
  }

  async getMasterData() {
    let { data }: any = await this.messageAppService.getMasterDataMessageDialog(this.id);
    this.listDataSendMess = data.getMasterDataMessageDialog.listDataSendMess.map((item) =>
      Object.assign({}, item)
    );
    this.listDataPermissionGroup = data.getMasterDataMessageDialog.listDataPermissionGroup;
    this.listKeys = data?.getMasterDataMessageDialog.listKeys.map(item => item);
    this.fileUploadMes = data.getMasterDataMessageDialog.fileUploadMes.map((item) =>
      Object.assign({}, item)
    );
    //Update
    if (this.type == 1) {
      this.message = data.getMasterDataMessageDialog.messageObject;
      this.mapDataToForm(data.getMasterDataMessageDialog.listPartial);
    }
    else {
      this.listTree = this.list_to_tree(this.listDataSendMess);
    }
  }

  mapDataToForm(listPartial) {
    this.tieuDeControl.setValue(this.message.TieuDe);
    this.noiDungControl.setValue(this.message.NoiDung);
    let nhomNguoiNhan = this.listNhomNguoiNhan.find(x => x.value == this.message.NhomNguoiNhan);
    this.nhomNguoiNhanControl.setValue(nhomNguoiNhan);
    this.guiTatCaControl.setValue(this.message.GuiTatCa);
    this.selectedPhuongThuc = this.message.PhuongThucGui?.split(",");

    //Theo người dùng
    if (nhomNguoiNhan.value == 1) {
      this.listDataSendMess.forEach(item => {
        if (listPartial.includes(item.Id)) item.PartialSelected = true;
        else item.PartialSelected = false;
      });
      this.listTree = this.list_to_tree(this.listDataSendMess);

      this.selectNodes(this.listTree, this.listSelected, this.listKeys);
    }
    //Theo nhóm quyền
    else {
      this.listTree = this.list_to_tree(this.listDataPermissionGroup);
      this.selectNodes(this.listTree, this.listSelected, this.listKeys);
    }
  }

  handleFile(event) {
    this.handleFileService.convertFileName(this.fileUpload)
  }

  removeFile(event) {
    var index = this.fileUpload.files.indexOf(event)
    this.fileUpload.files.splice(index, 1)
  }
  fixNameFile(url): string {
    if (!url) return null
    var name = url.split('.')[0]
    var ext = url.split('.')[1]

    if (name.length > 20) {
      name = name.substring(0, 20) + '...'
    }
    return `${name}.${ext}`
  }

  clearAllFile() {

  }

  list_to_tree(listData: Array<any>) {
    let list: Array<TreeNode> = [];
    listData.forEach(item => {
      let soNguoiThuocNhomQuyen = '';
      let nhomNguoiNhan: NhomNguoiNhan = this.nhomNguoiNhanControl.value;
      if (nhomNguoiNhan.value == 2) {
        soNguoiThuocNhomQuyen = ' (' + item.SoNguoiThuocNhomQuyen.toString() + ')'
      }
      let node: TreeNode = {
        label: item.Name + soNguoiThuocNhomQuyen,
        key: item.Id.toString(),
        partialSelected: item.PartialSelected,
        expanded: false,
        selectable: item.Selectable,
        data: {
          'Id': item.Id,
          'ParentId': item.ParentId,
          'Level': item.Level,
          'NguoiDung_Id': item.NguoiDung_Id
        },
        children: []
      };

      list = [...list, node];
    });

    var map = {}, node, roots = [], i;

    for (i = 0; i < list.length; i += 1) {
      map[list[i].data.Id] = i; // initialize the map
      list[i].children = []; // initialize the children
    }

    for (i = 0; i < list.length; i += 1) {
      node = list[i];
      if (node.data.Level !== 0) {
        // if you have dangling branches check that map[node.parentId] exists
        list[map[node.data.ParentId]].children.push(node);
      } else {
        roots.push(node);
      }
    }
    return roots;
  }

  selectNodes(tree: TreeNode[], checkedNodes: TreeNode[], keys: Array<any>) {
    // Iterate through each node of the tree and select nodes
    let count = tree.length;
    for (const node of tree) {
      // If the current nodes key is in the list of keys to select, or it's parent is selected then select this node as well
      if (keys.includes(node.key)) {
        checkedNodes.push(node);
        count--;
      }

      // Look at the current node's children as well
      if (node.children) this.selectNodes(node.children, checkedNodes, keys);
    }
  }

  changeNhomNguoiNhan() {
    this.listSelected = [];
    this.guiTatCaControl.setValue(false);

    let nhomNguoiNhan: NhomNguoiNhan = this.nhomNguoiNhanControl.value;

    //Nếu là Theo người dùng
    if (nhomNguoiNhan.value == 1) {
      this.listTree = this.list_to_tree(this.listDataSendMess);
    }
    //Nếu là Theo nhóm quyền
    else {
      this.listTree = this.list_to_tree(this.listDataPermissionGroup);
    }
  }

  changeGuiTatCa() {
    this.listSelected = [];
    this.resetPartialCheck(this.listTree);
    let guiTatCa: boolean = this.guiTatCaControl.value;

    if (guiTatCa) {
      let nhomNguoiNhan: NhomNguoiNhan = this.nhomNguoiNhanControl.value;

      //Tick tất cả node
      if (nhomNguoiNhan.value == 1) {
        let listKeys = this.listDataSendMess.map(x => x.Id.toString());
        this.selectNodes(this.listTree, this.listSelected, listKeys);
      }
      else if (nhomNguoiNhan.value == 2) {
        let listKeys = this.listDataPermissionGroup.filter(x => x.Selectable == true).map(x => x.Id.toString());
        this.selectNodes(this.listTree, this.listSelected, listKeys);
      }
    }
  }

  resetPartialCheck(listTree: Array<TreeNode>) {
    for (let i = 0; i < listTree.length; i++) {
      listTree[i].partialSelected = false;
      if (listTree[i].children.length > 0) {
        this.resetPartialCheck(listTree[i].children);;
      }
    }
  }

  /* Xử lý logic của button Gửi tất cả và các node trên tree */
  handleCheckAll(event) {
    let nhomNguoiNhan: NhomNguoiNhan = this.nhomNguoiNhanControl.value;
    let count = this.listSelected.length;
    if (nhomNguoiNhan.value == 1) {
      let total = this.listDataSendMess.length;

      if (count == total)
        this.guiTatCaControl.setValue(true);
      else
        this.guiTatCaControl.setValue(false);
    }
    else if (nhomNguoiNhan.value == 2) {
      let total = this.listDataPermissionGroup.filter(x => x.Selectable == true).length;

      if (count == total)
        this.guiTatCaControl.setValue(true);
      else
        this.guiTatCaControl.setValue(false);
    }
  }

  /* Gửi tin nhắn */
  async send() {
    if (!this.tinNhanForm.valid) {
      Object.keys(this.tinNhanForm.controls).forEach(key => {
        if (this.tinNhanForm.controls[key].valid == false) {
          this.tinNhanForm.controls[key].markAsTouched();
        }
      });

      return;
    }

    if (this.selectedPhuongThuc.length == 0) {
      let msg = { key: "popup", severity: 'warn', summary: 'Thông báo:', detail: 'Chưa chọn phương thức gửi' };
      this.showMessage(msg);

      return;
    }

    let messageInput = new MessageInput();
    messageInput.TieuDe = this.tieuDeControl.value.trim();
    messageInput.NoiDung = this.noiDungControl.value.trim();
    messageInput.NhomNguoiNhan = (this.nhomNguoiNhanControl.value as NhomNguoiNhan).value;
    messageInput.PhuongThucGui = this.selectedPhuongThuc.length == 0 ? null : this.selectedPhuongThuc.join(",");
    messageInput.GuiTatCa = this.guiTatCaControl.value;

    let ListSelectedId = [];

    //Lấy listUserId
    if (messageInput.NhomNguoiNhan == 1) {
      ListSelectedId = this.listSelected.filter(x => x.data.Level == 1).map(x => x.data.NguoiDung_Id);
    }
    //Lấy list nhóm quyền
    else {
      ListSelectedId = this.listSelected.map(x => x.data.Id);
    }

    messageInput.ListSelectedId = ListSelectedId;

    let files = this.handleFileService.convertFileName(this.fileUpload);

    //Nếu là thêm mới và gửi tin nhắn
    if (this.type == 0) {
      try {
        this.awaitRes = true;
        let { data }: any = await this.messageAppService.createMessage(messageInput, files);
        if (data.createMessage.messageCode == 200) {
          let message_Id = data.createMessage.Id;

          let result: any = await this.messageAppService.sendMessage(message_Id);
          if (result.data.sendMessage.messageCode == 200) {
            let msg = { key: "popup", severity: 'success', summary: 'Thông báo:', detail: result.data.sendMessage.message };
            this.showMessage(msg);

            setTimeout(() => {
              this.ref.close(true);
            }, 1000);
          }
          else {
            this.awaitRes = false;
            let msg = { key: "popup", severity: 'error', summary: 'Thông báo:', detail: result.data.sendMessage.message };
            this.showMessage(msg);

            this.messageAppService.deleteMessage(message_Id).subscribe(res => { });
          }
        }
        else {
          this.awaitRes = false;
          let msg = { key: "popup", severity: 'error', summary: 'Thông báo:', detail: data.createMessage.message };
          this.showMessage(msg);
        }
      }
      catch (e) {
        this.awaitRes = false;
        let msg = { key: "popup", severity: 'error', summary: 'Thông báo:', detail: e };
        this.showMessage(msg);
      }
    }
    //Nếu gửi tin nhắn đã đc tạo
    else {
      try {
        this.awaitRes = true;
        let { data }: any = await this.messageAppService.updateMessage(this.id, messageInput, files);
        if (data.updateMessage.messageCode == 200) {
          let result: any = await this.messageAppService.sendMessage(this.id);

          if (result.data.sendMessage.messageCode == 200) {
            let msg = { key: "popup", severity: 'success', summary: 'Thông báo:', detail: result.data.sendMessage.message };
            this.showMessage(msg);

            setTimeout(() => {
              this.ref.close(true);
            }, 1000);
          }
          else {
            this.awaitRes = false;
            let msg = { key: "popup", severity: 'error', summary: 'Thông báo:', detail: result.data.sendMessage.message };
            this.showMessage(msg);
          }
        }
        else {
          this.awaitRes = false;
          let msg = { key: "popup", severity: 'error', summary: 'Thông báo:', detail: data.updateMessage.message };
          this.showMessage(msg);
        }
      }
      catch (e) {
        this.awaitRes = false;
        let msg = { key: "popup", severity: 'error', summary: 'Thông báo:', detail: e };
        this.showMessage(msg);
      }
    }
  }

  async save() {
    if (!this.tinNhanForm.valid) {
      Object.keys(this.tinNhanForm.controls).forEach(key => {
        if (this.tinNhanForm.controls[key].valid == false) {
          this.tinNhanForm.controls[key].markAsTouched();
        }
      });

      return;
    }

    if (this.selectedPhuongThuc.length == 0) {
      let msg = { key: "popup", severity: 'warn', summary: 'Thông báo:', detail: 'Chưa chọn phương thức gửi' };
      this.showMessage(msg);

      return;
    }

    let messageInput = new MessageInput();
    messageInput.TieuDe = this.tieuDeControl.value.trim();
    messageInput.NoiDung = this.noiDungControl.value.trim();
    messageInput.NhomNguoiNhan = (this.nhomNguoiNhanControl.value as NhomNguoiNhan).value;
    messageInput.PhuongThucGui = this.selectedPhuongThuc.length == 0 ? null : this.selectedPhuongThuc.join(",");
    messageInput.GuiTatCa = this.guiTatCaControl.value;

    let ListSelectedId = [];

    //Lấy listUserId
    if (messageInput.NhomNguoiNhan == 1) {
      ListSelectedId = this.listSelected.filter(x => x.data.Level == 1).map(x => x.data.NguoiDung_Id);
    }
    //Lấy list nhóm quyền
    else {
      ListSelectedId = this.listSelected.map(x => x.data.Id);
    }

    messageInput.ListSelectedId = ListSelectedId;

    let files = this.handleFileService.convertFileName(this.fileUpload);

    //Create
    if (this.type == 0) {
      try {
        this.awaitRes = true;
        let { data }: any = await this.messageAppService.createMessage(messageInput, files);
        if (data.createMessage.messageCode == 200) {
          let msg = { key: "popup", severity: 'success', summary: 'Thông báo:', detail: data.createMessage.message };
          this.showMessage(msg);

          setTimeout(() => {
            this.ref.close(true);
          }, 1000);
        }
        else {
          let msg = { key: "popup", severity: 'error', summary: 'Thông báo:', detail: data.createMessage.message };
          this.showMessage(msg);
        }
      }
      catch (e) {
        let msg = { key: "popup", severity: 'error', summary: 'Thông báo:', detail: e };
        this.showMessage(msg);
      }
    }
    //Update
    else {
      try {
        this.awaitRes = true;
        let { data }: any = await this.messageAppService.updateMessage(this.id, messageInput, files);
        if (data.updateMessage.messageCode == 200) {
          let msg = { key: "popup", severity: 'success', summary: 'Thông báo:', detail: data.updateMessage.message };
          this.showMessage(msg);

          setTimeout(() => {
            this.ref.close(true);
          }, 1000);
        }
        else {
          let msg = { key: "popup", severity: 'error', summary: 'Thông báo:', detail: data.updateMessage.message };
          this.showMessage(msg);
        }
      }
      catch (e) {
        let msg = { key: "popup", severity: 'error', summary: 'Thông báo:', detail: e };
        this.showMessage(msg);
      }
    }
  }

  deleteFile(item) {
    this.messageAppService.deleteFileDinhKemMessage(item.Id).subscribe(({ data }) => {
      let result: any = data;

      if (result.deleteFileDinhKemMessage.messageCode == 200) {
        let msg = { key: "popup", severity: 'success', summary: 'Thông báo:', detail: result.deleteFileDinhKemMessage.message };
        this.showMessage(msg);

        this.fileUploadMes = this.fileUploadMes.filter(x => x != item);
      }
      else {
        let msg = { key: "popup", severity: 'error', summary: 'Thông báo:', detail: result.deleteFileDinhKemMessage.message };
        this.showMessage(msg);
      }
    }, error => {
      let msg = { key: "popup", severity: 'error', summary: 'Thông báo:', detail: error };
      this.showMessage(msg);
    })
  }

  close() {
    this.ref.close();
  }

  showMessage(msg: any) {
    this.messageService.add(msg);
  }
}
