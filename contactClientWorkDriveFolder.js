//
//Refer to YouTube Video: https://youtu.be/TbIhJLCtoiQ
//
//Required Variables
clientFolderUrl = "<<ENTER YOUR CLIENT FOLDER URL HERE>>";
clientFolderId = clientFolderUrl.getSuffix("/ws/").getPrefix("/folders/files");
clientFolderBaseUrl = clientFolderUrl.getPrefix("/files");
//Get Contact Record
contactMap = zoho.crm.getRecordById("Contacts",contactId);
//check if workdrive folder already exists
if(isnull(contactMap.get("WorkDrive_Folder_ID")))
{
	//Create Contact Folder
	folderName = contactMap.get("Client_Number") + " - " + contactMap.get("Full_Name");
	createContactWorkdriveFolder = zoho.workdrive.createFolder(folderName,clientFolderId,"workdrive_connection");
	//Get the new contact folder ID
	contactFolderId = createContactWorkdriveFolder.get("data").get("id");
	//Prepare Update Map
	updateMap = Map();
	updateMap.put("WorkDrive_Folder_ID",contactFolderId);
	//Update Contact Record With Workdrive Folder ID
	updateResponse = zoho.crm.updateRecord("Contacts",contactId,updateMap);
	//Open workdrive folder in a new Tab
	openUrl(clientFolderBaseUrl + "/" + contactFolderId,"same window");
	//info contactFolderId so it can be returned to the Create Deal Workdrive Function
	info contactFolderId;
	return "";
}
else
{
	//Open workdrive folder in a new Tab
	openUrl(clientFolderBaseUrl + "/" + contactMap.get("WorkDrive_Folder_ID"),"same window");
	return "";
}
