import { DefineFunction, SlackFunction, Schema } from "deno-slack-sdk/mod.ts";

export const TemplateSenderFunction = DefineFunction({
  callback_id: "template_sender",
  title: "Template Sender",
  description: "Send a template for signature via SignTime API",
  source_file: "functions/TemplateSenderFunction.ts",
  input_parameters: {
    properties: {
      api_key: {
        type: Schema.types.string,
        description: "SignTime API key"
      },
      signature_email: {
        type: Schema.types.string,
        description: "Email to be sent to"
      }
    },
    required: ['api_key', 'signature_email'],
  },
  output_parameters: {
    properties: {},
    required: [],
  }
});

export default SlackFunction(TemplateSenderFunction, async({inputs, env}) => {
  const template_id = String(env.TEMPLATE_ID).trim();
  const api_key = String(inputs.api_key);
  const email = inputs.signature_email;
  const endpoint = new URL(`${template_id}/launch`, "https://api.signtime.com/api/v1/templates/");

  const headers = {
    accept: "application/json",
    authorization: "Bearer " + api_key,
  };

  const body = new FormData();
  body.append("id", template_id);
  body.append("subject", "Slack API Template Launch Test");
  body.append("parties[label]", "sender");
  body.append("parties[name]", "送信者");
  body.append("parties[email]", email);

  try
  {
    await fetch(endpoint, {
      method: "POST",
      headers,
      body
    }).then(async (res: Response) => {
      if(res.status == 201) {
        const _jsonData = await res.json();
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

  return { outputs: {} }
});