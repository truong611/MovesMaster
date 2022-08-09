import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';

const _getListCompanyNotActive = gql`
  query Query {
    getListCompanyNotActive {
      ListCompany {
        Moves_Company_ID
        Company_Name
        Company_Number
        Contact_Name
        Contact_Email
        Contact_Phone_Number
        Created_Date
        CharityInfor {
          Charity_Name
          Charity_Commission_No
          Contact_Name
          Contact_Phone_Number
          Contact_Email
        }
      }
      messageCode
      message
    }
  }
`;

const _approveCompany = gql`
  mutation Mutation($Id: Int!) {
    approveCompany(Id: $Id) {
      messageCode
      message
    }
  }
`

const _denyCompany = gql`
  mutation Mutation($Id: Int!) {
    denyCompany(Id: $Id) {
      messageCode
      message
    }
  }
`

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  constructor(private apollo: Apollo) {
  }

  getListCompanyNotActive() {
    return new Promise((resolve, reject) => {
      return this.apollo
        .query<any>({
          query: _getListCompanyNotActive,
          variables: {
          },
          fetchPolicy: 'network-only'
        }).toPromise()
        .then(response => {
          resolve(response)
        });
    });
  }

  approveCompany(Id: Number) {
    return new Promise((resolve, reject) => {
      return this.apollo.mutate({
        mutation: _approveCompany,
        variables: {
          Id
        },
      }).toPromise()
        .then(response => {
          resolve(response)
        });
    });
  }

  denyCompany(Id: Number) {
    return new Promise((resolve, reject) => {
      return this.apollo.mutate({
        mutation: _denyCompany,
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