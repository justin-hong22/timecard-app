import { Manifest } from "deno-slack-sdk/mod.ts";
import SaveTimeWorkflow from "./workflows/SaveTimeWorkflow.ts";
import ReportWorkflow from "./workflows/ReportWorkflow.ts";
import DailyReminderWorkflow from "./workflows/DailyReminderWorkflow.ts";
import MessageWorkflow from "./workflows/MessageWorkflow.ts";
import DeleteEntryWorkflow from "./workflows/DeleteEntryWorkflow.ts";
import UpdateEntryWorkflow from "./workflows/UpdateWorkflow.ts";
import { SaveTimeFunction } from "./functions/SaveTimeFunction.ts";
import { ApproveFunction } from "./functions/ApproveFunction.ts";
import { GetOAuthFunction } from "./functions/GetOAuthFunction.ts";
import { TemplateSenderFunction } from "./functions/TemplateSenderFunction.ts";
import { FindFirstMessage } from "./functions/FindFirstMessageFunction.ts";
import { DeleteTimeFunction } from "./functions/DeleteTimeFunction.ts";
import { UpdateTimeFunction } from "./functions/UpdateTimeFunction.ts";
import { PresentReportOnChannel } from "./functions/PresentReportOnChannel.ts";
import TimecardDatastore from "./datastores/TimecardDatastore.ts";
import MessageDatastore from "./datastores/MessageDatastore.ts";
import { TimeCardType } from "./types/TimeCardType.ts";

/**
 * The app manifest contains the app's configuration. This
 * file defines attributes like app name and description.
 * https://api.slack.com/automation/manifest
 */
export default Manifest({
  name: "timecard-app",
  description: "A blank template for building Slack apps with Deno",
  icon: "assets/default_new_app_icon.png",
  datastores: [TimecardDatastore, MessageDatastore],
  functions: [SaveTimeFunction, GetOAuthFunction, TemplateSenderFunction, FindFirstMessage, DeleteTimeFunction, UpdateTimeFunction, 
    ApproveFunction, PresentReportOnChannel],
  workflows: [SaveTimeWorkflow, ReportWorkflow, DailyReminderWorkflow, MessageWorkflow, DeleteEntryWorkflow, UpdateEntryWorkflow],
  types: [TimeCardType],
  outgoingDomains: ['api.signtime.com'],
  botScopes: [
    "commands", 
    "chat:write", 
    "chat:write.public",
    "datastore:read",
    "datastore:write",
    "files:write",
    "files:read",
    "users:read",
    "users:read.email",

    //Below are for the 1st message of the day functionality
    "channels:history",
    "groups:history",
    "im:read",
    "mpim:read",
  ],
});
