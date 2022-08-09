import { Injectable } from '@angular/core';
import { Apollo, gql } from "apollo-angular";
import { BehaviorSubject, Observable } from "rxjs";
import { Router } from "@angular/router";

const _refreshToken = gql`
  query ExampleQuery($refreshToken: String!) {
    refreshToken(refreshToken: $refreshToken) {
      user {
        User_ID
        User_Email
        Surname
        Forename
        IsAdmin
        Is_Deleted
        Moves_Company_ID
        Moves_Charity_ID
        Company_Name
        Charity_Name
        Charity_icon
        Charity_URL
        User_Avatar
        token
        refreshToken
        Type
        Is_Remove_Privileges
        Is_Mobile_App_User
        Is_Web_App_User
      }
      messageCode
      message
    }
  }
`;

const _login = gql`
  query Query($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      user {
        User_ID
        User_Email
        Surname
        Forename
        IsAdmin
        Is_Deleted
        Moves_Company_ID
        Moves_Charity_ID
        Company_Name
        Charity_Name
        Charity_icon
        Charity_URL
        User_Avatar
        token
        refreshToken
        Type
        Is_Remove_Privileges
        Is_Mobile_App_User
        Is_Web_App_User
      }
      messageCode
      message
    }
  }
`;

const _signup = gql`
    mutation Mutation($bodyData: CharityUserInput!) {
    createCharity(bodyData: $bodyData) {
        messageCode
        message
    }
  }
`;

const _signResetPassWord = gql`
  mutation Mutation($Email: String!, $url: String) {
    signResetPassWord(Email: $Email, url: $url) {
      messageCode
      message
    }
  }
`

const _checkCodeResetPassword = gql`
  mutation Mutation($hashCode:String) {
    checkCodeResetPassword(hashCode: $hashCode) {
      messageCode
      message
    }
  }
`

const _changeResetPassword = gql`
  mutation Mutation($hashCode:String, $Password:String!) {
    changeResetPassword(hashCode: $hashCode, Password:$Password) {
      messageCode
      message
    }
  }
`

@Injectable({
  providedIn: 'root'
})

export class AuthenticationService {
  private userSubject: BehaviorSubject<any>;
  public user: Observable<any>;

  constructor(private apollo: Apollo,
    private router: Router) {
    this.userSubject = new BehaviorSubject<any>(JSON.parse(localStorage.getItem('user')));
    this.user = this.userSubject.asObservable();
  }

  public setUser(value): any {
    this.userSubject.next(value);
  }

  public getUser(): any {
    return this.userSubject.value;
  }

  login(email, password) {
    this.removeWebStorage();
    return this.apollo
      .watchQuery<any>({
        query: 
        _login,
        variables: {
          email,
          password
        },
      });
  }

  signup(bodyData: any) {
    return new Promise((resolve, reject) => {
      return this.apollo.mutate({
        mutation: _signup,
        variables: {
          "bodyData": {
            "Charity_Name": bodyData?.Charity_Name,
            "Charity_Commission_No": bodyData?.Charity_Commission_No,
            "Contact_Name": bodyData?.Contact_Name,
            "Contact_Email": bodyData?.Contact_Email,
            "Contact_Phone_Number": bodyData?.Contact_Phone_Number,
          }
        },
      }).toPromise()
        .then(response => {
          resolve(response)
        });
    });
    
    // return this.apollo.mutate({
    //   mutation: _signup,
    //   variables: {
    //     "bodyData": {
    //       "Charity_Name": bodyData?.Charity_Name,
    //       "Charity_Commission_No": bodyData?.Charity_Commission_No,
    //       "Contact_Name": bodyData?.Contact_Name,
    //       "Contact_Email": bodyData?.Contact_Email,
    //       "Contact_Phone_Number": bodyData?.Contact_Phone_Number,
    //     }
    //   }
    // })
  }

  refreshToken(refreshToken) {
    return new Promise((resolve, reject) => {
      return this.apollo
        .query<any>({
          query: _refreshToken,
          variables: {
            refreshToken
          },
          fetchPolicy: 'network-only'
        }).toPromise()
        .then(response => {
          resolve(response)
        });
    });
  }

  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('user');
    this.userSubject.next(null);

    /* remove sessionStorage and localStorage */
    this.removeWebStorage();
    /* End */

    this.router.navigate(['/login']);
  }

  removeWebStorage() {
    
  }

  async signResetPassWord(Email: string, url: string) {
    return this.apollo.mutate({
      mutation: _signResetPassWord,
      variables: {
        Email,
        url
      }
    }).toPromise().then((res: any) => {
      return res.data.signResetPassWord
    })
  }

  async checkCodeResetPassword(hashCode) {
    return this.apollo.mutate({
      mutation: _checkCodeResetPassword,
      variables: {
        hashCode
      }
    }).toPromise().then((res: any) => {
      return res.data.checkCodeResetPassword
    })
  }

  async changeResetPassword(hashCode: string, Password: string) {
    return this.apollo.mutate({
      mutation: _changeResetPassword,
      variables: {
        hashCode,
        Password
      }
    }).toPromise().then((res: any) => {
      return res.data.changeResetPassword
    })
  }


}
