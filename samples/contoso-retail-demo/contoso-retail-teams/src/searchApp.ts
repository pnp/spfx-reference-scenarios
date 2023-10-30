import { default as axios } from "axios";
import { TeamsActivityHandler, CardFactory, TurnContext } from "botbuilder";
import { ResponseType, Client } from "@microsoft/microsoft-graph-client";
import { TokenCredentialAuthenticationProvider } from "@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials";
import {
  MessageExtensionTokenResponse,
  handleMessageExtensionQueryWithSSO,
  OnBehalfOfCredentialAuthConfig,
  OnBehalfOfUserCredential,
} from "@microsoft/teamsfx";
import "isomorphic-fetch";
import config from "./config";

const oboAuthConfig: OnBehalfOfCredentialAuthConfig = {
  authorityHost: config.authorityHost,
  clientId: config.clientId,
  tenantId: config.tenantId,
  clientSecret: config.clientSecret,
};

const initialLoginEndpoint = `https://${config.botDomain}/auth-start.html`;

export class SearchApp extends TeamsActivityHandler {
  constructor() {
    super();
  }

  // Search.
  public async handleTeamsMessagingExtensionQuery(
    context: TurnContext,
    query: any
    ): Promise<any> {
      return await handleMessageExtensionQueryWithSSO(
        context,
        oboAuthConfig,
        initialLoginEndpoint,
        ["User.Read"],
        async (token: MessageExtensionTokenResponse) => {

          // Get the search query
          const searchQuery = query.parameters[0].value;

          // User Code
          const credential = new OnBehalfOfUserCredential(
            token.ssoToken,
            oboAuthConfig
          );

          var contosoRetailToken = await credential.getToken([`${config.apiUniqueUri}ContosoRetail.Consume`]);
          var contosoRetailTokenValue = contosoRetailToken.token;
          var apiUrl = `${config.searchApiUrl}?q=${searchQuery}`;

          const attachments = [];
          if (query.parameters[0] && query.parameters[0].name === "initialRun") {
            // Initial run
          } else {
            // Query the Contoso Retail API
            const response = await axios.get(
              apiUrl,
              {
                headers: {
                  Authorization: `Bearer ${contosoRetailTokenValue}`,
                }
              }
            );
            
            response.data.items.forEach((p) => {
              const adaptiveCard = CardFactory.adaptiveCard({
                $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
                type: "AdaptiveCard",
                version: "1.4",
                body: [
                  {
                    type: "Image",
                    url: `${p.picture}`,
                    style: "default",
                  },
                  {
                    type: "TextBlock",
                    text: `${p.code}`,
                    wrap: true,
                    size: "Large",
                  },
                  {
                    type: "TextBlock",
                    text: `${p.description}`,
                    wrap: true,
                    size: "medium",
                  },
                ],
              });
              const preview = CardFactory.heroCard(p.description, [p.picture]);
              const attachment = { ...adaptiveCard, preview };
              attachments.push(attachment);
            });        
          }
          return {
            composeExtension: {
              type: "result",
              attachmentLayout: "list",
              attachments: attachments,
            },
          };
        }
      );
    }
  }
