export class UserInforModel {
  User_ID?: Number;
  User_Avatar_File: File;
  Surname: String;
  Forename: String;
  User_Job_Roll: String;
  User_Phone_Number: String;
  User_Email?: String;
  List_User_Permission: [UserPermissionModel]
}

export class UserPermissionModel {
  User_Permission_ID?: Number;
  Permission_Type_ID: Number;
  User_ID?: Number;
  Is_Active: Boolean;
}
