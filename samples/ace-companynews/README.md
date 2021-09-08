# Company News ACE

## Summary

This example shows an ACE which provides a news article rotator with Quick View for full article details. It shows previous/next buttons, and how to launch the Quick View for the current article. Additionally, you can like/unlike articles directly from the QuickView. The Card View shows an image, headline

Highlights:

- Reading properties
- Fetching data
- 3P library works (bundling, etc.)
- reading/writing SP works as expected (context familiar to SPFx devs)
- simple state management, editing view
- Submit action handling in ACE and Quick View
- Loading data on activation of Quick View

### Screen Shots

![Card View](./assets/cardview.png)

_Card View_

![Quick View](./assets/quickview.png)

_Quick View_


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
teams-chat-card | Microsoft

## Version history

Version|Date|Comments
-------|----|--------
1.0|August 22, 2021|Initial release

## Disclaimer

**THIS CODE IS PROVIDED *AS IS* WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

---

## Minimal Path to Awesome

- Clone this repository
- Ensure that you are at the solution folder -> `comapnynews-spfx`
- in the command-line run:
  - **npm install**
  - **gulp serve --nobrowser**

> You will need to set the card size to "Large" for correct display.

### SharePoint List

This sample references a SharePoint list in the current site titled "VivaDemoCompNews" with the  fields shown in the table below. Additionally, the ability to like/comment must be enabled for the list.

|name|type|usage
|---|---|---|
| svgicon | Multiple lines of text | string representation of svg icon used in views
| fullcontent | Multiple lines of text | the full article content
| topic | Choice | set of choices for types of articles
| vivaimg | Image | image associated with the article

## References

- [Getting started with SharePoint Framework](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/set-up-your-developer-tenant)
- [Building for Microsoft teams](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/build-for-teams-overview)
- [Use Microsoft Graph in your solution](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/get-started/using-microsoft-graph-apis)
- [Publish SharePoint Framework applications to the Marketplace](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/publish-to-marketplace-overview)
- [Microsoft 365 Patterns and Practices](https://aka.ms/m365pnp) - Guidance, tooling, samples and open-source controls for your Microsoft 365 development
