import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';

const _getListCharityNotActive = gql`
  query Query {
    getListCharityNotActive {
      ListCharity {
        Moves_Charity_ID
        Charity_Name
        Charity_Commission_No
        Contact_Name
        Contact_Email
        Contact_Phone_Number
        Created_Date
        Charity_Type
      }
      messageCode
      message
    }
  }
`;

const _checkCharityInfor = gql`
  query Query($Id: Int!, $Mode: String!) {
    checkCharityInfor(Id: $Id, Mode: $Mode) {
      Url
      messageCode
      message
    }
  }
`;

const _getListCharityInvitation = gql`
  query Query {
    getListCharityInvitation {
      ListCharity {
        Moves_Charity_ID
        Charity_Name
        Contact_Email
        Created_By
        Created_Date
        Charity_Type
      }
      messageCode
      message
    }
  }
`;

const _approveCharity = gql`
  mutation Mutation($Id: Int!) {
    approveCharity(Id: $Id) {
      messageCode
      message
    }
  }
`

const _denyCharity = gql`
  mutation Mutation($Id: Int!) {
    denyCharity(Id: $Id) {
      messageCode
      message
    }
  }
`

const _charityInvitation = gql`
  query Query($Id: Int!) {
    charityInvitation(Id: $Id) {
      messageCode
      message
    }
  }
`;

const _checkExistsEmailByCharityEmail = gql`
  query Query($Contact_Email: String!) {
    checkExistsEmailByCharityEmail(Contact_Email: $Contact_Email) {
      IsExists
      Contact_Name
      Contact_Phone_Number
      Contact_Email
      messageCode
      message
    }
  }
`;

@Injectable({
  providedIn: 'root'
})
export class CharityService {
  constructor(private apollo: Apollo) {
  }

  getListCharityNotActive() {
    return new Promise((resolve, reject) => {
      return this.apollo
        .query<any>({
          query: _getListCharityNotActive,
          variables: {
          },
          fetchPolicy: 'network-only'
        }).toPromise()
        .then(response => {
          resolve(response)
        });
    });
  }

  checkCharityInfor(Id: Number, Mode: string) {
    return new Promise((resolve, reject) => {
      return this.apollo
        .query<any>({
          query: _checkCharityInfor,
          variables: {
            Id,
            Mode
          },
          fetchPolicy: 'network-only'
        }).toPromise()
        .then(response => {
          resolve(response)
        });
    });
  }

  getListCharityInvitation() {
    return new Promise((resolve, reject) => {
      return this.apollo
        .query<any>({
          query: _getListCharityInvitation,
          variables: {
          },
          fetchPolicy: 'network-only'
        }).toPromise()
        .then(response => {
          resolve(response)
        });
    });
  }

  approveCharity(Id: Number) {
    return new Promise((resolve, reject) => {
      return this.apollo.mutate({
        mutation: _approveCharity,
        variables: {
          Id
        },
      }).toPromise()
        .then(response => {
          resolve(response)
        });
    });
  }

  denyCharity(Id: Number) {
    return new Promise((resolve, reject) => {
      return this.apollo.mutate({
        mutation: _denyCharity,
        variables: {
          Id
        },
      }).toPromise()
        .then(response => {
          resolve(response)
        });
    });
  }

  charityInvitation(Id: Number) {
    return new Promise((resolve, reject) => {
      return this.apollo
        .query<any>({
          query: _charityInvitation,
          variables: {
            Id
          },
          fetchPolicy: 'network-only'
        }).toPromise()
        .then(response => {
          resolve(response)
        });
    });
  }

  checkExistsEmailByCharityEmail(Contact_Email: String) {
    return new Promise((resolve, reject) => {
      return this.apollo
        .query<any>({
          query: _checkExistsEmailByCharityEmail,
          variables: {
            Contact_Email
          },
          fetchPolicy: 'network-only'
        }).toPromise()
        .then(response => {
          resolve(response)
        });
    });
  }
}