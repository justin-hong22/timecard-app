import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { UpdateTimeFunction } from "../functions/UpdateTimeFunction.ts";
import { CollectTimeFunction } from "../functions/CollectTimeEntries.ts";
import { CreateReportFunction } from "../functions/CreateReportFunction.ts";

const UpdateEntryWorkflow = DefineWorkflow({
  callback_id: "update_entry",
  title: "Update an Entry",
  description: "Allows user to update an entry",
  input_parameters: {
    properties: {
      interactivity: { type: Schema.slack.types.interactivity },
      channel: { type: Schema.slack.types.channel_id },
      user_id: { type: Schema.slack.types.user_id },
    },
    required: ['user_id'],
  }
});

const inputForm = UpdateEntryWorkflow.addStep(
  Schema.slack.functions.OpenForm,
  {
    title: "Update a Time Entry",
    interactivity: UpdateEntryWorkflow.inputs.interactivity,
    submit_label: "Update",
    fields: {
    elements: [
      {
        name: "name",
        title: "Select the Name of who you want to update",
        type: Schema.slack.types.user_id,
        default: UpdateEntryWorkflow.inputs.user_id,
      },
      {
        name: "date",
        title: "Date of entry to be updated",
        type: Schema.slack.types.date,
      },
      {
        name: "time_in",
        title: "New Time In",
        type: Schema.slack.types.timestamp,
      },
      {
        name: "time_out",
        title: "New Time Out",
        type: Schema.slack.types.timestamp,
        description: "If left blank, default is 9 hours from Time In",
      },
      {
        name: "lunch_break",
        title: "Did you take a lunch break?",
        type: Schema.types.boolean,
        default: true,
      },
      {
        name: "delete_comment",
        title: "Would you like to clear any existing comments on this entry?",
        type: Schema.types.boolean,
        default: false,
      },
      {
        name: "comments",
        title: "Comments",
        type: Schema.types.string,
        long: true
      }
      ],
      required: ['name', 'date', 'time_in', 'lunch_break']
    },
  }
);

const update_msg = UpdateEntryWorkflow.addStep(UpdateTimeFunction, {
  name: inputForm.outputs.fields.name,
  date: inputForm.outputs.fields.date,
  time_in: inputForm.outputs.fields.time_in,
  time_out: inputForm.outputs.fields.time_out,
  lunch_break: inputForm.outputs.fields.lunch_break,
  delete_comment: inputForm.outputs.fields.delete_comment,
  comments: inputForm.outputs.fields.comments,
});

const time_entries = UpdateEntryWorkflow.addStep(CollectTimeFunction, {});

const report = UpdateEntryWorkflow.addStep(CreateReportFunction, {
  user: UpdateEntryWorkflow.inputs.user_id,
  report_type: "Monthly",
  time_entries: time_entries.outputs.time_entries,
});

UpdateEntryWorkflow.addStep(Schema.slack.functions.SendMessage, {
  channel_id: UpdateEntryWorkflow.inputs.channel,
  message:
    `${update_msg.outputs.confirmation_message}\n` +
    `Below are saved time entries after the update this month for <@${UpdateEntryWorkflow.inputs.user_id}>\n` +
    `${report.outputs.table_string}\n\n` +
    `Holidays Passed: ${report.outputs.holidays}\n\n` + 
    `Comments:\n${report.outputs.comments}`,
});

export default UpdateEntryWorkflow;