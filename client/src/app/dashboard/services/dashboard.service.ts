import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Apollo, gql, QueryRef } from 'apollo-angular';

import { DashboardCharity } from '../models/charity.model';
import { DashboardCompany } from '../models/charity.model';
import { Company } from '../models/charity.model';

const _getDashboardProfile = gql`
  query Query ($type: Int!, $objectId: Int){
    getDashboardProfile (type: $type, objectId: $objectId) {
      Charity {
        Moves_Charity_ID
        Charity_Name
        Charity_Commission_No
        Contact_Name
        Contact_Forename
        Contact_Surname
        Contact_Email
        Contact_Phone_Number
        Charity_URL
        Charity_Aims
        Charity_icon
        Charity_Geographical_Scope
        Charity_Income_Band_ID
        Charity_Date_Founded
        Date_Active
        Charity_Geographical_Scope_Name
        Charity_Income_Band_Name
        Charity_Sector
        List_Charity_Sector_ID
        Is_Remove_Privileges
        Is_Remove_Access
        Address_For_Invoice
        Payment_Site_Url
        Account_Name
        Account_No
        Sort_Code
        Member_Payment_Site_Url
        Member_Account_Name
        Member_Account_No
        Member_Sort_Code
        Renewal_Date
      }
      Company {
        Moves_Company_ID
        Company_Name
        Company_Number
        Company_URL
        Company_Icon
        Company_CSR_Statement
        Is_Active
        Contact_Name
        Contact_Forename
        Contact_Surname
        Contact_Email
        Contact_Phone_Number
        Date_Active
        Is_Remove_Privileges
        Is_Remove_Access
      }
      List_Geographical_Scope {
        Category_ID
        Category_Name
      }
      List_Income_Band {
        Category_ID
        Category_Name
      }
      List_Sector {
        Category_ID
        Category_Name
      }
      List_Action_History {
        Id
        Object_Id
        Object_Type
        Action
        Action_Date
        By
        Surname
        Forename
      }
      TotalCharityNotActive
      TotalCompanyNotActive
      TotalCharityInvitation
      messageCode
      message
    }
  }
`

const _getDashboardAccountInfo = gql`
  query Query ($type: Int!, $objectId: Int){
    getDashboardAccountInfo (type: $type, objectId: $objectId) {
      Role
      User_Id
      Surname
      Forename
      User_Email
      messageCode
      message
    }
  }
`

const _getDashboardNews = gql`
  query Query ($type: Int!, $objectId: Int){
    getDashboardNews (type: $type, objectId: $objectId) {
      ListNew {
        News_Item_ID
        News_Image
        News_Title
        News_Content
      }
      messageCode
      message
    }
  }
`

const _getDashboardReport = gql`
  query Query ($type: Int!, $objectId: Int){
    getDashboardReport (type: $type, objectId: $objectId) {
      TotalAppeal
      TotalCampaign
      TotalDonation
      TotalCharityActive
      TotalCompanyActive
      TotalMove
      TotalMatchOfCompany
      messageCode
      message
    }
  }
`

const _getDirectory = gql`
  query Query{
    getDirectory {
      ListGeographicScope {
        Category_ID
        Category_Name
      }
      ListIncomeBand {
        Category_ID
        Category_Name
      }
      ListCharitySector {
        Category_ID
        Category_Name
      }
      ListCharity {
        Moves_Charity_ID
        Charity_Name
        Charity_Commission_No
        Charity_URL
        Contact_Email
        Contact_Phone_Number
        Charity_Geographical_Scope
        Charity_Income_Band_ID
        List_Charity_Sector_ID
      }
      ListCompany {
        Moves_Company_ID
        Company_Name
        Company_Number
        Company_URL
        Contact_Email
        Contact_Phone_Number
      }
      messageCode
      message
    }
  }
`

const _updateDashboardCharity = gql`
  mutation Mutation($UpdateDashboardCharityInput: UpdateDashboardCharityInput) {
    updateDashboardCharity(UpdateDashboardCharityInput: $UpdateDashboardCharityInput) {
      messageCode
      message
    }
  }
`

const _updateDashboardCompany = gql`
  mutation Mutation($UpdateDashboardCompanyInput: UpdateDashboardCompanyInput) {
    updateDashboardCompany(UpdateDashboardCompanyInput: $UpdateDashboardCompanyInput) {
      messageCode
      message
    }
  }
`

const _createCompany = gql`
  mutation Mutation($CreateCompanyInput: CreateCompanyInput) {
    createCompany(CreateCompanyInput: $CreateCompanyInput) {
      messageCode
      message
    }
  }
`
const _updateRemovePrivileges = gql`
  mutation Mutation($type: Int!, $objectId: Int!) {
    updateRemovePrivileges(type: $type, objectId: $objectId) {
      messageCode
      message
    }
  }
`

const _updateRemoveAccess = gql`
  mutation Mutation($type: Int!, $objectId: Int!) {
    updateRemoveAccess(type: $type, objectId: $objectId) {
      messageCode
      message
    }
  }
`

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(private apollo: Apollo) { }

  getDashboardProfile(type: Number, objectId: Number) {
    return new Promise((resolve, reject) => {
      return this.apollo
        .query<any>({
          query: _getDashboardProfile,
          variables: {
            type: type,
            objectId: objectId
          },
          fetchPolicy: 'network-only'
        }).toPromise()
        .then(response => {
          resolve(response)
        });
    });
  }

  getDashboardAccountInfo(type: Number, objectId: Number) {
    return new Promise((resolve, reject) => {
      return this.apollo
        .query<any>({
          query: _getDashboardAccountInfo,
          variables: {
            type: type,
            objectId: objectId
          },
          fetchPolicy: 'network-only'
        }).toPromise()
        .then(response => {
          resolve(response)
        });
    });
  }

  getDashboardNews(type: Number, objectId: Number) {
    return new Promise((resolve, reject) => {
      return this.apollo
        .query<any>({
          query: _getDashboardNews,
          variables: {
            type: type,
            objectId: objectId
          },
          fetchPolicy: 'network-only'
        }).toPromise()
        .then(response => {
          resolve(response)
        });
    });
  }

  getDashboardReport(type: Number, objectId: Number) {
    return new Promise((resolve, reject) => {
      return this.apollo
        .query<any>({
          query: _getDashboardReport,
          variables: {
            type: type,
            objectId: objectId
          },
          fetchPolicy: 'network-only'
        }).toPromise()
        .then(response => {
          resolve(response)
        });
    });
  }

  getDirectory() {
    return new Promise((resolve, reject) => {
      return this.apollo
        .query<any>({
          query: _getDirectory,
          variables: {
          },
          fetchPolicy: 'network-only'
        }).toPromise()
        .then(response => {
          resolve(response)
        });
    });
  }

  updateDashboardCharity(UpdateDashboardCharityInput: DashboardCharity) {
    return new Promise((resolve, reject) => {
      return this.apollo.mutate({
        mutation: _updateDashboardCharity,
        variables: {
          UpdateDashboardCharityInput
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

  updateDashboardCompany(UpdateDashboardCompanyInput: DashboardCompany) {
    return new Promise((resolve, reject) => {
      return this.apollo.mutate({
        mutation: _updateDashboardCompany,
        variables: {
          UpdateDashboardCompanyInput
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

  createCompany(CreateCompanyInput: Company) {
    return new Promise((resolve, reject) => {
      return this.apollo.mutate({
        mutation: _createCompany,
        variables: {
          CreateCompanyInput
        },
      }).toPromise()
        .then(response => {
          resolve(response)
        });
    });
  }

  updateRemovePrivileges(type: Number, objectId: Number) {
    return new Promise((resolve, reject) => {
      return this.apollo.mutate({
        mutation: _updateRemovePrivileges,
        variables: {
          type,
          objectId
        },
      }).toPromise()
        .then(response => {
          resolve(response)
        });
    });
  }

  updateRemoveAccess(type: Number, objectId: Number) {
    return new Promise((resolve, reject) => {
      return this.apollo.mutate({
        mutation: _updateRemoveAccess,
        variables: {
          type,
          objectId
        },
      }).toPromise()
        .then(response => {
          resolve(response)
        });
    });
  }

}