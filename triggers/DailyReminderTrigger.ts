import { TriggerTypes } from "deno-slack-api/mod.ts";
import { ScheduledTrigger } from "deno-slack-api/typed-method-types/workflows/triggers/scheduled.ts";
import DailyReminderWorkflow from "../workflows/DailyReminderWorkflow.ts";

const DailyReminderTrigger: ScheduledTrigger<typeof DailyReminderWorkflow.definition> = {
  name: "Timecard Daily Reminder Trigger",
  type: TriggerTypes.Scheduled,
  workflow: `#/workflows/${DailyReminderWorkflow.definition.callback_id}`,
  inputs: {
    channel: {
      value: "C05UM1J6X8V", //CHANGE ME
    },
  },
  schedule: {
    start_time: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1, 9, 0, 0, 0).toISOString(),
    timezone: "Asia/Tokyo",
    frequency: { 
      type: "weekly", 
      repeats_every: 1, 
      on_days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    },
  },
};

export default DailyReminderTrigger;