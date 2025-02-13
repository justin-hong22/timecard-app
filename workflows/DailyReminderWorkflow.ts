import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";

const DailyReminderWorkflow = DefineWorkflow({
  callback_id: "daily_reminder_workflow",
  title: "Daily Reminder to Log Time",
  description: "Every weekday at 9AM, reminds everyone to log their time",
  input_parameters: {
    properties: {
      channel: { type: Schema.slack.types.channel_id },
    },
    required: [],
  }
});

DailyReminderWorkflow.addStep(Schema.slack.functions.SendMessage, {
  channel_id: DailyReminderWorkflow.inputs.channel,
  message: `<!channel> Good Morning! Please remember to input your clock in time today!\n\n
  <https://slack.com/shortcuts/Ft080TARGKCJ/a215ccc85f708db740f2e15e07ae816e>` //CHANGE ME
});

export default DailyReminderWorkflow;