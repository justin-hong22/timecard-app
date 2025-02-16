import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";

const MessageWorkflow = DefineWorkflow({
  callback_id: "message_workflow",
  title: "First Message Workflow",
  description: "Get the first message of the user and save the time",
  input_parameters: {
    properties: {
      user_id: { type: Schema.types.string },
      message_ts: { type: Schema.types.string },
      channel: { type: Schema.slack.types.channel_id },
    },
    required: ["user_id", "channel", "message_ts"]
  }
});

MessageWorkflow.addStep(Schema.slack.functions.SendMessage, {
  channel_id: MessageWorkflow.inputs.channel,
  message: `
  User ID = <@${MessageWorkflow.inputs.user_id}>\n 
  Time of Message = ${MessageWorkflow.inputs.message_ts}\n
  Channel ID = ${MessageWorkflow.inputs.channel}`,
});

export default MessageWorkflow;