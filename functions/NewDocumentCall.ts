import { DefineFunction, SlackFunction, Schema } from "deno-slack-sdk/mod.ts";
import fs from "node:fs";

export const NewDocumentCall = DefineFunction({
  callback_id: "download_pdf",
  title: "Download PDF",
  description: "Download reports into a PDF",
  source_file: "functions/NewDocumentCall.ts",
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

export default SlackFunction(NewDocumentCall, async({ /*inputs,*/ env }) => {
  const endpoint = `https://api.signtime.com/api/v1/documents/new`;
  // const endpoint = "https://api.signtime.com/api/v1/users";
  
  const headers = {
    authorization: "Bearer " + env.SIGNTIME_APIKEY,
    // 'Content-Type': 'application/json',
  };

  const body = new FormData();  
  const filePath = "/Users/justinhong/Desktop/timecard-app/functions/templates/timecard_template.pdf";
  const fileBuffer = fs.readFileSync(filePath);
  const file = new Blob([fileBuffer], { type: 'application/pdf' });

  body.append("file", file, "timecard_template.pdf");
  body.append("subject", "test data");
  body.append("expires_at", "2025-02-21T01:20:49.042Z");
  body.append("parties[][name]", "送信者");
  body.append("parties[][email]", "hong.justin6@gmail.com.com");
  body.append("parties[][order]", "-1");

  try
  {
    await fetch(endpoint, {
      method: "POST",
      headers,
      body,
    }).then(async (res: Response) => {
      if (res.status === 200) {
        const jsonData = await res.json();
        console.log(jsonData);
        return jsonData;
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

  return { outputs: {} };
});