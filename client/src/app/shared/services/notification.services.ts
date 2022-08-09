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

const _getListNotification = gql`
  query Query {
    getListNotification {
      ListNotification {
        Notification_ID
        Notification_From_User_ID
        Notification_From_Charity_ID
        Notification_To_Charity_ID
        Notification_From_Company_ID
        Notification_To_Company_ID
        Content
        Created_Date
        Is_Seen
        URL
        Name
        Email
      }
      messageCode
      message
    }
  }
`

const _getListAllNotification = gql`
  query Query {
    getListAllNotification {
      ListNotification {
        Notification_ID
        Notification_From_User_ID
        Notification_From_Charity_ID
        Notification_To_Charity_ID
        Notification_From_Company_ID
        Notification_To_Company_ID
        Content
        Created_Date
        Is_Seen
        URL
        Name
        Email
      }
      messageCode
      message
    }
  }
`

const _createNotification = gql`
  mutation Mutation($bodyData: CreateNotificationInput) {
    createNotification(bodyData: $bodyData) {
      messageCode
      message
    }
  }
`

const _updateIsSeenNotification = gql`
  mutation Mutation($Id: Int!) {
    updateIsSeenNotification(Id: $Id) {
      messageCode
      message
    }
  }
`

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
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

  getListNotification() {
    return new Promise((resolve, reject) => {
      return this.apollo
        .query<any>({
          query: _getListNotification,
          variables: {
          },
          fetchPolicy: 'network-only'
        }).toPromise()
        .then(response => {
          resolve(response)
        });
    });
  }

  getListAllNotification() {
    return new Promise((resolve, reject) => {
      return this.apollo
        .query<any>({
          query: _getListAllNotification,
          variables: {
          },
          fetchPolicy: 'network-only'
        }).toPromise()
        .then(response => {
          resolve(response)
        });
    });
  }

  createNotification(bodyData: any) {
    return new Promise((resolve, reject) => {
      return this.apollo.mutate({
        mutation: _createNotification,
        variables: {
          bodyData
        }
      }).toPromise()
        .then(response => {
          resolve(response)
        });
    });
  }

  updateIsSeenNotification(Id: number) {
    return new Promise((resolve, reject) => {
      return this.apollo.mutate({
        mutation: _updateIsSeenNotification,
        variables: {
          Id
        },
      }).toPromise()
        .then(response => {
          resolve(response)
        });
    });
  }
}