export class Appeal {
  Appeal_ID: number;
  Appeal_Name: string;
  Moves_Charity_ID: number;
  Appeal_URL: string;
  Appeal_Icon: string;
  Appeal_Description: string;
  Appeal_Target_Amount: number;
  Appeal_Start_Date: Date;
  Appeal_End_Date: Date
  Appeal_Status_ID: number;

  /* Vitual Field: */
  Appeal_Status_Name: string;
  Amount_Raised: number;
  Live_Campaign: string;
  Charity_Name: string;
  Charity_icon: string;
  Charity_URL: string;
  TotalCampaign: number;
  TotalMove?: number;

  constructor() {
    this.Amount_Raised = 0;
    this.TotalCampaign = 0;
  }
}