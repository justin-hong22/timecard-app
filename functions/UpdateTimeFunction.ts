// deno-lint-ignore-file
import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { getPrimaryKey } from "./DeleteTimeFunction.ts";
import { FindHoliday } from "./SaveTimeFunction.ts";

export const UpdateTimeFunction = DefineFunction({
  callback_id: "update_function",
  title: "Update Time",
  description: "Updating a time entry after it's saved",
  source_file: "functions/UpdateTimeFunction.ts",
  input_parameters: {
    properties: {
      name: {
        type: Schema.types.string,
        description: "The person who entered time",
      },
      date: {
        type: Schema.types.string,
        description: "The date of the time entry to be deleted",
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
      delete_comment: {
        type: Schema.types.boolean,
        description: "Boolean to determine if comments should be cleared out",
      },
      comments: {
        type: Schema.types.string,
        description: "Any comments the person has",
      },
    },
    required: ['name', 'date', 'time_in', 'lunch_break'],
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

export default SlackFunction(UpdateTimeFunction, async({inputs, client}) => {
  const {name, date, time_in, time_out, lunch_break, delete_comment} = inputs;
  const uuid = await getPrimaryKey(name, date, client, "timecard_datastore");
  const end_time = (time_out == null) ? (Number(time_in) * 1000) + (9 * 60 * 60 * 1000) : Number(time_out) * 1000;
  const tokyoOffset = 9 * 60 * 60 * 1000;

  //Data that will be updated in datastore
  const date_in = new Date(Number(time_in) * 1000 + tokyoOffset);
  const date_out = new Date(end_time + tokyoOffset);
  const duration = lunch_break ? (date_out.getTime() - date_in.getTime() - 3600000) / 3600000 : (date_out.getTime() - date_in.getTime()) / 3600000;
  let holiday_name = FindHoliday(date_in);
  if(holiday_name == undefined) { holiday_name = ""; }

  let comments = inputs.comments;
  if(delete_comment) { comments = "" }
  
  
  let items: { id: any[]; person_name: string; time_in: Date; time_out: Date; duration: number; lunch_break: boolean; holiday_name?: string;comments?: string; } 
  = {
    id: uuid[0],
    person_name: name,
    time_in: date_in,
    time_out: date_out,
    duration: duration,
    lunch_break: lunch_break,
    holiday_name: holiday_name,
  };
  
  if(comments !== undefined) {
    items = { ...items, comments };
  }

  let msg = "";
  if(uuid.length > 0) {
    const updateQuery = await client.apps.datastore.update({ 
      datastore: "timecard_datastore",
      item: items,
  });

    if(updateQuery.ok) {
      msg = `Successfully updated the time entry on ${date}`;
    }
    else {
      console.error(`Query failed: ${updateQuery.error}`);
    }
  }
  else {
    msg = `There was no time entry inputted on ${date}`;
  }
  
  return {outputs: { confirmation_message: msg} }
});