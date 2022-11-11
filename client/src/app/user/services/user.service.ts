import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Apollo, gql, QueryRef } from 'apollo-angular';

import { UserInforModel } from './../models/user.model';

const _getListUser = gql`
  query Query {
    getListUser {
      ListUser {
        User_ID
        User_Email
        User_Phone_Number
        Surname
        Forename
        User_Avatar
        User_Job_Roll
        IsAdmin
        Is_Mobile_App_User
        Is_Web_App_User
        Moves_Company_ID
        Moves_Charity_ID
      }
      messageCode
      message
    }
  }
`

const _getUserInfor = gql`
  query Query ($User_ID: Int!){
    getUserInfor (User_ID: $User_ID) {
      User {
        User_ID
        User_Email
        User_Phone_Number
        Surname
        Forename
        User_Avatar
        User_Job_Roll
        IsAdmin
        Is_Mobile_App_User
        Is_Web_App_User
        Moves_Company_ID
        Moves_Charity_ID
      }
      List_Permission_Type {
        Permission_Type_ID
        Permission_Type_Name
        Permission_Type_Code
        Type
      }
      List_User_Permission {
        User_Permission_ID
        Permission_Type_ID
        User_ID
        Is_Active
      }
      messageCode
      message
    }
  }
`

const _changeUserPassword = gql`
  mutation Mutation($User_ID: Int!, $New_Password: String) {
    changeUserPassword(User_ID: $User_ID, New_Password: $New_Password) {
      messageCode
      message
    }
  }
`

const _updateUserInfor = gql`
  mutation Mutation($UpdateUserInforInput: UpdateUserInforInput) {
    updateUserInfor(UpdateUserInforInput: $UpdateUserInforInput) {
      messageCode
      message
    }
  }
`

const _createUser = gql`
  mutation Mutation($CreateUserInput: CreateUserInput) {
    createUser(CreateUserInput: $CreateUserInput) {
      User_ID
      messageCode
      message
    }
  }
`

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private apollo: Apollo) { }

  getListUser() {
    return new Promise((resolve, reject) => {
      return this.apollo
        .query<any>({
          query: _getListUser,
          variables: {
          },
          fetchPolicy: 'network-only'
        }).toPromise()
        .then(response => {
          resolve(response)
        });
    });
  }

  getUserInfor(User_ID: Number) {
    return new Promise((resolve, reject) => {
      return this.apollo
        .query<any>({
          query: _getUserInfor,
          variables: {
            User_ID
          },
          fetchPolicy: 'network-only'
        }).toPromise()
        .then(response => {
          resolve(response)
        });
    });
  }

  changeUserPassword(User_ID: Number, New_Password: String) {
    return new Promise((resolve, reject) => {
      return this.apollo.mutate({
        mutation: _changeUserPassword,
        variables: {
          User_ID,
          // Current_Password,
          New_Password
        }
      }).toPromise()
        .then(response => {
          resolve(response)
        });
    });
  }

  updateUserInfor(UpdateUserInforInput: UserInforModel) {
    return new Promise((resolve, reject) => {
      return this.apollo.mutate({
        mutation: _updateUserInfor,
        variables: {
          UpdateUserInforInput
        },
        context: {
          useMultipart: true
        }
      }).toPromise()
        .then(response => {
          resolve(response)
        });
    });
  }

  createUser(CreateUserInput: UserInforModel) {
    return new Promise((resolve, reject) => {
      return this.apollo.mutate({
        mutation: _createUser,
        variables: {
          CreateUserInput
        },
        context: {
          useMultipart: true
        }
      }).toPromise()
        .then(response => {
          resolve(response)
        });
    });
  }

}