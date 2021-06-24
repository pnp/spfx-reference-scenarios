---
page_type: sample
products:
- office-sp
languages:
- typescript
extensions:
  contentType: samples
  technologies:
  - SharePoint Framework
  createdDate: 6/24/2021 10:21:43 AM
---
# SharePoint Framework sample solutions for Microsoft Teams

Samples targeted to showcase the power of SharePoint Framework in the Microsoft Teams and in Viva Connections. Notice that these are using preview version of the SharePoint Framework 1.13, which in currently planned to get released in early July. You will need to have access on the preview bits to be able to scaffoled these solutions.

- [Covid Self-Attestiation Microsoft Teams personal app sample](samples/codid/readme.md) - with Viva Connections Card
- [World Clock Reference Microsoft Teawms personal app](samples/codid/readme.md) - with Viva Connections Card


## Have issues or questions?

Please use following logic on submitting your questions or issues to right location to ensure that they are noticed and addressed as soon as possible.

* You have general question or challenge with SPFx - use [sp-dev-docs repository issue list](https://github.com/SharePoint/sp-dev-docs/issues).
* You have issue on specific web part or sample - use [issue list in this repository](https://github.com/pnp/sp-dev-fx-webparts/issues).

## Additional resources

* [Overview of the SharePoint Framework](https://docs.microsoft.com/sharepoint/dev/spfx/sharepoint-framework-overview)
* [SharePoint Framework development tools and libraries](https://docs.microsoft.com/sharepoint/dev/spfx/tools-and-libraries)
* [Getting Started](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/set-up-your-developer-tenant)

## Using the samples

To build and start using these projects, you'll need to clone and build the projects.

Clone this repository by executing the following command in your console:

```shell
git clone https://github.com/pnp/sp-dev-fx-webparts.git
```

Navigate to the cloned repository folder which should be the same as the repository name:

```shell
cd sp-dev-fx-webparts
```

To access the samples use the following command, where you replace `sample-folder-name` with the name of the sample you want to access.

```shell
cd samples
cd sample-folder-name
```

and for the tutorials, use the following command:

```shell
cd tutorials
```

Now run the following command to install the npm packages:

```shell
npm install
```

This will install the required npm packages and dependencies to build and run the client-side project.

Once the npm packages are installed, run the following command to preview your web parts in SharePoint Workbench:

```shell
gulp serve
```

## Authors
This repository's contributors are all community members who volunteered their time to share code samples. Work is done as an open source community project, with each sample contained in their own solution.

## Contributions

These samples are direct from the feature teams, SharePoint PnP core team (http://aka.ms/m365pnp) or shared by the community. We welcome your input on issues and suggestions for new samples. We do also welcome community contributions around the client-side web parts. If you have any questions, just let us know.

Please have a look on our [Contribution Guidance](./CONTRIBUTING.md) before submitting your pull requests, so that we can get your contribution processed as fast as possible.

## Code of Conduct
This repository has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

> Sharing is caring!
