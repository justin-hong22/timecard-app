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

  const message_ts = new Date(timestamp * 1000);
  const message_date = `${message_ts.getMonth() + 1}-${message_ts.getDate()}-${message_ts.getFullYear()}`;
  const queryResponse = await client.apps.datastore.query({
    datastore: "message_datastore",
    expression: '#mt = :message_time AND #uid = :user_id',
    expression_attributes: {
      '#mt': 'message_time',
      '#uid': 'user_id',
    },
    expression_values: {
      ':message_time': message_date,
      ':user_id': user_id,
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
        user_id: user_id,
        message_time: message_date,
      }
    });

    if (!putResponse.ok) {
      return { error: `Failed to store time: ${putResponse.error}` };
    }

    is_first = true;
  }

  return { outputs: {is_first: is_first} };
});