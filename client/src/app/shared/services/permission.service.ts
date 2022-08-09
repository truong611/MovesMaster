import { Injectable } from '@angular/core';
import { Apollo, gql, QueryRef } from 'apollo-angular';


const _getUserPermission = gql`
  query Query {
    getUserPermission {
      List_Permission {
        Permission_Type_Name
        Permission_Type_Code
        Is_Active
      }
      messageCode
      message
    }
  }
`


@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  constructor(private apollo: Apollo) { }

  getUserPermission() {
    return new Promise((resolve, reject) => {
      return this.apollo
        .query<any>({
          query: _getUserPermission,
          variables: {
             
          },
          fetchPolicy: 'network-only'
        }).toPromise()
        .then(response => {
          resolve(response)
        });
    });
  }
}