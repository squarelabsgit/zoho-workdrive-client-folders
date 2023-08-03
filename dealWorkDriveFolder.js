//
//Refer to YouTube Video: https://youtu.be/TbIhJLCtoiQ
//
//Required Variables
clientFolderUrl = "<<ENTER YOUR CLIENT FOLDER URL HERE>>";
clientFolderBaseUrl = clientFolderUrl.getPrefix("/files");
accountClientFolderUrl = "<<ENTER YOUR OAUTH2 API FOR ACCOUNT WORKDRIVE FOLDER URL HERE>>";
contactClientFolderUrl = "<<ENTER YOUR OAUTH2 API FOR CONTACT WORKDRIVE FOLDER URL HERE>>";
//Get Deal Record
dealMap = zoho.crm.getRecordById("Deals",dealId);
//Get deals Workdrive Folder ID
dealWorkdriveFolderId = dealMap.get("WorkDrive_Folder_ID");
//check if workdrive folder already exists if not, create one
if(isnull(dealWorkdriveFolderId))
{
	//Check if there is an Account associated to the deal
	if(!isnull(dealMap.get("Account_Name")))
	{
		accountId = dealMap.get("Account_Name").get("id");
		//Get the Account record
		accountMap = zoho.crm.getRecordById("Accounts",accountId);
		//Get the accounts Workdrive Folder ID
		clientWorkdriveFolderId = accountMap.get("WorkDrive_Folder_ID");
		//If there is no account workdrive folder Id we will need to create one by calling the button function already configured to create an account workdrive folder.
		if(isnull(clientWorkdriveFolderId))
		{
			//Pass through the accountId parameter
			paramsMap = Map();
			paramsMap.put("accountId",accountId);
			createWorkdriveFolder = invokeurl
			[
				url :accountClientFolderUrl
				type :GET
				parameters:paramsMap
				connection:"crm_connection"
			];
			//We get the accounts workdrive folder id returned to us from the info statement
			clientWorkdriveFolderId = createWorkdriveFolder.get("details").get("userMessage").get(0);
		}
	}
	//If there is no account check for a contact
	else if(!isnull(dealMap.get("Contact_Name")))
	{
		contactId = dealMap.get("Contact_Name").get("id");
		//Get the Contact record
		contactMap = zoho.crm.getRecordById("Contacts",contactId);
		//Get the contacts Workdrive Folder ID
		clientWorkdriveFolderId = contactMap.get("WorkDrive_Folder_ID");
		//If there is no contact workdrive folder Id we will need to create one by calling the button function already configured to create a contact workdrive folder.
		if(isnull(clientWorkdriveFolderId))
		{
			//Pass through the contactId parameter
			paramsMap = Map();
			paramsMap.put("contactId",contactId);
			createWorkdriveFolder = invokeurl
			[
				url :contactClientFolderUrl
				type :GET
				parameters:paramsMap
				connection:"crm_connection"
			];
			//We get the contacts workdrive folder id returned to us from the info statement
			clientWorkdriveFolderId = createWorkdriveFolder.get("details").get("userMessage").get(0);
		}
	}
	//If there is no account or contact return message to user.
	else
	{
		return "No Account Or Contact Associated to this Deal - Unable to create workdrive folder.";
	}
	//Search for Deals Folder
	//Prepare headers used in workdrive API Call
	headerMap = Map();
	headerMap.put("Accept","application/vnd.api+json");
	//Prepare filters using URL encoded with UTF-8 Charset to filter only folders
	filters = "filter%5Btype%5D=folder";
	//Get Workdrive Folders in Client Folder
	workdriveGetClientFolders = invokeurl
	[
		url :"https://www.zohoapis.com/workdrive/api/v1/files/" + clientWorkdriveFolderId + "/files?" + filters
		type :GET
		headers:headerMap
		connection:"workdrive_connection"
	];
	workdriveClientFolderList = workdriveGetClientFolders.get("data");
	//If there are no folders we dont need to loop through
	if(workdriveClientFolderList.size() > 0)
	{
		for each  workdriveFolder in workdriveClientFolderList
		{
			//Check for a folder called Deals
			folderName = workdriveFolder.get("attributes").get("name");
			if(folderName = "Deals")
			{
				//If there is one return the Parent Deals Folder Id
				dealParentWorkdriveFolderId = workdriveFolder.get("id");
				//Stop the loop if this folder is found
				break;
			}
		}
	}
	//If there is no Parent Deal folder found we need to create it inside the clients folder
	if(isnull(dealParentWorkdriveFolderId))
	{
		createDealParentWorkdriveFolder = zoho.workdrive.createFolder("Deals",clientWorkdriveFolderId,"workdrive_connection");
		//info createDealParentWorkdriveFolder;
		dealParentWorkdriveFolderId = createDealParentWorkdriveFolder.get("data").get("id");
	}
	//Create deal workdrive folder
	createDealWorkdriveFolder = zoho.workdrive.createFolder(dealMap.get("Deal_Name"),dealParentWorkdriveFolderId,"workdrive_connection");
	dealWorkdriveFolderId = createDealWorkdriveFolder.get("data").get("id");
	/***************************************
	//Example of how to create sub folders in the Deals folder
	createQuotesWorkdriveFolder = zoho.workdrive.createFolder("Quotes",dealWorkdriveFolderId,"workdrive_connection");
	quotesFolderId = createQuotesWorkdriveFolder.get("data").get("id");
	//Create sub sub folders
	createDraftQuotesWorkdriveFolder = zoho.workdrive.createFolder("Drafts",quotesFolderId,"workdrive_connection");
	***************************************/
	//Update Deal with Deal Workdrive Folder ID
	updateMap = Map();
	updateMap.put("WorkDrive_Folder_ID",dealWorkdriveFolderId);
	updateResponse = zoho.crm.updateRecord("Deals",dealId,updateMap);
	//Open workdrive folder in a new Tab
	openUrl(clientFolderBaseUrl + "/" + dealWorkdriveFolderId,"same window");
	return "";
}
else
{
	//Open workdrive folder in a new Tab
	openUrl(clientFolderBaseUrl + "/" + dealWorkdriveFolderId,"same window");
	return "";
}
