import { DefineFunction, SlackFunction, Schema } from "deno-slack-sdk/mod.ts";

export const NewComponentFunction = DefineFunction({
  callback_id: "new_component",
  title: "New Component",
  description: "Create components onto template in SignTime API",
  source_file: "functions/NewComponentFunction.ts",
  input_parameters: {
    properties: {
      party_id: {
        type: Schema.types.string,
        description: "party id of new document"
      },
    },
    required: [],
  },
  output_parameters: {
    properties: {},
    required: [],
  }
});

async function createComponent(headers: {Accept: string; Authorization : string}, body: FormData)
{
  const endpoint =  `https://api.signtime.com/api/v1/components/new`;
  
  try
  {
    await fetch(endpoint, {
      method: "POST",
      headers,
      body,
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

  return "";
}

export default SlackFunction(NewComponentFunction, async({inputs, env}) => 
{
  const headers = {
    Accept: "application/json",
    Authorization: "Bearer " + env.SIGNTIME_APIKEY,
  };

  const timeEntryBody = new FormData();
  timeEntryBody.append("party_id", String(inputs.party_id));
  timeEntryBody.append("type", "TextComponent");
  timeEntryBody.append("page", "1");
  timeEntryBody.append("x", "0.13");
  timeEntryBody.append("y", "0.19");
  timeEntryBody.append("width", ".74");
  timeEntryBody.append("height", ".4");
  timeEntryBody.append("settings[text_type]", "multi");
  await createComponent(headers, timeEntryBody);

  const holidayBody = new FormData();
  holidayBody.append("party_id", String(inputs.party_id));
  holidayBody.append("type", "TextComponent");
  holidayBody.append("page", "1");
  holidayBody.append("x", "0.13");
  holidayBody.append("y", "0.655");
  holidayBody.append("width", ".74");
  holidayBody.append("height", ".1");
  holidayBody.append("settings[text_type]", "multi");
  await createComponent(headers, holidayBody);

  const signatureBody = new FormData();
  signatureBody.append("party_id", String(inputs.party_id));
  signatureBody.append("type", "SignatureComponent");
  signatureBody.append("page", "1");
  signatureBody.append("x", "0.13");
  signatureBody.append("y", ".83");
  holidayBody.append("height", ".06");
  await createComponent(headers, signatureBody);

  const nameBody = new FormData();
  nameBody.append("party_id", String(inputs.party_id));
  nameBody.append("type", "TextComponent");
  nameBody.append("page", "1");
  nameBody.append("x", "0.4");
  nameBody.append("y", "0.15");
  await createComponent(headers, nameBody);

  return { outputs: {} }
});