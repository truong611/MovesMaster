const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type LoginModel {
    User_ID: ID,
    User_Email: String,
    Surname: String,
    Forename: String,
    User_Phone_Number: String,
    User_Avatar: String,
    IsAdmin: Boolean,
    Is_Deleted: Boolean,
    Moves_Company_ID: Int,
    Company_Name: String,
    Company_Icon: String,
    Moves_Charity_ID: Int,
    Charity_Name: String,
    Charity_icon: String,
    Charity_URL: String,
    Type: Int,
    token: String,
    refreshToken: String,
    tokenExpiration: Int,
    Created_Date: Timestamp,
    Is_Remove_Privileges: Boolean,
    Is_Remove_Access: Boolean,
    Is_Mobile_App_User: Boolean,
    Is_Web_App_User: Boolean
  }

  type ResponseLogin {
    user: LoginModel,
    messageCode: Int!,
    message: String!,
    isExistsWeb: Boolean
  } 
  
  type ResponseRegister {
    user: LoginModel,
    messageCode: Int!,
    message: String!,
  } 
  
  type ResponseUpdateProfile {
    user: LoginModel,
    messageCode: Int!,
    message: String!,
  } 
  
  type ResponseChangePassword {
    messageCode: Int!,
    message: String!,
  }
  
  type ResponseGetSystemParameter {
    SystemParameter: SystemParameter!,
    messageCode: Int!,
    message: String!,
  }
  
  type SystemParameter {
    Id: ID,
    Key: String,
    KeyName: String,
    Value: String,
    BoolValue: Boolean,
  }

  type ChangeResetPasswordResponse {
    Is_Reset_Pass_From_Mobile: Boolean,
    messageCode: Int!,
    message: String!,
  }

  # ROOT TYPE
  type Query {
    login(email: String!, password: String!, type: String, isActiveMobile: Boolean): ResponseLogin,
    refreshToken(refreshToken: String!): ResponseLogin,
    getProfile: ResponseLogin,
    getSystemParameter(key: String!): ResponseGetSystemParameter,
  }

  type Mutation{
    signResetPassWord(Email:String!, url:String, type:String):BaseResponse,
    checkCodeResetPassword(hashCode:String):BaseResponse,
    changeResetPassword(hashCode:String,Password:String!):ChangeResetPasswordResponse,
    register(forename: String!, surname: String!, email: String!, phone: String, password: String!, createDate: String!): ResponseRegister,
    updateProfile(forename: String!, surname: String!, email: String!, phone: String, avatar: String, fileName: String): ResponseUpdateProfile,
    changePassword(passwordNew: String): ResponseChangePassword,
  }
`;

module.exports = typeDefs;
