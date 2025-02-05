import { DefineFunction, SlackFunction, Schema } from "deno-slack-sdk/mod.ts";

export const NewDocumentFunction = DefineFunction({
  callback_id: "new_document",
  title: "New Document",
  description: "Create a new template through SignTime API",
  source_file: "functions/NewDocumentFunction.ts",
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
    properties: {
      doc_id: {
        type: Schema.types.string,
        description: "ID of document created by Slack API"
      },
      party_id: {
        type: Schema.types.string,
        description: "Party ID to set components"
      }
    },
    required: [],
  },
});

export default SlackFunction(NewDocumentFunction, async({ inputs }) => {
  const endpoint = `https://api.signtime.com/api/v1/documents/new`;
  const email = inputs.signature_email;
  
  const headers = {
    authorization: "Bearer " + String(inputs.api_key),
  };

  //Dealing with the input template here 
  const fileUrl = "https://justin-hong22.github.io/timecard-app/functions/templates/timecard_template.pdf";
  const response = await fetch(fileUrl);
  const fileBuffer = await response.arrayBuffer();
  const file = new Blob([fileBuffer], { type: "application/pdf" });

  const body = new FormData();  
  body.append("file", file, "timecard_template.pdf");
  body.append("subject", "Slack API Test");
  body.append("expires_at", new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString());
  body.append("parties[][name]", "送信者");
  body.append("parties[][email]", email);
  body.append("parties[][order]", "-1");
  
  let doc_id = "";
  let party_id = "";
  try
  {
    await fetch(endpoint, {
      method: "POST",
      headers,
      body,
      redirect: "follow",
    }).then(async (res: Response) => {
      if (res.status == 201) {
        const jsonData = await res.json();
        doc_id = jsonData.id;
        party_id = jsonData.parties[0].id;
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

  return { outputs: { doc_id: doc_id, party_id: party_id, } };
});