import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Apollo, gql, QueryRef } from 'apollo-angular';

const _getTotalNotification = gql`
  query Query {
    getTotalNotification {
      Total
      messageCode
      message
    }
  }
`

const _getListMessage = gql`
  query Query($GetListMessageInput: GetListMessageInput) {
    getListMessage(GetListMessageInput: $GetListMessageInput) {
      listMessage {
        Id
        TieuDe
        NoiDung
        NhomNguoiNhan
        PhuongThucGui
        GuiTatCa
        SendDate
        Status
        StatusName
        CreatedDate
      }
      messageCode
      message
    }
  }
`

const _createMessage = gql`
  mutation Mutation($MessageInput: MessageInput!, $files: [Upload]) {
    createMessage(MessageInput: $MessageInput, files: $files) {
      Id
      messageCode
      message
    }
  }
`

const _updateMessage = gql`
  mutation Mutation($Id: Int!, $MessageInput: MessageInput!, $files: [Upload]) {
    updateMessage(Id: $Id, MessageInput: $MessageInput, files: $files) {
      messageCode
      message
    }
  }
`


@Injectable({
  providedIn: 'root'
})
export class MessageAppService {

  _subscriptionNotificationCount = gql`
    subscription Subscription {
      RefreshNotificationCount
    }
  `
  constructor(private apollo: Apollo) { }

  getTotalNotification() {
    return this.apollo
      .watchQuery<any>({
        query: _getTotalNotification,
        fetchPolicy: 'network-only',
      });
  }

  getListMessage(GetListMessageInput: any) {
    return new Promise((resolve, reject) => {
      return this.apollo
        .query<any>({
          query: _getListMessage,
          variables: {
            GetListMessageInput
          },
          fetchPolicy: 'network-only'
        }).toPromise()
        .then(response => {
          resolve(response)
        });
    });
  }

  createMessage(MessageInput: any, files: Array<File>) {
    return new Promise((resolve, reject) => { 
      return this.apollo.mutate({
        mutation: _createMessage,
        variables: {
          MessageInput,
          files
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

  updateMessage(Id: number, MessageInput: any, files: Array<File>) {
    return new Promise((resolve, reject) => {
      return this.apollo.mutate({
        mutation: _updateMessage,
        variables: {
          Id,
          MessageInput,
          files
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
