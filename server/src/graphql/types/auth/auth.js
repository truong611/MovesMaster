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

  # ROOT TYPE
  type Query {
    login(email: String!, password: String!, type: String, isActiveMobile: Boolean): ResponseLogin,
    refreshToken(refreshToken: String!): ResponseLogin,
    getProfile: ResponseLogin,
    getSystemParameter(key: String!): ResponseGetSystemParameter,
  }

  type Mutation{
    signResetPassWord(Email:String!,url:String):BaseResponse,
    checkCodeResetPassword(hashCode:String):BaseResponse,
    changeResetPassword(hashCode:String,Password:String!):BaseResponse
    register(forename: String!, surname: String!, email: String!, phone: String, password: String!): ResponseRegister,
    updateProfile(forename: String!, surname: String!, email: String!, phone: String, avatar: String, fileName: String): ResponseUpdateProfile,
    changePassword(passwordOld: String!, passwordNew: String): ResponseChangePassword,
  }
`;

module.exports = typeDefs;
