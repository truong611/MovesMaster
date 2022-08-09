import { DonationService } from './../../services/donation.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService, SelectItem } from 'primeng/api';
import { CampaignService } from 'src/app/campaign/services/campaign.service';
import { EncrDecrService } from 'src/app/shared/services/encrDecr.service';

@Component({
  selector: 'app-list-donation',
  templateUrl: './list-donation.component.html',
  styleUrls: ['./list-donation.component.css']
})
export class ListDonationComponent implements OnInit {
  loading: boolean = false;
  objectId: number = null;
  objectType: string = null;
  colHeader: any = [];
  listDonation: Array<any> = [];
  listAllDonation: any = this.listDonation;
  totalDonation: number = 0;
  globalFilter: string = null;
  startDate: Date = null;
  endDate: Date = null;
  listAppeal: Array<any> = [];
  listSelectedAppeal: Array<any> = [];
  listCampaign: Array<any> = [];
  listSelectedCampaign: Array<any> = [];

  constructor(
    private messageService: MessageService,
    private campaignService: CampaignService,
    private router: Router,
    private route: ActivatedRoute,
    private encrDecrService: EncrDecrService,
    private donationService: DonationService
  ) { 

  }

  async ngOnInit() {
    this.initTable();
    this.route.params.subscribe(async params => {
      this.objectId = Number(this.encrDecrService.get(params['objectId']));
      this.objectType = this.encrDecrService.get(params['objectType']);
      await this.getMasterData();
    });
  }

  initTable() {
    this.colHeader = [
      { field: 'Charity_Name', header: 'Charity', textAlign: 'left', colWith: '15vw' },
      { field: 'Appeal_Name', header: 'Appeal', textAlign: 'left', colWith: '15vw' },
      { field: 'Campaign_Name', header: 'Campaign', textAlign: 'left', colWith: '15vw' },
      { field: 'Company_Name', header: 'Company', textAlign: 'left', colWith: '15vw' },
      { field: 'Created_Date', header: 'Donation Date', textAlign: 'left', colWith: '12vw' },
      { field: 'Moves_Donated', header: 'Number of Moves', textAlign: 'right', colWith: '12vw' },
      { field: 'Sterling_Amount', header: 'Sterling Value', textAlign: 'right', colWith: '12vw' },
      { field: 'User_ID', header: 'Donor', textAlign: 'right', colWith: '7vw' },
    ]
  }

  async getMasterData() {
    try {
      this.loading = true;
      let { data, loading }: any = await this.donationService.getMasterDataListDonation(this.objectId, this.objectType);
      this.loading = loading;

      if (data.getMasterDataListDonation.messageCode != 200) {
        this.showMessage('error', data.getMasterDataListDonation.message);
        return;
      }

      this.listAppeal = data.getMasterDataListDonation.ListAppeal.map((item) =>
        Object.assign({}, item)
      );

      this.listCampaign = data.getMasterDataListDonation.ListCampaign.map((item) =>
        Object.assign({}, item)
      );

      this.getListDonation();
    } 
    catch (e) {
      this.loading = false;
      this.showMessage('error', e);
    }
  }

  async getListDonation() {
    try {
      let bodyData = {
        objectId: this.objectId,
        objectType: this.objectType,
        startDate: this.startDate,
        endDate: this.endDate,
        listAppealId: this.listSelectedAppeal.map(x => x.Appeal_ID),
        listCampaignId: this.listSelectedCampaign.map(x => x.Campaign_ID)
      };

      this.loading = true;
      let { data, loading }: any = await this.donationService.getListDonation(bodyData);
      this.loading = loading;

      if (data.getListDonation.messageCode != 200) {
        this.showMessage('error', data.getListDonation.message);
        return;
      }

      this.totalDonation = data.getListDonation.TotalDonation;

      this.listAllDonation = data.getListDonation.ListDonation.map((item) =>
        Object.assign({}, item)
      );

      this.listDonation = this.listAllDonation.map((item) =>
        Object.assign({}, item)
      );

      this.applyFilterGlobal();
    }
    catch (e) {
      this.loading = false;
      this.showMessage('error', e);
    }
  }

  applyFilterGlobal() {
    let keySearch = this.globalFilter?.trim().toUpperCase();

    if (keySearch != null) {
      this.listDonation = this.listAllDonation.filter(x => keySearch != null
        && (x.Charity_Name && x.Charity_Name.toUpperCase().includes(keySearch) ||
          (x.Appeal_Name && x.Appeal_Name.toUpperCase().includes(keySearch)) ||
          (x.Company_Name && x.Company_Name.toUpperCase().includes(keySearch)) ||
          (x.Campaign_Name && x.Campaign_Name.toUpperCase().includes(keySearch)) ||
          (x.User_ID && x.User_ID.toString().includes(keySearch))));
    } 
    else {
      this.listDonation = this.listAllDonation
    }
  }

  refresh() { 
    this.globalFilter = null;
    this.applyFilterGlobal();
    this.startDate = null;
    this.endDate = null;
    this.listSelectedAppeal = [];
    this.listSelectedCampaign = [];
    this.getListDonation();
  }

  showMessage(severity: string, detail: string) {
    let msg = { severity: severity, summary: 'Notification:', detail: detail, sticky:false };
    if(severity == 'error') {
      msg.sticky = true;
    }
    this.messageService.add(msg);
  }
}
