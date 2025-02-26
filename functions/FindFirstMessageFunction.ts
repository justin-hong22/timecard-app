import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { MESSAGE_DATASTORE } from "../datastores/MessageDatastore.ts";

export const FindFirstMessage = DefineFunction({
  callback_id: "find_first_message",
  title: "Find First Message",
  description: "Finding the first message of the day",
  source_file: "functions/FindFirstMessageFunction.ts",
  input_parameters: {
    properties: {
      user_id: {
        type: Schema.slack.types.user_id,
        description: "The user id of the person who typed in a message",
      },
      message_time: {
        type: Schema.types.string,
        description: "The time of when the message was sent",
      }
    },
    required: ['user_id', 'message_time']
  },
  output_parameters: {
    properties: { is_first: { type: Schema.types.boolean } },
    required: ['is_first'],
  }
});

export default SlackFunction(FindFirstMessage, async({inputs, client}) => {
  let is_first = false;
  const user_id = inputs.user_id;
  const timestamp = Number(inputs.message_time);

  const message_ts = new Date(timestamp * 1000  + (9 * 60 * 60 * 1000));
  const message_date = `${message_ts.getFullYear()}-${String(message_ts.getMonth() + 1).padStart(2, '0')}-${String(message_ts.getDate()).padStart(2, '0')}`;
  const queryResponse = await client.apps.datastore.query({
    datastore: "message_datastore",
    expression: '#time_in = :time_in AND #person_name = :person_name',
    expression_attributes: {
      '#time_in': 'time_in',
      '#person_name': 'person_name',
    },
    expression_values: {
      ':time_in': message_date,
      ':person_name': user_id,
    },
  });

  //If this returns nothing, then you know it's the first message of the day
  if(queryResponse.items.length == 0)
  {
    const uuid = crypto.randomUUID();
    const putResponse = await client.apps.datastore.put({
      datastore: MESSAGE_DATASTORE,
      item: {
        id: uuid,
        person_name: user_id,
        time_in: message_date,
      }
    });

    if (!putResponse.ok) {
      return { error: `Failed to store time: ${putResponse.error}` };
    }

    is_first = true;
  }

  return { outputs: {is_first: is_first} };
});