import { SlackAPIClient } from "deno-slack-api/types.ts";
import TimecardDatastore, { TIMECARD_DATASTORE } from "../datastores/TimecardDatastore.ts";

export async function CollectTimeEntries(client : SlackAPIClient)
{
  const time_info = await client.apps.datastore.query<typeof TimecardDatastore.definition>({ datastore: TIMECARD_DATASTORE });
  if (!time_info.ok) {
    throw console.error(`Failed to retrieve time information - ${time_info.error}`);
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


  return [...time_entries.entries()].map((r) => r[1]);
}