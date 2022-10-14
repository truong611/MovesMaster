import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Apollo, gql, QueryRef } from 'apollo-angular';

const _getMasterDataCreateCampaign = gql`
  query Query ($ObjectId: Int, $ObjectType: String) {
    getMasterDataCreateCampaign(ObjectId: $ObjectId, ObjectType: $ObjectType) {
      ListAppeal {
        Appeal_ID
        Appeal_Name
        Moves_Charity_ID
        Appeal_Icon
        Appeal_Start_Date
        Appeal_End_Date
        Appeal_URL
      }
      ListCompany {
        Moves_Company_ID
        Company_Name
        Company_Icon
        Company_URL
      }
      # ListCurrency {
      #   Currency_ID
      #   Currency_Name
      # }
      messageCode
      message
    }
  }
`;

const _createCampaign = gql`
  mutation Mutation($CreateCampaignInput: CreateCampaignInput) {
    createCampaign(CreateCampaignInput: $CreateCampaignInput) {
      Campaign_ID
      messageCode
      message
    }
  }
`;

const _getDetailCampaign = gql`
  query Query($Campaign_ID: Int!) {
    getDetailCampaign(Campaign_ID: $Campaign_ID) {
      Campaign {
        Campaign_ID
        Appeal_ID
        Moves_Charity_ID
        Campaign_Name
        Campaign_Description
        Campaign_URL
        Campaign_Icon
        Campaign_Launch_Date
        Campaign_End_Date
        Campaign_Target_Value
        Campaign_Price_Per_Move
        Moves_Company_ID
        End_Date_Target
        Campaign_Status_ID
        Public_Private
        Is_Match
        # Currency_ID
        Campaign_Status_Name
        Charity_Name
        Charity_icon
        Charity_URL
        Company_Name
        Appeal_Name
        Amount_Raised
        Number_Matches
        Sterling_Amount
        Progress_Donations
        Progress_Moves
      }
      ListAppeal {
        Appeal_ID
        Appeal_Name
        Moves_Charity_ID
        Appeal_Icon
        Appeal_Start_Date
        Appeal_End_Date
        Appeal_URL
      }
      ListCompany {
        Moves_Company_ID
        Company_Name
        Company_Icon
        Company_URL
      }
      # ListCurrency {
      #   Currency_ID
      #   Currency_Name
      # }
      IsShowButtonEdit
      IsShowButtonPublish
      IsShowButtonApprove
      IsShowButtonDecline
      IsShowButtonCreateMatch
      PercentageDiscount
      messageCode
      message
    }
  }
`

const _getListCampaign = gql`
  query Query($ObjectId: Int, $ObjectType: String) {
    getListCampaign(ObjectId: $ObjectId, ObjectType: $ObjectType) {
      ListCampaign {
        Campaign_ID
        Appeal_ID
        Moves_Charity_ID
        Campaign_Name
        Campaign_Description
        Campaign_URL
        Campaign_Icon
        Campaign_Launch_Date
        Campaign_End_Date
        Campaign_Target_Value
        Campaign_Price_Per_Move
        Moves_Company_ID
        End_Date_Target
        Campaign_Status_ID
        Public_Private
        Is_Match
        Campaign_Status_Name
        Charity_Name
        Company_Name
        Appeal_Name
        Amount_Raised
        Progress_Number
        Progress_Date
        Number_Matches
      }
      ListStatus {
        Category_ID
        Category_Name
      }
      IsShowButtonCreateCampaign
      messageCode
      message
    }
  }
`

const _approveCampaign = gql`
  mutation Mutation($Password: String!, $Id: Int!, $Mode: String!) {
    approveCampaign(Password: $Password, Id: $Id, Mode: $Mode) {
      messageCode
      message
    }
  }
`

const _publishCampaign = gql`
  mutation Mutation($Password: String!, $Id: Int!) {
    publishCampaign(Password: $Password, Id: $Id) {
      messageCode
      message
    }
  }
`

const _declineCampaign = gql`
  mutation Mutation($Id: Int!) {
    declineCampaign(Id: $Id) {
      messageCode
      message
    }
  }
`

const _updateCampaign = gql`
  mutation Mutation($bodyData: UpdateCampaignInput) {
    updateCampaign(bodyData: $bodyData) {
      messageCode
      message
    }
  }
`

@Injectable({
  providedIn: 'root'
})
export class CampaignService {
  constructor(private apollo: Apollo) { }

  getMasterDataCreateCampaign(ObjectId: number, ObjectType: string) {
    return new Promise((resolve, reject) => {
      return this.apollo
        .query<any>({
          query: _getMasterDataCreateCampaign,
          variables: {
            ObjectId: ObjectId,
            ObjectType: ObjectType
          },
          fetchPolicy: 'network-only'
        }).toPromise()
        .then(response => {
          resolve(response)
        });
    });
  }

  createCampaign(CreateCampaignInput: any) {
    return new Promise((resolve, reject) => {
      return this.apollo.mutate({
        mutation: _createCampaign,
        variables: {
          CreateCampaignInput
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

  getDetailCampaign(Campaign_ID: number) {
    return new Promise((resolve, reject) => {
      return this.apollo
        .query<any>({
          query: _getDetailCampaign,
          variables: {
            Campaign_ID: Campaign_ID,
          },
          fetchPolicy: 'network-only'
        }).toPromise()
        .then(response => {
          resolve(response)
        });
    });
  }

  getListCampaign(ObjectId: number, ObjectType: string) {
    return new Promise((resolve, reject) => {
      return this.apollo
        .query<any>({
          query: _getListCampaign,
          variables: {
            ObjectId: ObjectId,
            ObjectType: ObjectType
          },
          fetchPolicy: 'network-only'
        }).toPromise()
        .then(response => {
          resolve(response)
        });
    });
  }

  approveCampaign(Password: string, Id: number, Mode: string) {
    return new Promise((resolve, reject) => {
      return this.apollo.mutate({
        mutation: _approveCampaign,
        variables: {
          Password: Password,
          Id: Id,
          Mode: Mode
        },
      }).toPromise()
        .then(response => {
          resolve(response)
        });
    });
  }

  publishCampaign(Password: string, Id: number) {
    return new Promise((resolve, reject) => {
      return this.apollo.mutate({
        mutation: _publishCampaign,
        variables: {
          Password: Password,
          Id: Id
        },
      }).toPromise()
        .then(response => {
          resolve(response)
        });
    });
  }

  declineCampaign(Id: number) {
    return new Promise((resolve, reject) => {
      return this.apollo.mutate({
        mutation: _declineCampaign,
        variables: {
          Id: Id
        },
      }).toPromise()
        .then(response => {
          resolve(response)
        });
    });
  }

  updateCampaign(bodyData: any) {
    return new Promise((resolve, reject) => {
      return this.apollo.mutate({
        mutation: _updateCampaign,
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
}