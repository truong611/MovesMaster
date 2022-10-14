import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Apollo, gql } from 'apollo-angular';
import { BehaviorSubject, Observable } from 'rxjs';

const _getDetailCharity = gql`
  query Query($Id: Int!) {
    getDetailCharity(Id: $Id) {
      Charity {
        Charity_Name
        Charity_icon
        Charity_URL
      }
      messageCode
      message
    }
  }
`;

const _getDetailAppeal = gql`
  query GetDetailAppeal($Appeal_ID: Int!) {
    getDetailAppeal(Appeal_ID: $Appeal_ID) {
      Appeal {
        Appeal_ID
        Appeal_Name
        Moves_Charity_ID
        Appeal_Status_ID
        Appeal_URL
        Appeal_Icon
        Appeal_Description
        Appeal_Target_Amount
        Appeal_Start_Date
        Appeal_End_Date
        Appeal_Status_Name
        Amount_Raised
        Charity_Name
        Charity_icon
        Charity_URL
        TotalCampaign
        TotalMove
      }
      isShowButtonCreateCampaign
      isShowButtonEdit
      isShowButtonPublish
      isShowButtonAbandon
      messageCode
      message
    }
  }
`;

const _createAppeal = gql`
  mutation Mutation($bodyData: CreateAppealInput){
    createAppeal(bodyData: $bodyData) {
      Appeal_ID
      messageCode
      message
    }
  }
`;

const _updateAppeal = gql`
  mutation Mutation($bodyData: UpdateAppealInput){
    updateAppeal(bodyData: $bodyData) {
      messageCode
      message
    }
  }
`;

const _publishAppeal = gql`
  mutation Mutation($Appeal_ID: Int!) {
    publishAppeal(Appeal_ID: $Appeal_ID) {
      messageCode
      message
    }
  }
`;

const _abandonAppeal = gql`
  mutation Mutation($Appeal_ID: Int!) {
    abandonAppeal(Appeal_ID: $Appeal_ID) {
      messageCode
      message
    }
  }
`;

const _getListAppeal = gql`
  query Query($Moves_Charity_ID: Int!) {
    getListAppeal(Moves_Charity_ID: $Moves_Charity_ID) {
      ListStatus {
        Category_ID
        Category_Name
      }
      Total
      ListAppeal {
        Appeal_ID
        Appeal_Name
        Moves_Charity_ID
        Appeal_Status_ID
        Appeal_URL
        Appeal_Icon
        Appeal_Description
        Appeal_Target_Amount
        Appeal_Start_Date
        Appeal_End_Date
        Create_Date
        Create_By
        Last_Modify_Date
        Last_Modify_By
        Appeal_Status_Name
        Amount_Raised
        Live_Campaign
      }
      messageCode
      message
    }
  }
`

@Injectable({
  providedIn: 'root'
})
export class AppealService {
  public appealSubject: BehaviorSubject<any>;
  public appeals: Observable<any>

  constructor(private apollo: Apollo,
    private router: Router) {
    this.appealSubject = new BehaviorSubject<any>(JSON.parse(localStorage.getItem('appeal')));
    this.appeals = this.appealSubject.asObservable();
  }

  getDetailCharity(Id: number) {
    return new Promise((resolve, reject) => {
      return this.apollo
        .query<any>({
          query: _getDetailCharity,
          variables: {
            Id: Id
          },
          fetchPolicy: 'network-only'
        }).toPromise()
        .then(response => {
          resolve(response)
        });
    });
  }

  createAppeal(bodyData: any) {
    return new Promise((resolve, reject) => {
      return this.apollo.mutate({
        mutation: _createAppeal,
        variables: {
          bodyData: bodyData
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

  getDetailAppeal(Appeal_ID: number) {
    return new Promise((resolve, reject) => {
      return this.apollo
        .query<any>({
          query: _getDetailAppeal,
          variables: {
            Appeal_ID: Appeal_ID
          },
          fetchPolicy: 'network-only'
        }).toPromise()
        .then(response => {
          resolve(response)
        });
    });
  }

  updateAppeal(bodyData: any) {
    return new Promise((resolve, reject) => {
      return this.apollo.mutate({
        mutation: _updateAppeal,
        variables: {
          bodyData: bodyData
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

  publishAppeal(Appeal_ID: number) {
    return new Promise((resolve, reject) => {
      return this.apollo.mutate({
        mutation: _publishAppeal,
        variables: {
          Appeal_ID: Appeal_ID
        },
      }).toPromise()
        .then(response => {
          resolve(response)
        });
    });
  }

  abandonAppeal(Appeal_ID: number) {
    return new Promise((resolve, reject) => {
      return this.apollo.mutate({
        mutation: _abandonAppeal,
        variables: {
          Appeal_ID: Appeal_ID
        },
      }).toPromise()
        .then(response => {
          resolve(response)
        });
    });
  }

  getListAppeal(Moves_Charity_ID: number) {
    return new Promise((resolve, reject) => {
      return this.apollo
        .query<any>({
          query: _getListAppeal,
          variables: {
            Moves_Charity_ID
          },
          fetchPolicy: 'network-only'
        }).toPromise()
        .then(response => {
          resolve(response)
        });
    });
  }

}
