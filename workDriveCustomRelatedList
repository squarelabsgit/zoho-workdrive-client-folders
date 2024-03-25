recordMap = zoho.crm.getRecordById(moduleName,recordId);
workdriveFolderId = recordMap.get("WorkDrive_Folder_ID");
//
//Prepare headers used in workdrive API Call
headerMap = Map();
headerMap.put("Accept","application/vnd.api+json");
/******************************************
If you want to filter what is displayed to just files or folders you will need to add in a filter query parameter
Details Here: https://workdrive.zoho.com/apidocs/v1/gettingstarted/filters
Prepare filters using URL encoded with UTF-8 Charset
Examples
To only show folders: filters = "filter%5Btype%5D=folder";
To only show files: filters = "filter%5Btype%5D=allfiles";
******************************************/
//Add in any filters to the returned results
filters = "";
//Call Workdrive API to get Files/Folders in the Folder
workdriveGetFiles = invokeurl
[
	url :"https://www.zohoapis.com/workdrive/api/v1/files/" + workdriveFolderId + "/files?" + filters
	type :GET
	headers:headerMap
	connection:"workdrive_connection"
];
workdriveFileList = workdriveGetFiles.get("data");
//info workdriveDealFileList;
//Prepare XML related list
rowVal = 0;
responseXML = "";
responseXML = responseXML + "<record>";
//Check there is at least 1 file/folder in the folder
if(workdriveFileList.size() > 0)
{
	for each  file in workdriveFileList
	{
		//Here we are distinguisting between file and folder and including a file or folder emoji to improve visability
		if(file.get("attributes").get("is_folder"))
		{
			type = "Folder";
			icon = "&#x1F4C1;";
		}
		else
		{
			type = "File";
			icon = "&#128196;";
		}
		//
		responseXML = responseXML + "<row no='" + rowVal + "'>";
		responseXML = responseXML + "<FL link='true' url='" + file.get("attributes").get("permalink") + "'  val='Name'>" + icon + " " + file.get("attributes").get("display_attr_name") + "</FL>";
		responseXML = responseXML + "<FL val='Size'>" + file.get("attributes").get("storage_info").get("size") + "</FL>";
		responseXML = responseXML + "<FL val='Created By'>" + file.get("attributes").get("created_by") + "</FL>";
		responseXML = responseXML + "<FL val='Created Time'>" + file.get("attributes").get("created_time") + "</FL>";
		responseXML = responseXML + "<FL val='Modified By'>" + file.get("attributes").get("modified_by") + "</FL>";
		responseXML = responseXML + "<FL val='Modified Time'>" + file.get("attributes").get("modified_time") + "</FL>";
		//If its a file we want to include an Action of Download with the Download link.
		if(type == "File")
		{
			//Remove the &#11015; if you dont wan't the down arrow.
			responseXML = responseXML + "<FL link='true' url='" + file.get("attributes").get("download_url") + "'  val='Action'>" + "&#11015; Download" + "</FL>";
		}
		//If its a folder we don't want to to include an Action of Open with the Download link.
		else if(type == "Folder")
		{
			//No option to download a folder but if you want you can add an open action
			//To add an Open Action Link
			//responseXML = responseXML + "<FL link='true' url='" + file.get("attributes").get("permalink") + "'  val='Action'>" + "Open" + "</FL>";
			//To leave it blank
			responseXML = responseXML + "<FL val='Action'>" + " " + "</FL>";
		}
		responseXML = responseXML + "</row>";
		rowVal = rowVal + 1;
	}
	//Close off the XML
	responseXML = responseXML + "</record>";
}
else
{
	//Message returned of there are no files or folders in the Deal Folder.
	responseXML = "<error><message>No WorkDrive Files/Folders</message></error>";
}
//
return responseXML;
