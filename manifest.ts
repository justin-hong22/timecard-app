import { Manifest } from "deno-slack-sdk/mod.ts";
import SaveTimeWorkflow from "./workflows/SaveTimeWorkflow.ts";
import ReportWorkflow from "./workflows/ReportWorkflow.ts";
import DailyReminderWorkflow from "./workflows/DailyReminderWorkflow.ts";
import { SaveTimeFunction } from "./functions/SaveTimeFunction.ts";
import { CollectTimeFunction } from "./functions/CollectTimeEntries.ts";
import { CreateReportFunction } from "./functions/CreateReportFunction.ts";
import { GetOAuthFunction } from "./functions/GetOAuthFunction.ts";
import { TemplateSenderFunction } from "./functions/TemplateSenderFunction.ts";
import TimecardDatastore from "./datastores/TimecardDatastore.ts";
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
  datastores: [TimecardDatastore],
  functions: [SaveTimeFunction, CollectTimeFunction, CreateReportFunction, GetOAuthFunction, TemplateSenderFunction],
  workflows: [SaveTimeWorkflow, ReportWorkflow, DailyReminderWorkflow],
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
  ],
});
