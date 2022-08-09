

const emailTemp = {
  templateCreatePassword: (url, objectName, email) => {
    return `
      <div>
        <p>Hello!</p>
        <p>You have been set up as a User on Moves Matter for ${objectName}</p>
        <p>Username: ${email}</p>
        <p>Please click here to set your password and login: <a href="${url}">Link</a></p>
        <p>Please note, this link will expire in 24 hours.</p>
      </div>
    `;
  },
  templateForgotPassword: (url) => {
    return `
      <div>
        <p>A request for a new password for the Moves Matter web app has been received. If this was not you, simply ignore this email. If this was you, please click on the link below to reset your password: </p>
        <p><a href="${url}">Link</a></p>
        <p>Please note, this link will expire in 24 hours. Please log in using the same method as above.</p>
      </div>
    `
  },
  templateAcceptRequestCharity: (url, urlTerm, urlPolicy, contactName) => {
    return `
      <div>
        <p>Dear ${contactName}</p>
        <p>Your application to join Moves Matter has been successful. (If you didn’t make this application, please contact Moves Matter at your earliest convenience).</p>
        <p>Please click the link below to complete registration.</p>
        <p>The attached document is an invoice detailing the payment amount and payment terms for joining Moves Matter. Continuing to complete Moves Matter registration by clicking the link below confirms that you agree to these terms.</p>
        <p>Here are the <a href="${urlTerm}">Moves Matter Terms & Conditions</a> and <a href="${urlPolicy}">Moves Matter Data Usage Policy</a>. Clicking the link below confirms that you accept these terms.</p>
        <p><a href="${url}">Complete Registration</a></p>
        <p>Kind regards</p>
        <p>Moves Matter Admin</p>
      </div>
    `
  },
  templateDenyCharity: (contactName, url) => {
    return `
      <div>
        <p>Dear ${contactName}</p>
        <p>We are sorry to say that your application to join Moves Matter has been unsuccessful. This may be for a number of reasons such as there appears to be a Charity already registered with your details. If you wish to find out more, please contact us through the contact page on the <a href="${url}">Moves Matter website</a>.</p>
        <p>Kind regards</p>
        <p>Moves Matter Admin</p>
      </div>
    `
  },
  templateAcceptRequestCompany: (url, urlTerm, urlPolicy, contactName) => {
    return `
      <div>
        <p>Dear ${contactName}</p>
        <p>Your application to join Moves Matter has been successful. (If you didn’t make this application, please contact Moves Matter at your earliest convenience).</p>
        <p>Please click the link below to complete registration.</p>
        <p>The attached document is an invoice detailing the payment amount and payment terms for joining Moves Matter. Continuing to complete Moves Matter registration by clicking the link below confirms that you agree to these terms.</p>
        <p>Here are the <a href="${urlTerm}">Moves Matter Terms & Conditions</a> and <a href="${urlPolicy}">Moves Matter Data Usage Policy</a>. Clicking the link below confirms that you accept these terms.</p>
        <p><a href="${url}">Complete Registration</a></p>
        <p>Kind regards</p>
        <p>Moves Matter Admin</p>
      </div>
    `
  },
  templateDenyCompany: (contactName, url) => {
    return `
      <div>
        <p>Dear ${contactName}</p>
        <p>We are sorry to say that your application to join Moves Matter has been unsuccessful. This may be for a number of reasons such as there appears to be a Company already registered with your details. If you wish to find out more, please contact us through the contact page on the <a href="${url}">Moves Matter website</a>.</p>
        <p>Kind regards</p>
        <p>Moves Matter Admin</p>
      </div>
    `;
  },
  templateCharityJoinRequest: (charityName, url) => {
    return `
      <div>
        <p>Hello!</p>
        <p>Have you heard of Moves Matter? We are a social media platform providing Charities the means to publicise their causes and Companies the means to publicise their giving.</p>
        <p>We are contacting you because a Moves Matter user wanted to donate to ${charityName} but could not find you! We said we would try and persuade you to join.</p>
        <p></p>
        <p>Please click <a href="${url}">here</a> to find out more.</p>
        <p></p>
        <p>Kind regards</p>
        <p>Moves Matter Admin</p>
      </div>
    `
  },
  templateUserExists: (name, url) => {
    return `
      <div>
        <p>Hello!</p>
        <p>Your account on Moves Matter mobile has been linked  with Moves Matter web app. You have been set up as a User for ${name}</p>
        <p>Please click on the link below to login on Moves Matter web app: <a href="${url}">here</a></p>
        <p></p>
      </div>
    `
  },
  templateSendMailToCompany: (Campaign_Name, N, Donation) => {
    return `
      <div>
        <p>Hello!</p>
        <p>Campaign ${Campaign_Name} is complete on Moves Matter.</p>
        <p>You agreed to pay Moves Matter ${N}% of amount raised ₤${Donation}</p>
        <p>The attached document is an invoice detailing the payment amount.</p>
      </div>
    `
  }
};

module.exports = emailTemp;