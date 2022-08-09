export class ThongBao {
  Id: number;
  TieuDe: string;
  NoiDung: string;
  DaXem: boolean;
  PageUrl: string;
  ParamsUrl: string;
  NguoiDung_Id: number;
  CreatedDate: Date;
}


export class ThongBaoInput {
  TieuDe: string;
  NoiDung: string;
  PageUrl: string;
  ParamsUrl: string;
  ListNguoiDungId: Array<number>;
}