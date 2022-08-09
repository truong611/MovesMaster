const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type Message {
    Id: ID!,
    TieuDe: String!,
    NoiDung: String!,
    NhomNguoiNhan: Int!,
    PhuongThucGui: String!,
    GuiTatCa: Boolean,
    SendDate: Timestamp,
    Status: Int,
    CreatedDate: Timestamp,
    StatusName: String
  }

  input GetListMessageInput {
    FromCreatedDate: String,
    ToCreatedDate: String,
    FromSendDate: String,
    ToSendDate: String,
    ListStatus: [Int]
  }

  type getListMessageResponse {
    listMessage: [Message],
    messageCode: Int,
    message: String,
  }

  input MessageInput {
    TieuDe: String!,
    NoiDung: String!,
    NhomNguoiNhan: Int!,
    PhuongThucGui: String!,
    GuiTatCa: Boolean!,
    ListSelectedId: [Int]
  }

  type DataSendMess {
    Id: Int,
    Name: String,
    ParentId: Int,
    Level: Int,
    NguoiDung_Id: Int,
    SoNguoiThuocNhomQuyen: Int,
    Selectable: Boolean 
  }

  type FileUploadMes {
    Id: Int,
    TenTaiLieu: String
  }

  type GetMasterDataMessageDialogResponse {
    messageObject: Message,
    listDataSendMess: [DataSendMess],
    listDataPermissionGroup: [DataSendMess],
    listKeys: [String],
    listPartial: [Int],
    fileUploadMes: [FileUploadMes],
    messageCode: Int,
    message: String,
  }

  type CreateMessageResponse {
    Id: Int,
    messageCode: Int,
    message: String,
  }

  type GetCountMessageByUserId {
    count: Int,
    messageCode: Int,
    message: String,
  }

  type MessageCustomize {
    Id: Int,
    TieuDe: String,
    NoiDung: String,
    SendDate: Timestamp,
    CreatedName: String,
    DaXem: Boolean,
    ListFile: [FileUploadMes]
  }

  type GetListMessageByUserIdResponse {
    listMessage: [MessageCustomize],
    messageCode: Int,
    message: String,
  }

  type downloadFileMessResponse {
    base64: String,
    type: String,
    messageCode: Int,
    message: String,
  }
  
  # ROOT TYPE
  type Query {
    getListMessage(GetListMessageInput: GetListMessageInput): getListMessageResponse,
    getMasterDataMessageDialog(Id: Int): GetMasterDataMessageDialogResponse,
    getCountMessageByUserId: GetCountMessageByUserId,
    getListMessageByUserId (Keyword: String): GetListMessageByUserIdResponse
  }

  type Mutation {
    createMessage (MessageInput: MessageInput!, files: [Upload]): CreateMessageResponse,
    updateMessage  (Id: Int!, MessageInput: MessageInput!, files: [Upload]): BaseResponse,
    deleteMessage (Id: ID!): BaseResponse,
    sendMessage (Id: Int!): BaseResponse,
    deleteFileDinhKemMessage (Id: Int!): BaseResponse,
    downloadFileMess (Id: Int!): downloadFileMessResponse,
    xemMessage (Id: Int!): BaseResponse
  }
`

module.exports = typeDefs