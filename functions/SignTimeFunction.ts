import { DefineFunction, SlackFunction, Schema } from "deno-slack-sdk/mod.ts";

export const SignTimeFunction = DefineFunction({
  callback_id: "download_pdf",
  title: "Download PDF",
  description: "Download reports into a PDF",
  source_file: "functions/SignTimeFunction.ts",
  input_parameters: {
    properties: {
      channel_id: {
        type: Schema.slack.types.channel_id,
        description: "The channel id from where to get messages",
      },
      time_entries: {
        type: Schema.types.string,
        description: "Either a weekly, monthly or general report"
      },
      holidays: {
        type: Schema.types.string,
        description: "Either a weekly, monthly or general report"
      },
      user: {
        type: Schema.slack.types.user_id,
        description: "The user to collect time entries"
      }
    },
    required: [],
  },
  output_parameters: {
    properties: {},
    required: [],
  },
});

export default SlackFunction(SignTimeFunction, async({ /*inputs,*/ env }) => {
  const endpoint = `https://api.signtime.com/api/v1/users`;
  const headers = {
    Accept: "application/json",
    authorization: "Bearer " + env.SIGNTIME_APIKEY,
  };

  try
  {
    await fetch(endpoint, {
      method: "GET",
      headers,
    }).then(async (res: Response) => {
      if (res.status === 200) {
        const jsonData = await res.json();
        return jsonData;
      }
      else {
        throw new Error(`${res.status}: ${res.statusText}`);
      }
    });
  }
  catch(error)
  {
    console.log(error);
    throw new Error(`An error was encountered - \`${error.message}\``)
  }

  return { outputs: {} };
});