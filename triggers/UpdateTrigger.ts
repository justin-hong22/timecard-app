import { Trigger } from "deno-slack-api/types.ts";
import UpdateEntryWorkflow from "../workflows/UpdateWorkflow.ts";

const UpdateTrigger: Trigger<typeof UpdateEntryWorkflow.definition> = {
  type: "shortcut",
  name: "Update a Time Entry",
  description: "Update a time entry",
  workflow: `#/workflows/${UpdateEntryWorkflow.definition.callback_id}`,
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

export default UpdateTrigger;

//Command to test this trigger on local. Be sure to run "slack run" too in a seperate window
//slack trigger create --trigger-def "triggers/XXX.ts"

//Remember to delete it after testing it
//slack trigger delete --trigger-id <trigger ID>

//To find the trigger ID, use this
//slack triggers list