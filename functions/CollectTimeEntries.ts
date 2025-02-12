import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import TimecardDatastore, { TIMECARD_DATASTORE } from "../datastores/TimecardDatastore.ts";
import { TimeCardType } from "../types/TimeCardType.ts";

export const CollectTimeFunction = DefineFunction({
  callback_id: "collect_time",
  title: "Collect Time",
  description: "Gather the time related to a specific person",
  source_file: "functions/CollectTimeEntries.ts",
  input_parameters: {
    properties: {},
    required: [],
  },
  output_parameters: {
    properties: {
      time_entries: {
        type: Schema.types.array,
        items: { type: TimeCardType },
        description: "Each individual time entry of a user",
      }
    },
    required: ['time_entries'],
  },
});

export default SlackFunction(CollectTimeFunction, async ({ client }) => {
  const time_info = await client.apps.datastore.query<typeof TimecardDatastore.definition>({ datastore: TIMECARD_DATASTORE });
  if (!time_info.ok) {
    return { error: `Failed to retrieve time information - ${time_info.error}` };
  }
  
  const time_entries = new Map<typeof String, {
    id: string;
    person_name: string;
    time_in: string;
    time_out: string;
    duration: number;
    lunch_break: boolean;
    holiday_name: string;
    comments: string;
  }>();

  time_info.items.forEach((entry) => 
  {
    time_entries.set(entry.id, {
      id: String(entry.id),
      person_name: String(entry.person_name),
      time_in: String(entry.time_in),
      time_out: String(entry.time_out),
      duration: Number(entry.duration),
      lunch_break: Boolean(entry.lunch_break),
      holiday_name: String(entry.holiday_name),
      comments: String(entry.comments),
    });
  });

  return{
    outputs: { time_entries: [...time_entries.entries()].map((r) => r[1]) } 
  };
});