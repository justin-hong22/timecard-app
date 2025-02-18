import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { TIMECARD_DATASTORE } from "../datastores/TimecardDatastore.ts";
import { FindHoliday } from "./FindHolidayFunction.ts";

export const StoreTimeFromMsg = DefineFunction({
  callback_id: "store_time_from_msg",
  title: "Store Time From Message",
  source_file: "functions/StoreTimeFromMsg.ts",
  input_parameters: {
    properties: {
      is_first_msg: { 
        type: Schema.types.boolean,
        description: "Boolean for seeing if it's the first message of the day",
      },
      user_id: {
        type: Schema.slack.types.user_id,
        description: "The user id of the person who typed in a message",
      },
      timestamp: {
        type: Schema.types.string,
        description: "The time of when the message was sent",
      }
    },
    required: ['is_first_msg', 'user_id', 'timestamp']
  },
  output_parameters: {
    properties: {
      confirmation_message: {
        type: Schema.types.string,
        description: "Description of the confirmation message"
      }
    },
    required: [],
  },
});

export default SlackFunction(StoreTimeFromMsg, async({inputs, client}) => { 
  const{ is_first_msg, user_id, timestamp } = inputs;

  //if it's not the first msg of the day, do nothing
  if(!is_first_msg) {
    return { outputs: { confirmation_message: `This is not the first message of the day, so time entry was not saved` } };
  }

  const date_in = new Date(Number(timestamp) * 1000);
  const date_out = new Date(Number(timestamp) * 1000 + (9 * 60 * 60 * 1000));
  const lunch_break = true;
  const duration = 8;
  const holiday_name = FindHoliday(date_in);

  const uuid = crypto.randomUUID();
  const putResponse = await client.apps.datastore.put({
    datastore: TIMECARD_DATASTORE,
    item: {
      id: uuid,
      person_name: user_id,
      time_in: date_in,
      time_out: date_out,
      duration: duration,
      lunch_break: lunch_break,
      holiday_name: holiday_name,
    }
  });

  console.log(putResponse);
  if (!putResponse.ok) {
    return { error: `Failed to store time: ${putResponse.error}` };
  }

  return { outputs: { confirmation_message: `Time entry has been saved from first message of the day!`} };
});