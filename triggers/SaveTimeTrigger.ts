import { Trigger } from "deno-slack-api/types.ts";
import SaveTimeWorkflow from "../workflows/SaveTimeWorkflow.ts";

const SaveTimeTrigger: Trigger<typeof SaveTimeWorkflow.definition> = {
  type: "shortcut",
  name: "作業時間を入力する (Save Working Time)",
  description: "出勤時間や退勤時間を入力します　（Save clocking in and clocking out time）",
  workflow: `#/workflows/${SaveTimeWorkflow.definition.callback_id}`,
  inputs: {
    interactivity: {
      value: "{{data.interactivity}}",
    },
    channel: {
      value: "{{data.channel_id}}",
    },
    user_id: {
      value: "{{data.user_id}}",
    },
    invoke_time: {
      value: "{{event_timestamp}}",
    }
  },
};

export default SaveTimeTrigger;