headerMap = Map();
headerMap.put("Accept","application/vnd.api+json");
//Prepare the required maps
dataMap = Map();
attributesMap = Map();
statusMap = Map();
//Update the maps with new folder name
statusMap.put("name",newFolderName);
attributesMap.put("attributes",statusMap);
attributesMap.put("type","files");
dataMap.put("data",attributesMap);
//Send update to WorkDrive API
renameFolder = invokeurl
[
	url :"https://www.zohoapis.com/workdrive/api/v1/files/" + workdriveFolderId
	type :PATCH
	parameters:dataMap.toString()
	headers:headerMap
	connection:"workdrive_connection"
];
info renameFolder;
return "";
