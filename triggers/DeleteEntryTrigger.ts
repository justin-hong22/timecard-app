import { Trigger } from "deno-slack-api/types.ts";
import DeleteEntryWorkflow from "../workflows/DeleteEntryWorkflow.ts";

const DeleteEntryTrigger: Trigger<typeof DeleteEntryWorkflow.definition> = {
  type: "shortcut",
  name: "時間エントリーを削除する (Delete a Time Entry)",
  description: "時間エントリーを削除する (Delete a Time Entry)",
  workflow: `#/workflows/${DeleteEntryWorkflow.definition.callback_id}`,
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
  },
};

export default DeleteEntryTrigger;