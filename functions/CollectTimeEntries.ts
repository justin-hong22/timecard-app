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
    time_in: string;
    time_out: string;
    duration: number;
    is_holiday: boolean;
    holiday_name: string;
    person_name: string;
  }>();

  time_info.items.forEach((entry) => 
  {
    time_entries.set(entry.id, {
      id: String(entry.id),
      time_in: String(entry.time_in),
      time_out: String(entry.time_out),
      duration: Number(entry.duration),
      is_holiday: Boolean(entry.is_holiday),
      holiday_name: String(entry.holiday_name),
      person_name: String(entry.person_name),
    });
  });

  return{
    outputs: { time_entries: [...time_entries.entries()].map((r) => r[1]) } 
  };
});