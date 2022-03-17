# Sharing State Across ACEs

## Summary

This example shows how to build ACEs that share state and data logic through an SPFx library component.

Highlights:

- library component for coordinating data fetch
- shared caching
- ACEs loading library component and calling methods
- Patterns works for ACEs deployed in multiple solutions

## Used SharePoint Framework Version

![version](https://img.shields.io/badge/version-1.14.0-green.svg)

## Applies to

- [SharePoint Framework](https://aka.ms/spfx)
- [SharePoint Framework Library Component](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/library-component-tutorial)
- [Microsoft 365 tenant](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/set-up-your-developer-tenant)

> Get your own free development tenant by subscribing to [Microsoft 365 developer program](http://aka.ms/o365devprogram)

## Prerequisites

None

## Solution

Solution|Author(s)
--------|---------
ace-project | Microsoft
lib-project | Microsoft

## Version history

Version|Date|Comments
-------|----|--------
1.0|March 17, 2022|Initial release

## Disclaimer

**THIS CODE IS PROVIDED *AS IS* WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

---

## Minimal Path to Awesome

- Clone this repository
- Ensure that you are at the solution folder
- in the command-line run:
  - **npm install**
  - **gulp serve --nobrowser**

> Edit the webpart and paste in the URL to a Team channel to enable the communications. You may have to refresh the page after pasting in the link.


## References

- [Extend Microsoft Viva Connections Learn Path](https://aka.ms/m365/dev/learn/connections)
- [Getting started with SharePoint Framework](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/set-up-your-developer-tenant)
- [Building for Microsoft teams](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/build-for-teams-overview)
- [Use Microsoft Graph in your solution](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/get-started/using-microsoft-graph-apis)
- [Publish SharePoint Framework applications to the Marketplace](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/publish-to-marketplace-overview)
- [Microsoft 365 Patterns and Practices](https://aka.ms/m365pnp) - Guidance, tooling, samples and open-source controls for your Microsoft 365 development

<img src="https://pnptelemetry.azurewebsites.net/spfx-reference-scenarios/samples/ace-shared-state" />