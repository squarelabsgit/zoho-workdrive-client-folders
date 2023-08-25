headerMap = Map();
headerMap.put("Accept","application/vnd.api+json");
//Prepare the required maps
dataMap = Map();
attributesMap = Map();
statusMap = Map();
//Update the maps with deletion status
statusMap.put("status","51");
attributesMap.put("attributes",statusMap);
attributesMap.put("type","files");
dataMap.put("data",attributesMap);
//Send update to WorkDrive API
deleteFolder = invokeurl
[
	url :"https://www.zohoapis.com/workdrive/api/v1/files/" + workdriveFolderId
	type :PATCH
	parameters:dataMap.toString()
	headers:headerMap
	connection:"workdrive_connection"
];
info deleteFolder;
return "";
