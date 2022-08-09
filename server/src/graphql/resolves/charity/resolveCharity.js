const db = require('../../../data/knex-db');
const authenticated = require('../../../middleware/authenticated-guard');
const request = require('request');
const API_ALL_CHARITY_SEARCH_NAME = process.env.API_ALL_CHARITY_SEARCH_NAME;
const API_ALL_CHARITY_DETAILS_PREFIX = process.env.API_ALL_CHARITY_DETAILS_PREFIX;
const API_ALL_CHARITY_DETAILS_POSTFIX = process.env.API_ALL_CHARITY_DETAILS_POSTFIX;
const API_ALL_CHARITY_DETAILS_SUBSCRIPTION_KEY = process.env.API_ALL_CHARITY_DETAILS_SUBSCRIPTION_KEY;
const API_ALL_CHARITY_DETAILS_CACHE = process.env.API_ALL_CHARITY_DETAILS_CACHE;
const API_CHARITY_SEARCH = process.env.API_CHARITY_SEARCH;
const jwt = require('jsonwebtoken');
const CLIENT = process.env.CLIENT;
const sendEmail = require('../../../common/sendEmail');
const emailTemp = require('../../../common/emailTemp');
const logging = require('../../../middleware/autologging');
const STATIC_FOLDER = process.env.STATIC_FOLDER;
const HOSTNAME = process.env.HOSTNAME;
const PORT = process.env.PORT;
const URL_FOLDER = (HOSTNAME + ':' + PORT) + '/' + STATIC_FOLDER;
const exportPDF = require('../../../common/exportPdf');
const { saveFile, deleteFile, downloadFile } = require('../../../common/handleFile');
const history = require('../../../common/history');


const resolvers = {
	Query: {
		getDetailCharity: authenticated(async (parent, args, context) => {
			try {
				let charity = await db.table('Charity')
					.where('Moves_Charity_ID', args.Id)
					.first();

				if (!charity) {
					return {
						messageCode: 404,
						message: 'Charity not found'
					}
				}

				charity.Charity_icon = charity.Charity_icon ? URL_FOLDER + charity.Charity_icon : null;

				return {
					Charity: charity,
					messageCode: 200,
					message: 'OK'
				}
			}
			catch (e) {
				logging(context, e);
				return {
					messageCode: 500,
					message: 'Internal Server Error'
				}
			}
		}),
		getListCharityNotActive: authenticated(async (parent, args, context) => {
			try {
				let User_ID = context.currentUser.User_ID;
				let User = await db.table('User').where('User_ID', User_ID).first();

				if (!User.IsAdmin) {
					return {
						message: 'User is not admin',
						messageCode: 409
					}
				}

				let ListCharity = await db.table('Charity')
					.where('Is_Active', null)
					.andWhere('Charity_Type', 1)
					.orderBy('Created_Date', 'desc');

				return {
					ListCharity: ListCharity,
					message: 'OK',
					messageCode: 200
				}
			}
			catch (e) {
				logging(context, e);
				return {
					messageCode: 500,
					message: 'Internal Server Error'
				}
			}
		}),
		checkCharityInfor: authenticated(async (parent, args, context) => {
			try {
				let Moves_Charity_ID = args.Id;
				let Mode = args.Mode;
				let User_ID = context.currentUser.User_ID;
				let User = await db.table('User').where('User_ID', User_ID).first();

				if (!User.IsAdmin) {
					return {
						message: 'User is not admin',
						messageCode: 409
					}
				}

				let charity = await db.table('Charity')
					.where('Moves_Charity_ID', Moves_Charity_ID)
					.first();

				if (!charity) {
					return {
						message: 'Charity not found',
						messageCode: 404
					}
				}

				let url = null;
				if (Mode == 'name') {
					url = API_ALL_CHARITY_SEARCH_NAME + charity.Charity_Name.trim();
				}
				else {
					url = API_ALL_CHARITY_DETAILS_PREFIX + charity.Charity_Commission_No.trim() + API_ALL_CHARITY_DETAILS_POSTFIX;
				}

				let check = await doRequest(url);
				if (check == 404) {
					return {
						Url: null,
						messageCode: 200,
						message: 'Charity not found on Charity Commission database. Please check Charity Name / Number'
					}
				}

				check = JSON.parse(check);

				if (Mode == 'name' && check.charity_name != charity.Charity_Name.trim()) {
					return {
						Url: null,
						messageCode: 200,
						message: 'Charity name does not match on Charity Commission database. Please check Charity Name / Number'
					}
				}
				else if (check.reg_charity_number.toString() != charity.Charity_Commission_No.trim() ||
					check.charity_name != charity.Charity_Name) {
					return {
						Url: null,
						messageCode: 200,
						message: 'Charity name does not match on Charity Commission database. Please check Charity Name / Number'
					}
				}

				return {
					Url: API_CHARITY_SEARCH + check.organisation_number,
					messageCode: 200,
					message: 'Charity found on Charity Commission database'
				}
			}
			catch (e) {
				logging(context, e);
				return {
					messageCode: 500,
					message: 'Internal Server Error'
				}
			}
		}),
		getListCharityInvitation: authenticated(async (parent, args, context) => {
			try {
				let User_ID = context.currentUser.User_ID;
				let User = await db.table('User').where('User_ID', User_ID).first();

				if (!User.IsAdmin) {
					return {
						message: 'User is not admin',
						messageCode: 409
					}
				}

				let ListCharity = await db.table('Charity')
					.where('Charity_Type', 0)
					.orderBy('Created_Date', 'desc');

				return {
					ListCharity: ListCharity,
					message: 'OK',
					messageCode: 200
				}
			}
			catch (e) {
				logging(context, e);
				return {
					messageCode: 500,
					message: 'Internal Server Error'
				}
			}
		}),
		charityInvitation: authenticated(async (parent, args, context) => {
			try {
				let Moves_Charity_ID = args.Id;
				let User_ID = context.currentUser.User_ID;
				let User = await db.table('User').where('User_ID', User_ID).first();

				if (!User.IsAdmin) {
					return {
						message: 'User is not admin',
						messageCode: 409
					}
				}

				let charity = await db.table('Charity')
					.where('Moves_Charity_ID', Moves_Charity_ID)
					.first();

				const url = `${CLIENT}/sign-up;name=` + charity.Charity_Name.trim();

				await sendEmail.sendEmail(charity.Contact_Email.trim(),
					'Join Moves Matter!',
					emailTemp.templateCharityJoinRequest(charity.Charity_Name, url),
					[], 'stream'
				).catch(err => {
					throw new Error(err);
				});

				return {
					message: 'Email invitation has been sent to Charity!',
					messageCode: 200
				}
			}
			catch (e) {
				logging(context, e);
				return {
					messageCode: 500,
					message: 'Internal Server Error'
				}
			}
		}),
		checkExistsEmailByCharityEmail: authenticated(async (parent, args, context) => {
			try {
				let exists = await db.table('User')
					.where('User_Email', 'ilike', args.Contact_Email.trim())
					.andWhere('Is_Mobile_App_User', true)
					.first();

				if (exists) {
					return {
						IsExists: true,
						Contact_Name: exists.Forename + ' ' + exists.Surname,
						Contact_Phone_Number: exists.User_Phone_Number,
						Contact_Email: exists.User_Email,
						messageCode: 200,
						message: 'Success',
					}
				}

				return {
					IsExists: false,
					Contact_Name: null,
					Contact_Phone_Number: null,
					Contact_Email: null,
					messageCode: 200,
					message: 'Success',
				}
			} 
			catch (e) {
				logging(context, e);
				return {
					messageCode: 500,
					message: 'Internal Server Error'
				}
			}
		})
	},
	Charity: {
	},
	Mutation: {
		createCharity: async (parent, args, context) => {
			try {
				let result = await db.transaction(async trx => {
					let bodyData = args.bodyData;

					let charityName = await trx.table('Charity')
						.where('Charity_Name', bodyData.Charity_Name.trim())
						.andWhere('Charity_Type', 1)
						.first();
					let charityNumber = await trx.table('Charity')
						.where('Charity_Commission_No', bodyData.Charity_Commission_No.trim())
						.andWhere('Charity_Type', 1)
						.first();

					if (charityName || charityNumber) {
						return {
							messageCode: 404,
							message: 'A Charity with this name / number already exists on Moves. Please see the Charity section of the Directory'
						}
					}

					let check = await doRequest(API_ALL_CHARITY_DETAILS_PREFIX + bodyData.Charity_Commission_No.trim() + API_ALL_CHARITY_DETAILS_POSTFIX);
					if (check == 404) {
						return {
							messageCode: 404,
							message: 'Charity not found on Charity Commission web site. Please check Charity Name / Number'
						}
					}

					check = JSON.parse(check);

					if (check.reg_charity_number != bodyData.Charity_Commission_No.trim() || 
							check.charity_name != bodyData.Charity_Name.trim()) 
					{
						return {
							messageCode: 404,
							message: 'Charity not found on Charity Commission web site. Please check Charity Name / Number'
						}
					}

					//Check exists Charity Email
					let existsEmail = await trx.table('User')
						.where('User_Email', 'ilike', bodyData.Contact_Email.trim())
						.andWhere('Is_Web_App_User', true)
						.first();

					if (existsEmail && (existsEmail.Moves_Company_ID || existsEmail.Moves_Charity_ID)) {
						return {
							messageCode: 400,
							message: 'This email address is already associated with a Charity or Company on Moves Matter. An account can only be associated with one Charity or Company. Please check the email address, view the Moves Matter Charity Directory and / or contact Moves Admin'
						}
					}

					let CharityResult = await trx.table('Charity')
						.returning('Moves_Charity_ID')
						.insert({
							Charity_Name: bodyData.Charity_Name.trim(),
							Charity_Commission_No: bodyData.Charity_Commission_No.trim(),
							Contact_Name: bodyData.Contact_Name.trim(),
							Contact_Email: bodyData.Contact_Email.trim(),
							Contact_Phone_Number: bodyData.Contact_Phone_Number,
							Is_Active: null
						})

					const User_ID = context.currentUser?.User_ID ?? null;
					await history.updateHistory({
						'Object_Id': CharityResult[0],
						'Object_Type': 'Charity',
						'Action': 'Created on Moves',
					}, User_ID)

					return {
						messageCode: 200,
						message: `<p>Thank you for submitting this request to sign up ${bodyData.Charity_Name.trim()}. Your reference number is ${bodyData.Charity_Commission_No.trim()}.</p><p>We will carry out the necessary due diligence and advise when complete</p>`
					}
				});

				return result;
			}
			catch (e) {
				logging(context, e);
				return {
					messageCode: 500,
					message: 'Internal Server Error'
				}
			}
		},
		approveCharity: authenticated(async (parent, args, context) => {
			try {
				let Moves_Charity_ID = args.Id;
				let User_ID = context.currentUser.User_ID;
				let User = await db.table('User').where('User_ID', User_ID).first();

				if (!User.IsAdmin) {
					return {
						message: 'User is not admin',
						messageCode: 409
					}
				}

				let charity = await db.table('Charity')
					.where('Moves_Charity_ID', Moves_Charity_ID)
					.first();

				if (!charity) {
					return {
						message: 'Charity not found',
						messageCode: 404
					}
				}

				if (charity.Is_Active != null) {
					return {
						message: 'Charity has been activated',
						messageCode: 409
					}
				}

				let existsUser = await db.table('User')
					.where('User_Email', 'ilike', charity.Contact_Email.trim())
					.first();

				if (existsUser) {
					return {
						message: 'Charity contact email has been exists',
						messageCode: 409
					}
				}

				let trx_result = await db.transaction(async trx => {
					//Update Is_Active => true
					await trx.table('Charity')
						.where('Moves_Charity_ID', Moves_Charity_ID)
						.update({
							Is_Active: true,
							Date_Active: new Date
						});

					const tokenReset = jwt.sign(
						{
							User_Email: charity.Contact_Email.trim()
						},
						'secret-reset-email',
						{ expiresIn: 60 * 60 * 24 } //60 * 60 * 24 = 24h
					);

					let UserResult = await trx.table('User')
						.returning(['User_ID'])
						.insert({
							Surname: charity.Charity_Name.trim(),
							Forename: '',
							User_Email: charity.Contact_Email.trim(),
							User_Phone_Number: charity.Contact_Phone_Number.trim(),
							Is_Web_App_User: true,
							IsAdmin: false,
							Moves_Charity_ID: Moves_Charity_ID,
							Token_Forgot_Password: tokenReset
						});

					let User_Result_ID = UserResult[0].User_ID;

					//Create User Permission
					let listPermissionType = await trx.table('Permission_Type')
						.where('Type', 1)
						.orWhere('Type', 2)
						.orWhere('Type', 5)

					let list_item = [];
					listPermissionType.forEach(item => {
						list_item.push({
							Permission_Type_ID: item.Permission_Type_ID,
							User_ID: User_Result_ID,
							Is_Active: true,
							Last_Modify_Date: new Date(),
							Last_Modify_By: context.currentUser.User_ID
						});
					});

					await trx.table('User_Permission')
						.insert(list_item);

					await history.updateHistory({
						'Object_Id': Moves_Charity_ID,
						'Object_Type': 'Charity',
						'Action': 'Authorised',
					}, User_ID);

					//Create News
					await trx.table('News_Item')
						.insert({
							News_Image: charity.Charity_icon,
							News_Title: `NEW CHARITY. ${charity.Charity_Name} joins Moves! Welcome ${charity.Charity_Name}!`,
							News_Content: `We welcome ${charity.Charity_Name} to the Moves Matter world`,
							Moves_Charity_ID: charity.Moves_Charity_ID,
							News_Status_ID: 26,
							News_Url: charity.Charity_URL,
							Is_Manual: false,
							News_Publish_Date: new Date()
						});

					const url = `${CLIENT}/reset-password;id=${tokenReset}`;
					const urlTerm = `${CLIENT}/terms-and-conditions`;
					const urlPolicy = `${CLIENT}/policy`;

					let fileNamePdf = await exportPDF.charityInvoice('invoice', charity);
					let filePdf = 'temp/' + fileNamePdf;

					await sendEmail.sendEmail(charity.Contact_Email.trim(),
						charity.Charity_Name + ' - Request to join Moves Matter ' + charity.Charity_Commission_No,
						emailTemp.templateAcceptRequestCharity(url, urlTerm, urlPolicy, charity.Contact_Name),
						[
							{
								filename: fileNamePdf,
								content: filePdf
							}
						],
						'stream'
					).catch(err => {
						throw new Error(err);
					});

					//Xóa file vật lý
					deleteFile([filePdf]);

					return {
						message: 'The charity registration request has been approved successfully!',
						messageCode: 200
					}
				});

				return trx_result;
			}
			catch (e) {
				logging(context, e);
				return {
					messageCode: 500,
					message: 'Internal Server Error'
				}
			}
		}),
		denyCharity: authenticated(async (parent, args, context) => {
			try {
				let Moves_Charity_ID = args.Id;
				let User_ID = context.currentUser.User_ID;
				let User = await db.table('User').where('User_ID', User_ID).first();

				if (!User.IsAdmin) {
					return {
						message: 'User is not admin',
						messageCode: 409
					}
				}

				let charity = await db.table('Charity')
					.where('Moves_Charity_ID', Moves_Charity_ID)
					.first();

				if (!charity) {
					return {
						message: 'Charity not found',
						messageCode: 404
					}
				}

				if (charity.Is_Active != null) {
					return {
						message: 'Charity has been activated',
						messageCode: 409
					}
				}

				let trx_result = await db.transaction(async trx => {
					//Update Is_Active => false
					await trx.table('Charity')
						.where('Moves_Charity_ID', Moves_Charity_ID)
						.update({
							Is_Active: false,
						});

					const url = `${CLIENT}/home`;

					await sendEmail.sendEmail(charity.Contact_Email.trim(),
						charity.Charity_Name + ' - Request to join Moves Matter ' + charity.Charity_Commission_No,
						emailTemp.templateDenyCharity(charity.Contact_Name, url),
						[], 'stream'
					).catch(err => {
						throw new Error(err);
					});

					return {
						message: 'The charity registration request has been rejected successfully!',
						messageCode: 200
					}
				});

				return trx_result;
			}
			catch (e) {
				logging(context, e);
				return {
					messageCode: 500,
					message: 'Internal Server Error'
				}
			}
		})
	},
};

function doRequest(url) {
	let option = {
		url: url,
		headers: {
			'Ocp-Apim-Subscription-Key': API_ALL_CHARITY_DETAILS_SUBSCRIPTION_KEY,
			'Cache-Control': API_ALL_CHARITY_DETAILS_CACHE,
		}
	};
	return new Promise(function (resolve, reject) {
		request(option, function (error, res, body) {
			if (res.statusCode == 200)
				resolve(body);
			else
				resolve(res.statusCode);
		});
	});
}

module.exports = resolvers;
