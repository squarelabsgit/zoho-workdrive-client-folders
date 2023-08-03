//
//Refer to YouTube Video: https://youtu.be/TbIhJLCtoiQ
//
//Required Variables
clientFolderUrl = "<<ENTER YOUR CLIENT FOLDER URL HERE>>";
clientFolderId = clientFolderUrl.getSuffix("/ws/").getPrefix("/folders/files");
clientFolderBaseUrl = clientFolderUrl.getPrefix("/files");
//Get Account Record
accountMap = zoho.crm.getRecordById("Accounts",accountId);
//check if workdrive folder already exists
if(isnull(accountMap.get("WorkDrive_Folder_ID")))
{
	//Create Account Folder
	folderName = accountMap.get("Client_Number") + " - " + accountMap.get("Account_Name");
	createAccountWorkdriveFolder = zoho.workdrive.createFolder(folderName,clientFolderId,"workdrive_connection");
	//Get the new account folder ID
	accountFolderId = createAccountWorkdriveFolder.get("data").get("id");
	//Prepare Update Map
	updateMap = Map();
	updateMap.put("WorkDrive_Folder_ID",accountFolderId);
	//Update Account Record With Workdrive Folder ID
	updateResponse = zoho.crm.updateRecord("Accounts",accountId,updateMap);
	//Open workdrive folder in a new Tab
	openUrl(clientFolderBaseUrl + "/" + accountFolderId,"same window");
	//info accountFolderId so it can be returned to the Create Deal Workdrive Function
	info accountFolderId;
	return "";
}
else
{
	//Open workdrive folder in a new Tab
	openUrl(clientFolderBaseUrl + "/" + accountMap.get("WorkDrive_Folder_ID"),"same window");
	return "";
}
