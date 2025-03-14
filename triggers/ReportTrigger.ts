import { Trigger } from "deno-slack-api/types.ts";
import ReportWorkflow from "../workflows/ReportWorkflow.ts";

const ReportTrigger: Trigger<typeof ReportWorkflow.definition> = {
  type: "shortcut",
  name: "レポート作成 (Generate Report)",
  description: "作業時間の週報とか月報を作成します (Make a weekly and monthly report about working time)",
  workflow: `#/workflows/${ReportWorkflow.definition.callback_id}`,
  inputs: {
    channel: {
      value: "{{data.channel_id}}",
    },
    user_id: {
      value: "{{data.user_id}}",
    },
    interactivity: {
      value: "{{data.interactivity}}",
    },
  },
};

export default ReportTrigger;