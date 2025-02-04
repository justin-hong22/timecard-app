import { DefineFunction, SlackFunction, Schema } from "deno-slack-sdk/mod.ts";

export const SendDocumentFunction = DefineFunction({
  callback_id: "send_document",
  title: "Send Document",
  description: "Annotates the document and sends it off for signature",
  source_file: "functions/SendDocumentFunction.ts",
  input_parameters: {
    properties: {
      document_id: {
        type: Schema.types.string,
        description: "id of the new document created in NewDocumentFunction"
      },
    },
    required: ['document_id'],
  },
  output_parameters: {
    properties: {},
    required: [],
  }
});

async function apiCallFunction(headers: {Accept: string; Authorization : string}, endpoint : string)
{
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

export default SlackFunction(SendDocumentFunction, async({inputs, env}) => 
{
  const doc_id = String(inputs.document_id);
  const headers = {
    Accept: "application/json",
    Authorization: "Bearer " + env.SIGNTIME_APIKEY,
  };

  const annotateEndpoint = `https://api.signtime.com/api/v1/documents/${doc_id}/annotate`;
  await apiCallFunction(headers, annotateEndpoint);

  const sendEnpoint = `https://api.signtime.com/api/v1/documents/${doc_id}/send`;
  await apiCallFunction(headers, sendEnpoint);

  return { outputs: {} }
});