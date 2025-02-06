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
    },
    required: [],
  }
});

const inputForm = SaveTimeWorkflow.addStep(
  Schema.slack.functions.OpenForm,
  {
    title: "Input Form",
    interactivity: SaveTimeWorkflow.inputs.interactivity,
    submit_label: "Submit Info",
    fields: {
      elements: [{
        name: "time_in",
        title: "Time In",
        type: Schema.slack.types.timestamp,
      },
      {
        name: "time_out",
        title: "Time Out",
        type: Schema.slack.types.timestamp,
      },
      {
        name: "name",
        title: "Name",
        type: Schema.slack.types.user_id,
        default: SaveTimeWorkflow.inputs.user_id,
      }],
      required: ['time_in', 'time_out', 'name']
    },
  }
);

SaveTimeWorkflow.addStep(SaveTimeFunction, {
  time_in: inputForm.outputs.fields.time_in,
  time_out: inputForm.outputs.fields.time_out,
  name: inputForm.outputs.fields.name,
});

SaveTimeWorkflow.addStep(Schema.slack.functions.SendMessage, {
  channel_id: SaveTimeWorkflow.inputs.channel,
  message: `Time entry has been successfully saved`
});

export default SaveTimeWorkflow;