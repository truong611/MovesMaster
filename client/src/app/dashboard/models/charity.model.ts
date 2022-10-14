export class DashboardCharity {
  Charity_URL: String;
  Contact_Name?: String;
  Contact_Forename: String;
  Contact_Surname: String;
  Contact_Email: String;
  Contact_Phone_Number: String;
  Charity_Date_Founded: Date;
  Charity_Aims: String;
  Charity_icon_file: File;
  Charity_Geographical_Scope: Number;
  Charity_Income_Band_ID: Number;
  ListCategoryId: [Number];
  Address_For_Invoice: String;
  Payment_Site_Url: String;
  Account_Name: String;
  Account_No: String;
  Sort_Code: String;
  Member_Payment_Site_Url: String;
  Member_Account_Name: String;
  Member_Account_No: String;
  Member_Sort_Code: String;
}

export class DashboardCompany {
  Company_Icon_File: File;
  Company_URL: String;
  Contact_Name?: String;
  Contact_Forename: String;
  Contact_Surname: String;
  Contact_Email: String;
  Contact_Phone_Number: String;
  Company_CSR_Statement: String;
}

export class Company {
  Company_Name: String;
  Company_Number: String;
  Contact_Forename: String;
  Contact_Surname: String;
  Contact_Email: String;
  Contact_Phone_Number: String;
}

export class NotificationInput {
  Notification_To_Charity_ID: Number;
  Notification_To_Company_ID: Number;
  Content: String;
}