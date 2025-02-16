import { Trigger } from "deno-slack-api/types.ts";
import { TriggerContextData, TriggerEventTypes, TriggerTypes } from "deno-slack-api/mod.ts";
import MessageWorkflow from "../workflows/MessageWorkflow.ts";

const MessageTrigger: Trigger<typeof MessageWorkflow.definition> = {
  type: TriggerTypes.Event,
  event: {
    event_type: TriggerEventTypes.MessagePosted,
    channel_ids: ["C05UM1J6X8V"],
    filter: {
      root: {
        operator: "AND",
        inputs: [{
          operator: "NOT",
          inputs: [{
            statement: "{{data.user_id}} == null",
          }],
        }, {
          statement: "{{data.thread_ts}} == null",
        }],
      },
      version: 1,
    },
  },

  name: "First Message Trigger",
  workflow: `#/workflows/${MessageWorkflow.definition.callback_id}`,
  inputs: {
    user_id: { value: TriggerContextData.Event.MessagePosted.user_id },
    message_ts: { value: TriggerContextData.Event.MessagePosted.message_ts },
    channel: { value: TriggerContextData.Event.MessagePosted.channel_id },
  },
};

export default MessageTrigger;