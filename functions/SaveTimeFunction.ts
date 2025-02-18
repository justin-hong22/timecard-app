import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { TIMECARD_DATASTORE } from "../datastores/TimecardDatastore.ts";
import { FindHoliday } from "./FindHolidayFunction.ts";

export const SaveTimeFunction = DefineFunction({
  callback_id: "save_time",
  title: "Save Time",
  description: "Saving clocked in and out time to datastore",
  source_file: "functions/SaveTimeFunction.ts",
  input_parameters: {
    properties: {
      name: {
        type: Schema.types.string,
        description: "The person who entered time",
      },
      time_in: {
        type: Schema.types.string,
        description: "Clocked in time",
      },
      time_out: {
        type: Schema.types.string,
        description: "Clocked out time",
      },
      lunch_break: {
        type: Schema.types.boolean,
        description: "Boolean to determine if a lunch break was taken. Defaults to 60 minutes",
      },
      comments: {
        type: Schema.types.string,
        description: "Any comments the person has",
      },
    },
    required: ['name', 'time_in', 'lunch_break'],
  },
  output_parameters: {
    properties: {},
    required: [],
  },
});

export default SlackFunction(SaveTimeFunction, async({inputs, client}) => {
  const {name, time_in, time_out, lunch_break, comments} = inputs;  
  const end_time = (time_out == null) ? (Number(time_in) * 1000) + (9 * 60 * 60 * 1000) : Number(time_out) * 1000;

  const date_in = new Date(Number(time_in) * 1000);
  const date_out = new Date(end_time);
  const duration = lunch_break ? (date_out.getTime() - date_in.getTime() - 3600000) / 3600000 : (date_out.getTime() - date_in.getTime()) / 3600000;
  const holiday_name = FindHoliday(date_in);

  const uuid = crypto.randomUUID();
  const putResponse = await client.apps.datastore.put({
    datastore: TIMECARD_DATASTORE,
    item: {
      id: uuid,
      person_name: name,
      time_in: date_in,
      time_out: date_out,
      duration: duration,
      lunch_break: lunch_break,
      holiday_name: holiday_name,
      comments: comments,
    }
  });

  console.log(putResponse);
  if (!putResponse.ok) {
    return { error: `Failed to store time: ${putResponse.error}` };
  }

  return { outputs: {} };
});
