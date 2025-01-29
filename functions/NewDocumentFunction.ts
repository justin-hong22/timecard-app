import { DefineFunction, SlackFunction, Schema } from "deno-slack-sdk/mod.ts";

export const NewDocumentFunction = DefineFunction({
  callback_id: "download_pdf",
  title: "Download PDF",
  description: "Download reports into a PDF",
  source_file: "functions/NewDocumentFunction.ts",
  input_parameters: {
    properties: {},
    required: [],
  },
  output_parameters: {
    properties: {
      doc_id: {
        type: Schema.types.string,
        description: "ID of document created by Slack API"
      }
    },
    required: [],
  },
});

export default SlackFunction(NewDocumentFunction, async({ env }) => {
  const endpoint = `https://api.signtime.com/api/v1/documents/new`;
  
  const headers = {
    authorization: "Bearer " + env.SIGNTIME_APIKEY,
  };

  //Dealing with the input template here
  const filePath = String(env.TEMPLATE_FILEPATH);
  const fileBuffer = Deno.readFileSync(filePath);
  const file = new Blob([fileBuffer], { type: "application/pdf" });

  const body = new FormData();  
  body.append("file", file, "timecard_template.pdf");
  body.append("subject", "Created by Slack API");
  body.append("expires_at", new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString());
  body.append("parties[][name]", "送信者");
  body.append("parties[][email]", "hong.justin6@gmail.com");
  body.append("parties[][order]", "-1");
  
  let doc_id = "";
  try
  {
    await fetch(endpoint, {
      method: "POST",
      headers,
      body,
      redirect: "follow",
    }).then(async (res: Response) => {
      if (res.status >= 200 && res.status < 300) {
        const jsonData = await res.json();
        doc_id = jsonData.id;
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

  return { outputs: { doc_id: doc_id, } };
});