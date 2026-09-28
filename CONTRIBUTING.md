# Contribution Guidance

Thank you for contributing to the SharePoint Framework reference scenarios. Keep each pull request focused on one sample or one related documentation change.

## Sample structure

Place each sample in its own folder under `samples`. A new sample folder must include:

- the solution source code
- an `assets` folder with at least one screenshot
- an `assets/sample.json` metadata file
- a sample-root `README.md`
- an `.nvmrc` file matching the Node.js version supported by the sample's SharePoint Framework version

Use [the sample README template](templates/README-template.md) and update every placeholder. The `README.md` must remain at the sample root, not only inside a nested implementation or solution folder.

The `assets/sample.json` file is used to publish the sample in Microsoft 365 sample galleries. Follow the structure used by existing samples and make sure its title, descriptions, repository URL, products, SharePoint Framework version, screenshots, authors, and references describe the submitted sample. Repository URLs and image URLs must point to the sample's final location in `pnp/spfx-reference-scenarios`.

## Sample README

Document what the sample does, its prerequisites, supported SharePoint Framework version, setup steps, features, and references. Store screenshots in the sample-root `assets` folder and reference them with repository-relative paths.

The final non-empty line of the sample-root `README.md` must be the visitor statistics image:

```html
<img src="https://m365-visitor-stats.azurewebsites.net/spfx-reference-scenarios/{sample-path}" />
```

`{sample-path}` is the slash-separated path from the repository root to the sample folder, without a leading slash. For example, the sample in `samples/ace-chat` must end with:

```html
<img src="https://m365-visitor-stats.azurewebsites.net/spfx-reference-scenarios/samples/ace-chat" />
```

Use the HTML `<img>` element exactly as shown. Do not use Markdown image syntax, add content after the image, or use a retired visitor statistics endpoint.

## Submitting a pull request

1. Fork [pnp/spfx-reference-scenarios](https://github.com/pnp/spfx-reference-scenarios).
2. Create a branch from the latest `main`.
3. Add or update one sample per pull request.
4. Build and test the sample with its documented Node.js and SharePoint Framework versions.
5. Confirm the sample-root `README.md`, `assets/sample.json`, screenshots, and visitor statistics image are complete.
6. Push the branch to your fork and open a pull request against this repository's `main` branch.
7. Describe the scenario, testing performed, and any setup requirements in the pull request, then address the automated sample validation results.

Before submitting, remove generated packages, build output, dependencies, credentials, tenant-specific values, and other files that are not required to build and understand the sample.

## Community calls and demos

Join the [weekly community calls](https://aka.ms/community/calls) for Copilot, Microsoft 365, and Power Platform updates. Everyone is welcome.

You can also [sign up to present a demo](https://aka.ms/community/request/demo) to share your learnings and provide input to the community.

## Code of Conduct

This repository has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). For more information, see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or contact [opencode@microsoft.com](mailto:opencode@microsoft.com).

> Sharing is caring!
