import { DefineFunction, SlackFunction, Schema } from "deno-slack-sdk/mod.ts";
import approveOrDenyBlock from "./Block.ts";
import { CollectTimeEntries } from "./CollectTimeEntries.ts";
import { GenerateReport } from "./GenerateReport.ts";

export const ApproveFunction = DefineFunction({
  callback_id: "approve",
  title: "Approve Function",
  description: "Approve or Deny for signature",
  source_file: "functions/ApproveFunction.ts",
  input_parameters: {
    properties: {
      interactivity: {
        type: Schema.slack.types.interactivity,
      },
      user_id: {
        type: Schema.slack.types.user_id,
        description: "The user to collect time entries"
      },
      report_type: {
        type: Schema.types.string,
        description: "Either a weekly, monthly or general report"
      },
    },
    required: ['interactivity']
  },
  output_parameters: {
    properties: {
      decision: {
        type: Schema.types.boolean,
        description: "What the user decided"
      },
      signtime_string: {
        type: Schema.types.string,
        description: "Time entries to send via SignTime API"
      },
      holidays: {
        type: Schema.types.string,
        description: "List the holidays if any"
      },
      comments: {
        type: Schema.types.string,
        description: "List the comments if any"
      },
    },
    required: ['decision', 'signtime_string', 'holidays', 'comments']
  },
});

export default SlackFunction( ApproveFunction, async({inputs, client}) => {
  const time_entries = await CollectTimeEntries(client);
  const report = GenerateReport(String(inputs.user_id), String(inputs.report_type), time_entries);

  const blocks = approveOrDenyBlock(String(inputs.user_id), report).concat([{
    "type": "actions",
    "block_id": "approve-deny-buttons",
    "elements": [
      {
        type: "button",
        text: {
          type: "plain_text",
          text: "承認 (Approve)",
        },
        action_id: "approve_id",
      },
      {
        type: "button",
        text: {
          type: "plain_text",
          text: "拒否 (Deny)",
        },
        action_id: "deny_id",
        style: "danger",
      },
    ],
  }]);

  await client.chat.postMessage({
    channel: "C05UM1J6X8V", //CHANGE ME
    blocks,
  });

  return {
    completed: false,
  };

}).addBlockActionsHandler(
  ["approve_id", "deny_id"],
  async function ({ action, body, client, inputs }) 
  {
    const time_entries = await CollectTimeEntries(client);
    const report = GenerateReport(String(inputs.user_id), String(inputs.report_type), time_entries);
    const approved = action.action_id === "approve_id";
    
    await client.chat.update({
      channel: body.container.channel_id,
      ts: body.container.message_ts,
      blocks: approveOrDenyBlock(String(inputs.user_id), report).concat([{
        type: "context",
        elements: [{
          type: "mrkdwn",
          text: `${approved ? " :white_check_mark: 承認 (Approved)" : ":x: 拒否 (Denied)"}`,
        }],
      }]),
    });

    const decision = approved ? true : false;
    await client.functions.completeSuccess({
      function_execution_id: body.function_data.execution_id,
      outputs: {
        decision: decision, 
        signtime_string: report.signtime_string,
        holidays: report.holidays,
        comments: report.comments,
      },
    });
  }
);
