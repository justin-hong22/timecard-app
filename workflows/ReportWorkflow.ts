import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { ApproveFunction } from "../functions/ApproveFunction.ts";
import { GetOAuthFunction } from "../functions/GetOAuthFunction.ts";
import { TemplateSenderFunction } from "../functions/TemplateSenderFunction.ts";

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
    submit_label: "作成 (Generate Report)",
    fields: {
      elements: [
        {
          name: "user",
          title: "名前 (Name)",
          type: Schema.slack.types.user_id,
          default: ReportWorkflow.inputs.user_id,
        },
        {
          name: "report_type",
          title: 'どんなレポートを作成しましょうか？ (What type of report would you like to make?)',
          description: "週報とか月報を作成できます (Either weekly or monthly report to be generated)",
          type: Schema.types.string,
          enum: [
            "週報 (Weekly)",
            "月報 (Monthly)",
            "一般 (General)",
          ],
        }],
        required: ['user', 'report_type']
    },
  }
);

const report = ReportWorkflow.addStep(ApproveFunction, {
  interactivity: report_type.outputs.interactivity,
  user_id: report_type.outputs.fields.user,
  report_type: report_type.outputs.fields.report_type,
});

//SignTime API Begins here
const api_key = ReportWorkflow.addStep(GetOAuthFunction, {
  decision: report.outputs.decision,
});

const msg = ReportWorkflow.addStep(TemplateSenderFunction, {
  api_key: api_key.outputs.api_key,
  user: report_type.outputs.fields.user,
  report_type: report_type.outputs.fields.report_type,
  decision: report.outputs.decision,
  time_data: report.outputs.signtime_string,
  holidays: report.outputs.holidays,
  comments: report.outputs.comments,
});

ReportWorkflow.addStep(Schema.slack.functions.SendMessage, {
  channel_id: ReportWorkflow.inputs.channel,
  message: `${msg.outputs.message}`
});

export default ReportWorkflow;