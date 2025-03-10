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
    title: "エントリーを削除 (Delete Entry)",
    interactivity: DeleteEntryWorkflow.inputs.interactivity,
    submit_label: "削除 (Delete)",
    fields: {
      elements: [
      {
        name: "name",
        title: "名前 (Name)",
        type: Schema.slack.types.user_id,
        default: DeleteEntryWorkflow.inputs.user_id,
      },
      {
        name: "date",
        title: "削除される時間エントリーの月日 (Date of entry to be deleted)",
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
  report_type: "一般 (General)",
  time_entries: time_entries.outputs.time_entries,
});

DeleteEntryWorkflow.addStep(Schema.slack.functions.SendMessage, {
  channel_id: DeleteEntryWorkflow.inputs.channel,
  message:
    `${delete_msg.outputs.confirmation_message}\n` +
    `<@${DeleteEntryWorkflow.inputs.user_id}>の削除した後残り時間エントリー (Saved time entries after the deletion for <@${DeleteEntryWorkflow.inputs.user_id}>)\n` +
    `${report.outputs.table_string}\n\n` +
    `祝日経過 (Holidays Passed): ${report.outputs.holidays}\n\n` + 
    `コメント (Comments):\n${report.outputs.comments}`,
});

export default DeleteEntryWorkflow;