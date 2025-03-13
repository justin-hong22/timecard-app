import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { CollectTimeEntries } from "./CollectTimeEntries.ts";
import { GenerateReport } from "./GenerateReport.ts";

export const PresentReportOnChannel = DefineFunction({
  callback_id: "present_report",
  title: "Present Report",
  source_file: "functions/PresentReportOnChannel.ts",
  input_parameters: {
    properties: {
      user_id: {
        type: Schema.slack.types.user_id,
        description: "The user to collect time entries"
      },
      report_type: {
        type: Schema.types.string,
        description: "Either a weekly, monthly or general report"
      },
    },
    required: ['user_id', 'report_type'],
  },
  output_parameters: {
      properties: {
        table: {
          type: Schema.types.string,
          description: "Time entries to send via SignTime API"
        },
        holidays: {
          type: Schema.types.string,
          description: "List the holidays if any"
        },
        comments: {
          type: Schema.types.string,
          description: "List the comments if any"
        },
      },
      required: ['table', 'holidays', 'comments'],
    },
});

export default SlackFunction(PresentReportOnChannel, async ({inputs, client}) => {
  const {user_id, report_type} = inputs;
  
  const time_entries = await CollectTimeEntries(client);
  const report = GenerateReport(user_id, report_type, time_entries);

  return { outputs: {
    table: report.table,
    holidays: report.holidays,
    comments: report.comments,
  } }
});