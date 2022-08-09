export class Message {
  Id: number;
  TieuDe: string;
  NoiDung: string;
  NhomNguoiNhan: number;
  PhuongThucGui: string;
  GuiTatCa: boolean;
  SendDate: Date;
  Status: number; //0: Lưu nháp, 1: Đã gửi
  CreatedDate: Date;

  //virtual column
  Stt: number;
  StatusName: string;
  PartialSelected: boolean;

  constructor() {
    this.Status = 0;
  }
}