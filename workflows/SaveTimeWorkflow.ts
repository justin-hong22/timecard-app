import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { SaveTimeFunction } from "../functions/SaveTimeFunction.ts";

const SaveTimeWorkflow = DefineWorkflow({
  callback_id: "timecard_workflow",
  title: "Log Time",
  description: "Save a time for clocking in and clocking out",
  input_parameters: {
    properties: {
      interactivity: { type: Schema.slack.types.interactivity },
      channel: { type: Schema.slack.types.channel_id },
      user_id: { type: Schema.slack.types.user_id },
      invoke_time: { type: Schema.slack.types.timestamp },
    },
    required: [],
  }
});

const inputForm = SaveTimeWorkflow.addStep(
  Schema.slack.functions.OpenForm,
  {
    title: "時間エントリーを保存する (Save time)",
    interactivity: SaveTimeWorkflow.inputs.interactivity,
    submit_label: "保存 (Submit)",
    fields: {
      elements: [
      {
        name: "name",
        title: "名前 (Name)",
        type: Schema.slack.types.user_id,
        default: SaveTimeWorkflow.inputs.user_id,
      },
      {
        name: "time_in",
        title: "出勤 (Time In)",
        type: Schema.slack.types.timestamp,
        default: SaveTimeWorkflow.inputs.invoke_time,
      },
      {
        name: "time_out",
        title: "退勤 (Time Out)",
        description: "空白の場合、出勤時間から９時間を保存します (If left blank, default is 9 hours from Time In)",
        type: Schema.slack.types.timestamp,
      },
      {
        name: "lunch_break",
        title: "昼ごはん休みを取りましたか？ (Did you take a lunch break?)",
        type: Schema.types.boolean,
        default: true,
      },
      {
        name: "comments",
        title: "コメント (Comments)",
        type: Schema.types.string,
        long: true
      }
      ],
      required: ['name', 'time_in', 'lunch_break']
    },
  }
);

const msg = SaveTimeWorkflow.addStep(SaveTimeFunction, {
  time_in: inputForm.outputs.fields.time_in,
  time_out: inputForm.outputs.fields.time_out,
  lunch_break: inputForm.outputs.fields.lunch_break,
  name: inputForm.outputs.fields.name,
  comments: inputForm.outputs.fields.comments,
  from_msg: false,
  is_first_msg: false,
});

SaveTimeWorkflow.addStep(Schema.slack.functions.SendMessage, {
  channel_id: SaveTimeWorkflow.inputs.channel,
  message: `<@${SaveTimeWorkflow.inputs.user_id}>${msg.outputs.confirmation_message}<@${SaveTimeWorkflow.inputs.user_id}>)`
});

export default SaveTimeWorkflow;