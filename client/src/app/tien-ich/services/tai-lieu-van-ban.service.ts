import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Apollo, gql, QueryRef } from 'apollo-angular';

const _getListThuMuc = gql`
  query Query {
    getListThuMuc {
      listThuMuc {
        Id
        TenThuMuc
        Path
        ParentID
      }
      messageCode
      message
    }
  }
`

const _createFolder = gql`
  mutation Mutation($body: inputThuMuc) {
    createFolder(body: $body) {
      ThuMuc {
      Id
      TenThuMuc
      Path
      ParentID
    }
      messageCode
      message
    }
  }
`
const _updateFolder = gql`
  mutation Mutation($Id: ID!, $body: inputThuMuc) {
    updateFolder(Id:$Id, body: $body) {
      messageCode
      message
    }
  }
`

const _deleteFolder = gql`
  mutation Mutation($Id: ID!) {
    deleteFolder(Id: $Id) {
      messageCode
      message
    }
  }
`;



//Tai liêu

const _getListTaiLieu = gql`
  query Query {
    getListTaiLieu {
    listTaiLieu {
      Id
      TenTaiLieu
      MaTaiLieu
      NgayBanHanh
      MaTrichYeu
      ThuMuc_Id
      FileName
      TenNoiBanHanh
      NoiBanHanh
    }
    messageCode
    message
  }
  }
`

const _getTaiLieuByThuMucID = gql`
  query Query($ThuMuc_Id: Int!){
    getListTaiLieuByThuMucId(ThuMuc_Id: $ThuMuc_Id){
      listTaiLieu {
        Id
        TenTaiLieu
        MaTaiLieu
        NgayBanHanh
        MaTrichYeu
        ThuMuc_Id
        FileName
        NoiBanHanh
      }
      messageCode
      message
    }
  }
`
const _zipFile = gql`
  query Query($Id: ID!) {
    zipFile(Id: $Id) {
      messageCode
      message
      data
    }
  }
`;

const _createTaiLieu = gql`
  mutation CreateTaiLieu($bodyData: inputTaiLieu! ) {
    createTaiLieu(bodyData: $bodyData) {
      messageCode
      message
    }
  }
`
const _updateTaiLieu = gql`
  mutation UpdateTaiLieu($Id: ID!, $body: inputTaiLieu) {
    updateTaiLieu(Id: $Id, body: $body) {
      messageCode
      message
    }
}
`

const _deleteTaiLieu = gql`
  mutation Mutation($Id: ID!) {
    deleteTaiLieu(Id: $Id) {
      messageCode
      message
    }
  }
`;

const _downloadTaiLieu = gql`
  mutation DownloadTaiLieuMutation($Id: Int!) {
    downloadTaiLieu(Id: $Id) {
      type
      messageCode
      message
      base64
    }
  }
`;



@Injectable({
  providedIn: 'root'
})
export class TaiLieuVanBanService {

  constructor(private apollo: Apollo) { }

  getListThuMuc() {
    return this.apollo
      .watchQuery<any>({
        query: _getListThuMuc,
        fetchPolicy: 'network-only'
      });
  }

  getListThuMucQuery() {
    return new Promise((resolve, reject) => {
      return this.apollo
        .query<any>({
          query: _getListThuMuc,
          fetchPolicy: 'network-only'
        }).toPromise()
        .then(response => {
          resolve(response)
        });
    });
  }

  createFolder(body: any) {
    return this.apollo.mutate({
      mutation: _createFolder,
      variables: {
        "body": {
          "TenThuMuc": body?.TenThuMuc,
          "ParentID": body?.ParentID,
        }
      }
    })
  }

  updateFolder(Id: number, body: any) {
    return this.apollo.mutate({
      mutation: _updateFolder,
      variables: {
        "Id": Id,
        "body": {
          "TenThuMuc": body?.TenThuMuc,
        }
      }
    })
  }

  deleteFolder(Id: number) {
    return this.apollo.mutate({
      mutation: _deleteFolder,
      variables: {
        "Id": Id
      }
    })
  }

  //Tai Lieu
  getListTaiLieu() {
    return new Promise((resolve, reject) => {
      return this.apollo
        .query<any>({
          query: _getListTaiLieu,
          fetchPolicy: 'network-only'
        }).toPromise()
        .then(response => {
          resolve(response)
        });
    });
  }

  getTaiLieuByThuMucID(ThuMuc_Id: number) {
    return new Promise((resolve, reject) => {
      return this.apollo
        .query<any>({
          variables: {
            ThuMuc_Id
          },
          query: _getTaiLieuByThuMucID,
          fetchPolicy: 'network-only'
        }).toPromise()
        .then(response => {
          resolve(response)
        });
    });
  }

  createTaiLieu(bodyData: any, files: Array<File>) {
    return this.apollo.mutate({
      mutation: _createTaiLieu,
      variables: {
        "bodyData": {
          "TenTaiLieu": bodyData?.TenTaiLieu,
          "MaTaiLieu": bodyData?.MaTaiLieu,
          "NgayBanHanh": bodyData?.NgayBanHanh,
          "MaTrichYeu": bodyData?.MaTrichYeu,
          "ThuMuc_Id": bodyData?.ThuMuc_Id,
          "Files": files,
          "NoiBanHanh": bodyData?.NoiBanHanh
        },
      },
      context: {
        useMultipart: true
      }
    })
  }

  updateTaiLieu(Id: number, body: any, files: Array<File>) {
    return this.apollo.mutate({
      mutation: _updateTaiLieu,
      variables: {
        "Id": Id,
        "body": {
          "TenTaiLieu": body?.TenTaiLieu,
          "MaTaiLieu": body?.MaTaiLieu,
          "NgayBanHanh": body?.NgayBanHanh,
          "MaTrichYeu": body?.MaTrichYeu,
          "ThuMuc_Id": body?.ThuMuc_Id,
          "Files": files,
          "NoiBanHanh": body?.NoiBanHanh
        },
      },
      context: {
        useMultipart: true
      }
    })
  }

  deleteTaiLieu(Id: number) {
    return this.apollo.mutate({
      mutation: _deleteTaiLieu,
      variables: {
        "Id": Id
      }
    })
  }

  zipFile(Id: number) {
    return new Promise((resolve, reject) => {
      return this.apollo
        .query<any>({
          variables: {
            Id
          },
          query: _zipFile,
          fetchPolicy: 'network-only'
        }).toPromise()
        .then(response => {
          resolve(response)
        });
    });
  }

  downloadTaiLieu(Id: Number) {
    return this.apollo.mutate({
      mutation: _downloadTaiLieu,
      variables: {
        Id
      }
    })
  }


}
