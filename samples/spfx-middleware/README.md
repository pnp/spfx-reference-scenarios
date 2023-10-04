# Consuming backend APIs from SPFx via middleware using the Azure Entra ID on-behalf-of flow

## Summary

This is a sample solution that illustrates how to invoke a middleware Web API/service, from a SharePoint Framework solution, relying on the On-Behalf-Of (OBO) flow in order to consume a backend Web API/service like Microsoft Graph, SharePoint Online, or any 3rd Party APIs.

![SPFx OBO Preview](./assets/spfx-middleware-consumer-ui.png)

Here you can see a functional diagram of the OBO grant flow:

![SPFx OBO Preview](./assets/OBO-Functional-Diagram.png)

## Applies to

- [SharePoint Framework](https://aka.ms/spfx)
- [Microsoft Viva Connections](https://www.microsoft.com/en-us/microsoft-viva/connections)
- [Microsoft 365 tenant](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/set-up-your-developer-tenant)

> Get your own free development tenant by subscribing to [Microsoft 365 developer program](http://aka.ms/o365devprogram)

## Documentation
You can find additional technical details about the OBO grant flow reading the [Microsoft identity platform and OAuth 2.0 On-Behalf-Of flow](https://learn.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-on-behalf-of-flow) document.

## Prerequisites

The SPFx solution relies on a middleware APIs built with .NET 6 and ASP.NET Minimal APIs. The source code of the APIs is available [here](./spfx-middleware-apis/) in this repository. You will find one API:
- *ConsumeWithOBO*: retrieves the user principal name of the current user via Microsoft Graph and the title of the current web via SharePoint Online REST APIs.

The SPFx solution is available [here](./spfx-middleware-consumer/) in this repository.

## Solution

Solution|Author(s)
--------|---------
SPFx Middleware | Paolo Pialorsi - [PiaSys.com](https://www.piasys.com/) - [@PaoloPia](https://twitter.com/PaoloPia)

## Version history

Version|Date|Comments
-------|----|--------
1.0|October 4, 2023|Initial release

## Disclaimer

**THIS CODE IS PROVIDED *AS IS* WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

---

## References

- [Extend Microsoft Viva Connections Learn Path](https://aka.ms/m365/dev/learn/connections)
- [Getting started with SharePoint Framework](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/set-up-your-developer-tenant)
- [Building for Microsoft teams](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/build-for-teams-overview)
- [Use Microsoft Graph in your solution](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/get-started/using-microsoft-graph-apis)
- [Connect to Azure AD-secured APIs in SharePoint Framework solutions](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/use-aadhttpclient)
- [Microsoft identity platform and OAuth 2.0 On-Behalf-Of flow](https://learn.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-on-behalf-of-flow)
- [Microsoft 365 Patterns and Practices](https://aka.ms/m365pnp) - Guidance, tooling, samples and open-source controls for your Microsoft 365 development

<img src="https://m365-visitor-stats.azurewebsites.net/spfx-reference-scenarios/samples/spfx-middleware" />