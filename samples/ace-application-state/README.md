# state-sample

## Summary

This sample is setup to illustrate the use of `state` with ACE solutions. Similar but not identical to React state you can use state to manage the data with your ACE. Unlike React each ACE has a shared state used by all hosted cards, either CardViews or QuickViews. During the init method of the ACE you set an initial state, which can later be modified using setState. The behavior of setState mimics what you may be familiar with from React - you can supply all or part of a new state and it will be merged with an existing state.

## Used SharePoint Framework Version

![version](https://img.shields.io/badge/version-1.13-green.svg)

## Applies to

- [SharePoint Framework](https://aka.ms/spfx)
- [Microsoft 365 tenant](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/set-up-your-developer-tenant)

> Get your own free development tenant by subscribing to [Microsoft 365 developer program](http://aka.ms/o365devprogram)

## Prerequisites

> Any special pre-requisites?

## Solution

Solution|Author(s)
--------|---------
state-sample | Patrick Rodgers (Microsoft)

## Version history

Version|Date|Comments
-------|----|--------
1.0|January 18, 2022|Initial release

## Disclaimer

**THIS CODE IS PROVIDED *AS IS* WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

---

## Minimal Path to Awesome

- Clone this repository
- Ensure that you are at the solution folder
- in the command-line run:
  - **npm install**
  - **gulp serve**

> Include any additional steps as needed.

## Features

State is an in-memory representation of your application's working values. It is important when designing your application to manage performance using a mix of state, local/session storage, network calls, and selectively loading information on-demand. For example this sample loads the list of items and stores them in local storage, but only the top 20, along with title and id. Only when viewed is the full details loaded. In this example the "details" are just another single field, but could include many fields, information from multiple sources, or database calls. Load as little as possible upfront and defer loading expensive data. As well, it is likely not a good idea to cache all of the data in local/session storage as there are per-domain limits. Focus on loading that data which enables a fast load first expience for your ACE.


> Share your web part with others through Microsoft 365 Patterns and Practices program to get visibility and exposure. More details on the community, open-source projects and other activities from http://aka.ms/m365pnp.

## References

- [Getting started with SharePoint Framework](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/set-up-your-developer-tenant)
- [Building for Microsoft teams](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/build-for-teams-overview)
- [Use Microsoft Graph in your solution](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/get-started/using-microsoft-graph-apis)
- [Publish SharePoint Framework applications to the Marketplace](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/publish-to-marketplace-overview)
- [Microsoft 365 Patterns and Practices](https://aka.ms/m365pnp) - Guidance, tooling, samples and open-source controls for your Microsoft 365 development