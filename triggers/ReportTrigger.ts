import { Trigger } from "deno-slack-api/types.ts";
import ReportWorkflow from "../workflows/ReportWorkflow.ts";

const ReportTrigger: Trigger<typeof ReportWorkflow.definition> = {
  type: "shortcut",
  name: "Generate Report",
  description: "Make a weekly and monthly report about clocking in and out",
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