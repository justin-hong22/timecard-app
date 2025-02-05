import { DefineFunction, SlackFunction, Schema } from "deno-slack-sdk/mod.ts";

export const SendDocumentFunction = DefineFunction({
  callback_id: "send_document",
  title: "Send Document",
  description: "Annotates the document and sends it off for signature",
  source_file: "functions/SendDocumentFunction.ts",
  input_parameters: {
    properties: {
      api_key: {
        type: Schema.types.string,
        description: "SignTime API key"
      },
      document_id: {
        type: Schema.types.string,
        description: "id of the new document created in NewDocumentFunction"
      },
    },
    required: ['api_key', 'document_id'],
  },
  output_parameters: {
    properties: {},
    required: [],
  }
});

async function apiCallFunction(headers: {Accept: string; Authorization : string}, doc_id : string, call_type : string)
{
  const endpoint = new URL(`${doc_id}/${call_type}`, "https://api.signtime.com/api/v1/documents/");
  console.log("endpoint = " + endpoint);

  try
  {
    await fetch(endpoint, {
      method: "POST",
      headers,
    }).then(async (res: Response) => {
      if (res.status == 201) {
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
}

export default SlackFunction(SendDocumentFunction, async({inputs}) => 
{
  const headers = {
    Accept: "application/json",
    Authorization: "Bearer " + String(inputs.api_key),
  };

  const doc_id = String(inputs.document_id).trim();
  await apiCallFunction(headers, doc_id, 'annotate');
  await apiCallFunction(headers, doc_id, 'send');

  return { outputs: {} }
});