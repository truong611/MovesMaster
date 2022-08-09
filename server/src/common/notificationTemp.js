

const notificationTemp = {
  temp1: (campaign, company, sterling_Amount) => {
    if (campaign.End_Date_Target) {
      return `
        <div>
          <p>Campaign ${campaign.Campaign_Name} is complete.</p>
          <p>Company ${company.Company_Name} agreed to pay an unlimited amount based on the Moves donated at £${campaign.Campaign_Price_Per_Move} between ${campaign.Campaign_Launch_Date} and ${campaign.Campaign_End_Date}. The amount donated is £${sterling_Amount}.</p>
          <p>${company.Company_Name} has been notified of their need to pay.</p>
        </div>
      `;
    }
    return `
      <div>
        <p>Campaign ${campaign.Campaign_Name} is complete.</p>
        <p>Company ${company.Company_Name} agreed to pay you ${campaign.Campaign_Target_Value}</p>
        <p>${company.Company_Name} has been notified of their need to pay.</p>
      </div>
    `;
  },
  temp2: (campaign, company, sterling_Amount) => {
    if (campaign.End_Date_Target) {
      return `
        <div>
          <p>Campaign ${campaign.Campaign_Name} is complete.</p>
          <p>Company ${company.Company_Name} agreed to Match an unlimited amount based on the Moves donated at £${campaign.Campaign_Price_Per_Move} between ${campaign.Campaign_Launch_Date} and ${campaign.Campaign_End_Date}. The amount donated is £${sterling_Amount}.</p>
          <p>${company.Company_Name} has been informed of their need to pay.</p>
        </div>
      `;
    }
    return `
      <div>
        <p>Campaign ${campaign.Campaign_Name} is complete.</p>
        <p>Company ${company.Company_Name} agreed to Match the £${campaign.Campaign_Target_Value}</p>
        <p>${company.Company_Name} has been informed of their need to pay.</p>
      </div>
    `;
  },
  temp3: (campaign, charity, sterling_Amount) => {
    let payment_detail;
    if (charity.Member_Payment_Site_Url && charity.Member_Account_Name && charity.Member_Account_No && charity.Member_Sort_Code) {
      payment_detail =
        `
        <p>Payment URL: ${charity.Member_Payment_Site_Url}</p>
        <p>Account Name: ${charity.Member_Account_Name}</p>
        <p>Sort Code: ${charity.Member_Sort_Code}</p>
        <p>Account Number: ${charity.Member_Account_No}</p>
      `;
    } else {
      payment_detail =
        `
        <p>Payment URL: ${charity.Payment_Site_Url}</p>
        <p>Account Name: ${charity.Account_Name}</p>
        <p>Sort Code: ${charity.Sort_Code}</p>
        <p>Account Number: ${charity.Account_No}</p>
      `;
    }

    if (campaign.End_Date_Target) {
      return `
        <div>
          <p>Campaign ${campaign.Campaign_Name} is complete.</p>
          <p>You agreed to pay an unlimited amount based on the Moves donated at £${campaign.Campaign_Price_Per_Move} between ${campaign.Campaign_Launch_Date} and ${campaign.Campaign_End_Date} to ${charity.Charity_Name} under this Campaign. The amount donated is £${sterling_Amount}.</p>
          <p>The Charities payment details are as follows. You are required to pay the Charity within 30 days.</p>
        `+ payment_detail +
        `</div>
      `;
    }
    return `
      <div>
        <p>Campaign ${campaign.Campaign_Name} is complete.</p>
        <p>You agreed to pay ${charity.Charity_Name} £${campaign.Campaign_Target_Value}</p>
        <p>The Charities payment details are as follows. You are required to pay the Charity within 30 days.</p>
        `+ payment_detail +
      `</div>
    `;
  },
  temp4: (campaign, charity, sterling_Amount) => {
    let payment_detail;
    if (charity.Member_Payment_Site_Url && charity.Member_Account_Name && charity.Member_Account_No && charity.Member_Sort_Code) {
      payment_detail =
        `
        <p>Payment URL: ${charity.Member_Payment_Site_Url}</p>
        <p>Account Name: ${charity.Member_Account_Name}</p>
        <p>Sort Code: ${charity.Member_Sort_Code}</p>
        <p>Account Number: ${charity.Member_Account_No}</p>
      `;
    } else {
      payment_detail =
        `
        <p>Payment URL: ${charity.Payment_Site_Url}</p>
        <p>Account Name: ${charity.Account_Name}</p>
        <p>Sort Code: ${charity.Sort_Code}</p>
        <p>Account Number: ${charity.Account_No}</p>
      `;
    }
    if (campaign.End_Date_Target) {
      return `
        <div>
          <p>Campaign ${campaign.Campaign_Name} is complete.</p>
          <p>You agreed to Match an unlimited amount based on the Moves donated at £${campaign.Campaign_Price_Per_Move} between ${campaign.Campaign_Launch_Date} and ${campaign.Campaign_End_Date} to ${charity.Charity_Name} under this Campaign. The amount donated is £${sterling_Amount}.</p>
          <p>The Charities payment details are as follows. You are required to pay the Charity within 30 days.</p>
          `+ payment_detail +
        `</div>
      `;
    }
    return `
      <div>
        <p>Campaign ${campaign.Campaign_Name} is complete.</p>
        <p>You agreed to Match ${charity.Charity_Name} £${campaign.Campaign_Target_Value}</p>
        <p>The Charities payment details are as follows. You are required to pay the Charity within 30 days.</p>
        `+ payment_detail +
      `</div>
    `;
  },
};

module.exports = notificationTemp;