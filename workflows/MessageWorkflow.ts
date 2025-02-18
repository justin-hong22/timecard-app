import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { FindFirstMessage } from "../functions/FindFirstMessageFunction.ts";
import { SaveTimeFunction } from "../functions/SaveTimeFunction.ts";

const MessageWorkflow = DefineWorkflow({
  callback_id: "message_workflow",
  title: "First Message Workflow",
  description: "Get the first message of the user and save the time",
  input_parameters: {
    properties: {
      user_id: { type: Schema.slack.types.user_id },
      message_ts: { type: Schema.types.string },
      channel: { type: Schema.slack.types.channel_id },
    },
    required: ["user_id", "channel", "message_ts"]
  }
});

const is_first_msg = MessageWorkflow.addStep(FindFirstMessage, {
  user_id: MessageWorkflow.inputs.user_id,
  message_time: MessageWorkflow.inputs.message_ts,
});

const confirmation_msg = MessageWorkflow.addStep(SaveTimeFunction, {
  name: MessageWorkflow.inputs.user_id,
  time_in: MessageWorkflow.inputs.message_ts,
  lunch_break: true,
  from_msg: true,
  is_first_msg: is_first_msg.outputs.is_first,
});

MessageWorkflow.addStep(Schema.slack.functions.SendMessage, {
  channel_id: MessageWorkflow.inputs.channel,
  message: confirmation_msg.outputs.confirmation_message,
});

export default MessageWorkflow;