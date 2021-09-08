# covid-spfx

## Summary

See root sample [README](../README.md)

## Used SharePoint Framework Version

![version](https://img.shields.io/badge/version-1.13.0-green.svg)

## Applies to

- [SharePoint Framework](https://aka.ms/spfx)
- [Microsoft 365 tenant](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/set-up-your-developer-tenant)

> Get your own free development tenant by subscribing to [Microsoft 365 developer program](http://aka.ms/o365devprogram)

## Prerequisites

None

## Solution

Solution|Author(s)
--------|---------
folder name | Author details (name, company, twitter alias with link)

## Version history

Version|Date|Comments
-------|----|--------
1.0|January 29, 2021|Initial release

## Disclaimer

**THIS CODE IS PROVIDED *AS IS* WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

---

## Minimal Path to Awesome

### Deploy Default Build

For details on deploying the default package supplied with this sample, please see the 
root sample [README](../README.md)

### Custom Build

- Clone this repository
- Ensure that you are at the solution folder
- in the command-line run:
  - **npm install**
  - **gulp serve**

#### Change Site Collection For Microsoft Teams Personal App

To change the location where the Microsoft Teams Personal App looks for the lists that contain the data for the Covid-19 Attestation App you can modify the manifest.json file in the [teams](./teams) folder to point to that site collection and then replace the updated manifest in the TeamsSPFxApp.zip file.

Under the `staticTabs` element, change the `contentUrl` element to include the relative site collection url in the `dest` property, in the example below replace `MyCovidSite` with your site collection.

  ```json
  "contentUrl": "https://{teamSiteDomain}/_layouts/15/TeamsLogon.aspx?SPFX=true&dest=/sites/MyCovidSite/_layouts/15/teamshostedapp.aspx%3Fteams%26personal%26componentId=3ab8fb75-8f80-4ff1-90a3-6f711ad27c1d%26forceLocale={locale}",
      
  ```

Once you do that you can then repackage and deploy the resulting sppkg solution to your tenant app catalog. In the command-line run the following commands and then follow the `Steps for deployment` in the root [README](../README.md#Steps-for-deployment).

  ```cmd
  gulp clean
  gulp bundle --ship
  gulp package-solution --ship
  ```

## References

- [Getting started with SharePoint Framework](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/set-up-your-developer-tenant)
- [Building for Microsoft teams](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/build-for-teams-overview)
- [Use Microsoft Graph in your solution](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/get-started/using-microsoft-graph-apis)
- [Publish SharePoint Framework applications to the Marketplace](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/publish-to-marketplace-overview)
- [Microsoft 365 Patterns and Practices](https://aka.ms/m365pnp) - Guidance, tooling, samples and open-source controls for your Microsoft 365 development
