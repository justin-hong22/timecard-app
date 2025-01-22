import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { CollectTimeFunction } from "../functions/CollectTimeEntries.ts";
import { CreateReportFunction } from "../functions/CreateReportFunction.ts";
import { SignTimeFunction } from "../functions/SignTimeFunction.ts";

const ReportWorkflow = DefineWorkflow({
  callback_id: "report_workflow",
  title: "Generate Time Report",
  input_parameters: {
    properties: {
      channel: { type: Schema.slack.types.channel_id },
      user_id: { type: Schema.slack.types.user_id },
      interactivity: { type: Schema.slack.types.interactivity },
    },

    required: ['channel', 'user_id', 'interactivity'],
  }
});

const report_type = ReportWorkflow.addStep(
  Schema.slack.functions.OpenForm,
  {
    title: "Generate Report",
    interactivity: ReportWorkflow.inputs.interactivity,
    submit_label: "Generate Report",
    fields: {
      elements: [
        {
          name: "report_type",
          title: 'What type of report would you like to make?',
          description: "Either weekly or monthly report to be generated",
          type: Schema.types.string,
          enum: [
            "Weekly",
            "Monthly",
            "General",
          ],
        },
        {
          name: "user",
          title: "Name",
          type: Schema.slack.types.user_id,
          default: ReportWorkflow.inputs.user_id,
        }],
        required: ['report_type', 'user']
    },
  }
);

const time_entries = ReportWorkflow.addStep(CollectTimeFunction, {});

const report = ReportWorkflow.addStep(CreateReportFunction, {
  time_entries: time_entries.outputs.time_entries,
  report_type: report_type.outputs.fields.report_type,
  user: report_type.outputs.fields.user,
});

ReportWorkflow.addStep(SignTimeFunction, {
  time_entries: report.outputs.table_string,
  holidays: report.outputs.holidays,
  user: report_type.outputs.fields.user,
})

ReportWorkflow.addStep(Schema.slack.functions.SendMessage, {
  channel_id: ReportWorkflow.inputs.channel,
  message: 
    `Inputted time entries so far for <@${report_type.outputs.fields.user}>\n` +
    `${report.outputs.table_string}\n\n` +
    `${report.outputs.holidays}`,
});

export default ReportWorkflow;