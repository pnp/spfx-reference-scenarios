# covid-spfx

## Summary

This solution depicts how you can build a teams based custom form that collects information from users and provides a custom dashboard for working with the results.

![Check-In Process](./images/Check-In.gif)

In this case we've built a solution that allows an administrator to define a set of questions to verify the health of an individual entering an office space during the pandemic.

![Administration](./images/Administration.gif)

Their entry will be added to a central list that then is displayed on a dashboard that a receptionist or security station can review when people enter the building. The solution also allows someone to enter the answers for a guest entering the building. Later if needed a search can be performed across a time frame to ascertain who was in contact with each other and might need to be warned of an outbreak.

![Front-Desk](./images/Front-Desk.gif)

### Viva Dashboard Adaptive Card Extension (ACE)

This solution also contains a Viva Desktop Adaptive Card Extension. As of this time the Dashboard page layout is not generally available so unless you were part of the private preview program you will not be able to add the extension to a page in SharePoint however, if you have access to SPFx 1.13 you can download the source code and serve the solution into the workbench to view the ACE.

![COVID Attestation ACE](./images/CovidACE.gif)

## Used SharePoint Framework Version

![version](https://img.shields.io/badge/version-1.13.0-green.svg)

## Applies to

- [SharePoint Framework](https://aka.ms/spfx)
- [Microsoft 365 tenant](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/set-up-your-developer-tenant)

> Get your own free development tenant by subscribing to [Microsoft 365 developer program](http://aka.ms/o365devprogram)

## Solution

Solution|Author(s)
--------|---------
covid-spfx | Sympraxis Consulting (@SympraxisC)

## Version history

Version|Date|Comments
-------|----|--------
1.0|January 29, 2021|Initial release

## Disclaimer

**THIS CODE IS PROVIDED *AS IS* WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

---

## Minimal Path to Awesome

### Deploy Default Build

A default solution (sppkg) file for this sample exists in the [deployment](./deployment) folder. This sppkg will need to be deployed in the tenants site collection app catalog with the `Make this solution available to all sites in teh organization` option selected. By doing so the solution will be available in every site collection in the tenant, however since the solution has not been enabled for SharePoint deployment it will not be seen anywhere in the SharePoint user interface. Instead, the Teams manifest that is included in the package will be deployed which creates a Personal App that can then be pinned to the left rail in Teams and, if desired, audience targeted to specific user groups using the [Manage app setup policies in Microsoft Teams](https://docs.microsoft.com/en-us/MicrosoftTeams/teams-app-setup-policies).

When complete the solution will be running in the root site collection and so the four custom lists that are created and permissions for the various features of the solution will come from the configuration of that root site collection. If you wish to have a specific, custom site collection, host the solution you can still use this sppkg file but you will need to skip step 4 below that sync's the packaged manifest to teams. Instead, you will need to review the [Custom Manifest](./Custom_Manifest) documentation to create an load an alternative manifest.

For even more details about alternate deployment options please review [Custom Build](./covid-spfx/README.md#Custom_Build) documentation for details.

#### Steps for deployment

1. Download the SPPKG file, navigate to the [covid-spfx.sppkg](./deployment/covid-spfx.sppkg) file in the [deployment](./deployment) folder of this repository. Select `Download` to save the file to your computer.
1. Upload the sppkg file into the tenant's app catalog by selecting upload, finding the file, and then selecting `OK`.

    ![Upload SPPKG File](./images/UploadSPPKG.png)

1. A dialog will be displayed asking if you trust the solution. **Make sure you check the `Make this solution available to all sites in teh organization`** check box and then select `Deploy`.

    ![Deploy SPPKG](./images/DeploySPPKG.png)

1. After the solution has deployed you will need to authorize the Graph API permissions requested. To see, and approve, them navigate to the SharePoint Admin Center and then to the `API access` section under `Advanced` menu item. This will show you a list of pending permissions requests. By selecting each request and then selecting `Approve` the permissions will be granted to allow the solution to access the information it needs through the Microsoft Graph. For more information on the individual permissions this solution is requesting please see the [Microsoft Graph REST API v1.0 reference](https://docs.microsoft.com/en-us/graph/api/overview?toc=.%2Fref%2Ftoc.json&view=graph-rest-1.0)

    ![Approve API Permissions](./images/ApproveAPIPermissions.png)

1. After the solution has deployed you will need to sync the solution into your Teams app store. To do so, select the solution in the app catalog and then under the files tab in the ribbon the `Sync to Teams` option will be enabled, select it.

    ![Sync App Manifest To Teams](./images/SyncToTeams.png)

1. Assuming you received no errors while the solution during the Teams sync, and you've approved the API permissions, you should now be able to add it into your Teams App Bar as a personal tab. You may want to consider adding the app as a custom pinned site based on the Teams setup policies, you can learn more about doing so by visiting [Manage app setup policies in Microsoft Teams](https://docs.microsoft.com/en-us/MicrosoftTeams/teams-app-setup-policies). Further, for more information on changing the permissions on who has access to the app, you can read more [View app permissions and grant admin consent in the Microsoft Teams admin center](https://docs.microsoft.com/en-us/microsoftteams/app-permissions-admin-center).

### Custom Manifest

The one drawback of a pre-packaged solution is the inability to target a specific site collection dynamically, ergo the solution deploys, by default, to the root site collection. If you would like to make a communication site specifically for hosing this solution (i.e. the location where custom data is stored) then you can do so by downloading a copy of the manifest.json as well as the two image files from the Teams folder in the source code. With small adjustments you can then target the personal app to a particular site collection you've already created and then upload the Teams app package to customize the location vs deploying the manifest bundled into the sppkg file.

1. Download the two image files for the app in the teams folder by navigate to [/covid-spfx/teams](./covid-spfx/teams). Click on each image file and select `Download` to save the file to your computer.
1. Create a file named `manfiest.json` using a text editor like [VSCode](https://code.visualstudio.com/Download) in the same folder where you downloaded the images in step 1. 
1. Navigate to the manifest.json file in the teams folder and select `Raw` and then copy the contents of the screen and paste it into the manfiest.json file.
1. Modify the /staticTabs/contentUrl value to point to your specific site collection url by adding the relative path to the site collection in the `dest` query string parameter of the url. The updated value below shows the site collection url to be /sites/covid/
    original value:

    ```json
    "contentUrl": "https://{teamSiteDomain}/_layouts/15/TeamsLogon.aspx?SPFX=true&dest=/_layouts/15/teamshostedapp.aspx%3Fteams%26personal%26componentId=3ab8fb75-8f80-4ff1-90a3-6f711ad27c1d%26forceLocale={locale}",
    ```

    updated value:

    ```json
    "contentUrl": "https://{teamSiteDomain}/_layouts/15/TeamsLogon.aspx?SPFX=true&dest=/sites/covid/_layouts/15/teamshostedapp.aspx%3Fteams%26personal%26componentId=141d4ab7-b6ca-4bf4-ac59-25b7bf93642d%26forceLocale={locale}",
    ```

1. Zip the two image files plus the manifest.json file, and upload the package into your Teams Admin center, for detail about this process please refer to [Publish a custom app by uploading an app package](https://docs.microsoft.com/en-us/microsoftteams/upload-custom-apps).

## References

- [Getting started with SharePoint Framework](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/set-up-your-developer-tenant)
- [Building for Microsoft teams](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/build-for-teams-overview)
- [Use Microsoft Graph in your solution](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/get-started/using-microsoft-graph-apis)
- [Publish SharePoint Framework applications to the Marketplace](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/publish-to-marketplace-overview)
- [Microsoft 365 Patterns and Practices](https://aka.ms/m365pnp) - Guidance, tooling, samples and open-source controls for your Microsoft 365 development
