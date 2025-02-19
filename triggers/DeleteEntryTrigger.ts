import { Trigger } from "deno-slack-api/types.ts";
import DeleteEntryWorkflow from "../workflows/DeleteEntryWorkflow.ts";

const DeleteEntryTrigger: Trigger<typeof DeleteEntryWorkflow.definition> = {
  type: "shortcut",
  name: "Delete a Time Entry",
  description: "Delete a time entry",
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