const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type User {
    User_ID: Int,
    User_Email: String,
    User_Phone_Number: String,
    Surname: String,
    Forename: String,
    User_Avatar: String,
    User_Job_Roll: String,
    IsAdmin: Boolean,
    Is_Mobile_App_User: Boolean,
    Is_Web_App_User: Boolean,
    Moves_Company_ID: Int,
    Moves_Charity_ID: Int,

    #Vitual Field:
    Is_Remove_Privileges: Boolean,
    Is_Remove_Access: Boolean,
  }

  type Permission_Type {
    Permission_Type_ID: Int,
    Permission_Type_Name: String,
    Permission_Type_Code: String,
    Type: Int
  }

  type User_Permission {
    User_Permission_ID: Int,
    Permission_Type_ID: Int,
    User_ID: Int,
    Is_Active: Boolean,
  }

  type Permission {
    Permission_Type_Name: String,
    Permission_Type_Code: String,
    Is_Active: Boolean
  }

  type GetListUserResponse {
    ListUser: [User],
    messageCode: Int!,
    message: String!,
  }

  type GetUserInforResponse {
    User: User,
    List_Permission_Type: [Permission_Type],
    List_User_Permission: [User_Permission],
    messageCode: Int!,
    message: String!,
  }

  type GetUserPermissionResponse {
    List_Permission: [Permission],
    messageCode: Int!,
    message: String!,
  }

  input User_Permission_Input {
    User_Permission_ID: Int,
    Permission_Type_ID: Int,
    User_ID: Int,
    Is_Active: Boolean,
  }

  input UpdateUserInforInput {
    User_ID: Int,
    User_Avatar_File: Upload,
    Surname: String,
    Forename: String,
    User_Job_Roll: String,
    User_Phone_Number: String,
    List_User_Permission: [User_Permission_Input]
  }

  input CreateUserInput {
    User_Avatar_File: Upload,
    Surname: String,
    Forename: String,
    User_Job_Roll: String,
    User_Phone_Number: String,
    User_Email: String,
    List_User_Permission: [User_Permission_Input]
  }

  type CreateUser {
    User_ID: Int,
    messageCode: Int!,
    message: String!,
  }

  # ROOT TYPE
  type Query {
    getListUser: GetListUserResponse,
    getUserInfor(User_ID: Int!): GetUserInforResponse,
    getUserPermission: GetUserPermissionResponse,
  }

  type Mutation {
    changeUserPassword(User_ID: Int!, Current_Password: String, New_Password: String): BaseResponse,
    updateUserInfor(UpdateUserInforInput: UpdateUserInforInput): BaseResponse,
    createUser(CreateUserInput: CreateUserInput): CreateUser
  }
`;

module.exports = typeDefs;