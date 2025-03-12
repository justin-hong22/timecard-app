import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";

export const GetOAuthFunction = DefineFunction({
  callback_id: "get_OAuth",
  title: "Get OAuth Token",
  description: "Gets an API Key to access SignTime API",
  source_file: "functions/GetOAuthFunction.ts",
  input_parameters: {
    properties: {
      decision: {
        type: Schema.types.boolean,
        description: "What the user decided"
      },
    },
    required: ['decision'],
  },
  output_parameters: {
    properties: {
      api_key: {
        type: Schema.types.string,
        description: "SignTime API key to call its functions"
      },
    },
    required: ['api_key'],
  }
});

export default SlackFunction(GetOAuthFunction, async({inputs, env}) => 
{
  if(inputs.decision == false) {
    return { outputs: { api_key: "" } }
  }

  let api_key = "";
  const endpoint = "https://api.signtime.com/oauth/token/";
  const headers = {};

  const body = new FormData();
  body.append('client_id', env.CLIENT_ID);
  body.append('client_secret', env.CLIENT_SECRET);
  body.append('grant_type', 'client_credentials');

  try
  {
    await fetch(endpoint, {
      method: "POST",
      headers,
      body,
    }).then(async (res: Response) => {
      if (res.status == 200) {
        const jsonData = await res.json();
        api_key = jsonData.access_token;
      }
      else {
        throw new Error(`${res.status}: ${res.statusText}`);
     }
    });
  }
  catch(error)
  {
    console.error(`An error was encountered - `, error);
    throw new Error(`An error was encountered - ${error.message}`);
  }

  return { outputs: { api_key: api_key } }
});