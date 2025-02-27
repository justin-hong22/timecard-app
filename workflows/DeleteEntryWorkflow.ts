import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { DeleteTimeFunction } from "../functions/DeleteTimeFunction.ts";
import { CollectTimeFunction } from "../functions/CollectTimeEntries.ts";
import { CreateReportFunction } from "../functions/CreateReportFunction.ts";

const DeleteEntryWorkflow = DefineWorkflow({
  callback_id: "delete_entry",
  title: "Delete an Entry",
  description: "Allows user to delete an entry",
  input_parameters: {
    properties: {
      interactivity: { type: Schema.slack.types.interactivity },
      channel: { type: Schema.slack.types.channel_id },
      user_id: { type: Schema.slack.types.user_id },
    },
    required: ['user_id'],
  }
});

const inputForm = DeleteEntryWorkflow.addStep(
  Schema.slack.functions.OpenForm,
  {
    title: "Delete a Time Entry",
    interactivity: DeleteEntryWorkflow.inputs.interactivity,
    submit_label: "Delete",
    fields: {
      elements: [
      {
        name: "name",
        title: "Select the Name of who you want to delete",
        type: Schema.slack.types.user_id,
        default: DeleteEntryWorkflow.inputs.user_id,
      },
      {
        name: "date",
        title: "Date of entry to be deleted",
        type: Schema.slack.types.date,
      },
      ],
      required: ['name', 'date']
    },
  }
);

const delete_msg = DeleteEntryWorkflow.addStep(DeleteTimeFunction, {
  user_id: DeleteEntryWorkflow.inputs.user_id,
  date: inputForm.outputs.fields.date,
});

const time_entries = DeleteEntryWorkflow.addStep(CollectTimeFunction, {});

const report = DeleteEntryWorkflow.addStep(CreateReportFunction, {
  user: DeleteEntryWorkflow.inputs.user_id,
  report_type: "Monthly",
  time_entries: time_entries.outputs.time_entries,
});

DeleteEntryWorkflow.addStep(Schema.slack.functions.SendMessage, {
  channel_id: DeleteEntryWorkflow.inputs.channel,
  message:
    `${delete_msg.outputs.confirmation_message}\n` +
    `Below are saved time entries this month after the deletion for <@${DeleteEntryWorkflow.inputs.user_id}>\n` +
    `${report.outputs.table_string}\n\n` +
    `Holidays Passed: ${report.outputs.holidays}\n\n` + 
    `Comments:\n${report.outputs.comments}`,
});

export default DeleteEntryWorkflow;