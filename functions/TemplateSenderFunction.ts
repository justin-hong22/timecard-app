import { DefineFunction, SlackFunction, Schema } from "deno-slack-sdk/mod.ts";
import { SlackAPIClient } from "deno-slack-api/types.ts";

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
      user: {
        type: Schema.slack.types.user_id,
        description: "The user to collect time entries"
      },
      report_type: {
        type: Schema.types.string,
        description: "Either a weekly, monthly or general report"
      },
      time_data: {
        type: Schema.types.string,
        description: "time entries inputted"
      },
      holidays: {
        type: Schema.types.string,
        description: "List the holidays if any"
      },
      comments: {
        type: Schema.types.string,
        description: "List the comments if any"
      },
    },
    required: ['api_key', 'user', 'report_type', 'time_data', 'holidays', 'comments'],
  },
  output_parameters: {
    properties: {},
    required: [],
  }
});

async function getUserInfo(client : SlackAPIClient, user_id: string)
{
  const user_info = await client.users.info({user: user_id});
  const name = user_info.user.real_name;
  const email = user_info.user.profile.email;

  return {name: name, email: email}
}

export default SlackFunction(TemplateSenderFunction, async({inputs, env, client}) => {
  const template_id = String(env.TEMPLATE_ID).trim();
  const api_key = String(inputs.api_key);
  const report_type = String(inputs.report_type);
  const time_data = String(inputs.time_data);
  const holidays = String(inputs.holidays).replace(/,/g, " &");
  const comments = String(inputs.comments);

  const user_info = await getUserInfo(client, String(inputs.user));
  const name = user_info.name;
  const email = user_info.email;

  const endpoint = new URL(`${template_id}/launch`, "https://api.signtime.com/api/v1/templates/");
  const headers = {
    accept: "application/json",
    authorization: "Bearer " + api_key,
  };

  const fields_value = `${name}, ${report_type}, ${time_data}, ${holidays}, ${comments}`;
  const body = new FormData();
  body.append("id", template_id);
  body.append("subject", "Slack API Template Test"); //CHANGE ME
  body.append("parties[label]", "sender");
  body.append("parties[name]", "送信者");
  body.append("parties[email]", email);
  body.append("merge_fields[name]", "name, report_type, time_entries, holidays, comments");
  body.append("merge_fields[value]", fields_value);  

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