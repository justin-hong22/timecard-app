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
  message: `<!channel> おはようございます。出勤時間を入力してください！ (Good Morning! Please remember to input your clock in time today!)\n
  <https://slack.com/shortcuts/Ft08CXRLAPB8/20f88ae541e72c3513549e7dafdf27f1>`
});

export default DailyReminderWorkflow;