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
# SharePoint Framework Reference Samples

Samples targeted to showcase the power of SharePoint Framework in the Microsoft Teams and in Viva Connections. Notice that these are using preview version of the SharePoint Framework 1.13, which in currently planned to get released in mid September.

## Legend

All samples are prefixed with the following prefixes to indicate what type of solution they help illustrate. All prefixes have been added in alphabetically order.

- ace: Viva Connections Adaptive Card Extension
- teams: Custom Microsoft Teams manifest for personal apps and teams tabs.

## Index

- [Company News ACE](samples/ace-companynews/)
- [Basic ACE](samples/ace-basiccard/)
- [Teams Chat ACE](samples/ace-chat/)
- [Covid Self-Attestation Microsoft Teams Personal App](samples/ace-teams-covid/)
- [Executive Room Reservation Reference Microsoft Teams Personal App](samples/ace-teams-roomreservation/)
- [World Clock Microsoft Teams Personal App/Teams Tab](samples/ace-teams-worldclock/)

## Have issues or questions?

Please use following logic on submitting your questions or issues to right location to ensure that they are noticed and addressed as soon as possible.

- You have general question or challenge with SPFx - use [sp-dev-docs repository issue list](https://github.com/SharePoint/sp-dev-docs/issues).
- You have issue on specific web part or sample - use [issue list in this repository](https://github.com/pnp/spfx-teams/issues).

## Additional resources

- [Overview of the SharePoint Framework](https://docs.microsoft.com/sharepoint/dev/spfx/sharepoint-framework-overview)
- [SharePoint Framework development tools and libraries](https://docs.microsoft.com/sharepoint/dev/spfx/tools-and-libraries)
- [Getting Started](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/set-up-your-developer-tenant)

## Using the samples

To build and start using these projects, you'll need to clone and build the projects.

Clone this repository by executing the following command in your console:

```shell
git clone https://github.com/pnp/spfx-reference-scenarios.git
```

Navigate to the cloned repository folder which should be the same as the repository name:

```shell
cd spfx-reference-scenarios
```

To access the samples use the following command, where you replace `sample-folder-name` with the name of the sample you want to access and `sample-source` with the folder that contains the sample name ending in -spfx which is the source code.

```shell
cd samples
cd sample-folder-name
cd sample-source
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

These are Microsoft sanctioned reference samples only and we are not accepting pull requests at this time. We absolutely want and welcome community contributions in one of our other samples repos. See [Samples & Solutions](https://pnp.github.io/#samples) for more information.

## Code of Conduct

This repository has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

> Sharing is caring!
