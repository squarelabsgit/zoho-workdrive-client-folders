# Automatically create structured Client folders in Zoho WorkDrive from Zoho CRM
Blog Post: https://www.squarelabs.com.au/post/automatically-create-structured-client-folders-in-zoho-workdrive-from-zoho-crm

YouTube: 

If you use Zoho WorkDrive to store your files, you probably have a folder structure that you like to use for your clients and their deals to keep everything organised. Today, I'll be showing you how you can use some automation inside Zoho CRM to seamlessly integrate it with Zoho WorkDrive. This article will enable you to take your organisation to the next level by leveraging the power to automatically create structured client folders in Zoho WorkDrive from Zoho CRM. Say goodbye to manual folder setup and hello to a streamlined process that automatically generates a dedicated deal folder for each of your deals inside the clients folder.

## Folder Structure
Below is the folder structure that we will be implementing, it contains a central 'Clients' folder that will hold the client folders created for Contacts and Accounts. Inside each client folder, there will be a "Deals" folder to house individual deal folders.

It's worth noting that the 'Deals' folder will only be created inside the client's folder when there is a deal folder to be added. This approach ensures a clean and organised structure, with the Deals folder dynamically generated as needed.

![WorkDrive Folder Structure](https://static.wixstatic.com/media/c8c3af_a4581eb0cccf4b93b39a89df28c0bb3c~mv2.png/v1/fill/w_740,h_408,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/c8c3af_a4581eb0cccf4b93b39a89df28c0bb3c~mv2.png)

## How It Works
Each module will have a "Create WorkDrive Folder" Button. When this button is clicked it will create the WorkDrive folder for the record selected, be that a Contact, Account or Deal.

### Contacts or Accounts
When clicked on a Contact or Account record, the "Create WorkDrive Folder" Button will generate a single client folder in the 'Clients' team folder. The client folder will be named using the Client Number (or equivalent unique field) prefixed before the Name of the Contact or Account. Subsequently, the WorkDrive folder will open in a new browser tab. If a WorkDrive folder already exists for the Contact or Account, the button will merely open the folder in a new tab.

### Deals
When clicked on a Deal record, the "Create WorkDrive Folder" Button will follow the below logic to determine the client and create the relevant folder structure:
* If the 'Account Name' field is populated, the Account associated with the Deal will be considered the Client.
* If the 'Account Name' field is empty, and the 'Contact Name' field is populated, the Contact associated with the Deal will be considered the Client.
* If both the 'Account Name' and 'Contact Name' fields are empty, the user will receive an error message indicating that a client folder cannot be created.

If a client WorkDrive folder is identified based on the above logic, the function will proceed to:
* Locate or create (if it doesn't exist) a folder called 'Deals' within the client folder.
* Create a deal folder with the name of the specific Deal.
* Open the WorkDrive folder for that Deal in a new browser tab. If the WorkDrive folder already exists for the Deal, the button will open it in a new tab.

## Trigger Method
If you're wondering why I choose a manual button to trigger the WorkDrive folder creation over a fully automated creation this really comes down to personal preference. But there is some method behind my madness and heres why.
* Fully automated WorkDrive folder solutions tend to create a bunch of empty folders that might not ever have data added into them
* You can always add automation in later, for example when a deal gets to a certain stage
* A button can be configured to give you immediate feedback if there is a failure or an issue with the creation of the folder (This is not configured in this code example to reduce complexity)
* If there is a failure with the automated solution a button is often required to re-trigger the automation, especially if folders are created "On Creation" of a record

*Note: If you want your solution to be automated you can use the same code provided in this article and attach it to a workflow.*

## Zoho WorkDrive Configuration
To implement the folder structure as described earlier, the first step is to create a new folder named 'Clients' under Team Folders in your Zoho WorkDrive. This folder will serve as the central repository for all client-related folders.

Once you have created the 'Clients' folder, make sure to save its full URL, as this will be a crucial piece of information for our function. The URL will be used to ensure seamless integration and easy access to the 'Clients' folder when we proceed with the automation.

![WorkDrive URL Location](https://static.wixstatic.com/media/c8c3af_56ecd91adeef4915bbd78fcb86fa69c5~mv2.png/v1/fill/w_740,h_206,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/c8c3af_56ecd91adeef4915bbd78fcb86fa69c5~mv2.png)

## Zoho CRM Configuration
To enable this automation, specific field configurations are required within each of the 3 modules in Zoho CRM.

Since Zoho WorkDrive doesn't allow duplicate folder names within a folder, we'll need to add a unique value to the folder name. For this automation, we'll configure an Auto-number field in both the Contacts and Accounts modules, i've named it 'Client Number' however you can name it whatever you like. To ensure distinct prefixes for each module, we'll use 'A' for Accounts and 'C' for Contacts. If you frequently encounter deals with the same name under a contact/account, you might also consider creating an auto-number field for the Deals module.

Furthermore, in all modules, we need to create a single-line text field called 'WorkDrive Folder ID.' This field will store the WorkDrive folder ID on the respective record after it's created by our function.

## Connections
As apart of this automation as discussed above we will on occasion need to trigger our Contact and Account WorkDrive folder button functions by API as well as needing to create and read folders in Zoho WorkDrive. We will need 2 connections for this, of course you can put them into a single connection if you prefer, I just opt to keep my connections seperate for each application.

### Connection Names and Scopes

1. crm_connection
   * ZohoCRM.functions.execute.READ
   * ZohoCRM.functions.execute.CREATE
2. workdrive_connection
   * WorkDrive.files.ALL

Head to Settings > Developer Space > Connections

1. Click Create Connection
2. Select Zoho OAuth
3. Enter a Connection Name
4. Select the required scopes (listed above).
5. Click Create and Connect
6. Click Connect
7. Select your Production System
8. Click Accept

## Functions
We will be creating 3 button functions for this automation and the code is provided below.

To create a function go to Settings > Developer Space > Functions

1. Click New Function
2. Enter a Function Name (No Spaces)
3. Enter a Display Name
4. Set the Category to Button
5. Click Create
6. Enter code below
7. Click Save

We need to expose the Account and Contact Buttons by the API so that we can trigger them from the Deal button if there is no client folder created yet.

To expose a function via REST API go to Settings > Developer Space > Functions

1. Click the ellipsis next to the function
2. Select REST API
3. Check the OAuth2 Toggle
4. Copy the URL that appears

### Contact Client WorkDrive Folder Function

1. Create a new function with the Category as "Button"
2. Enter the WorkDrive Client Folder URL in the function
3. Once saved, expose this function by REST API and take note of the URL

Contact Client WorkDrive Folder
```js
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
```

### Account Client WorkDrive Folder Function

1. Create a new function with the Category as "Button"
2. Enter the WorkDrive Client Folder URL in the function
3. Once saved, expose this function by REST API and take note of the URL

Account Client WorkDrive Folder
```js
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
```

### Deal WorkDrive Folder Function

1. Create a new function with the Category as "Button"
2. Enter the WorkDrive Client Folder URL in the function
3. Enter the Account Client WorkDrive Folder Button OAuth2 URL
4. Enter the Contact Client WorkDrive Folder Button OAuth2 URL

Deal WorkDrive Folder
```js
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
```

## Adding the Button and Link to the Record
To close out this automation we need to assign the button to each of the modules and create a link that you can use to open the WorkDrive folder.

![Button and Link Locations](https://static.wixstatic.com/media/c8c3af_744bd07831b440efa4f156a8bbeedb45~mv2.png)

### Adding the Create WorkDrive Folder Button
1. Go to Settings > Customization > Modules and Fields
2. Select one of the Modules (Contacts, Accounts & Deals)
3. Select Links and Buttons Tab
4. Select 'New Button'
5. Enter the buttons name 'Create WorkDrive Folder'
6. Select 'View Page' as to where the button is located
7. Select 'From Exisiting Actions' for the action the button will perform
8. Select the function for the relevant module you are configuring
9. Enter the argument value, press # in the field and select the relevant modules ID
10. Click Save
11. Click Save again
12. Click the Cog Icon to the left of the button you created
13. Click Set Permission
14. Select which profiles will have access to this button
15. Click Save
16. Repeat this for all Modules (Contacts, Accounts & Deals)

### Adding the WorkDrive Folder Link
Although clicking the 'Create WorkDrive Folder' button will open the existing folder if it already exists, the user might prefer to use the link on the side as you have other existing links that relate to the record. Alternatively you can just name the button 'WorkDrive Folder' and it will create/open as required.

1. Go to Settings > Customization > Modules and Fields
2. Select one of the Modules (Contacts, Accounts & Deals)
3. Select Links and Buttons Tab
4. Select 'New Link'
5. Enter the link Label 'WorkDrive Folder'
6. Build your link by adding in your WorkDrive Client Folder URL and removing the last part of that URL which contains 'files' (See below for Example)
7. Then you can choose the WorkDrive Folder ID field from the Fields Section so it will add that value in dynamically for each record.
8. You can update the permissions for who can see this link if required.
9. Click Save
10. Repeat this for all Modules (Contacts, Accounts & Deals)

Example URL:
*https://workdrive.zoho.com/home/phxwy1e9e0a5785f647818cf9f29c13dc9987/teams/phxwy1e9e0a5785f647818cf9f29c13dc9987/ws/h8idl8885465f49fc42849e97ab3733f15e95/folders/${Deals.WorkDrive Folder ID}*

I trust that this article has helped provide you with valuable insights and step-by-step guidance to implement a seamless integration between Zoho CRM and Zoho WorkDrive. By following the strategies and instructions detailed here, you can transform your client folder management and deal organisation, bringing efficiency and structure to your business workflow. 

Need Help? [Contact us!](https://www.squarelabs.com.au/contact-us)

## Resources
GitHub Code: https://github.com/squarelabsgit/zoho-workdrive-client-folders 

