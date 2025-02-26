import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { TimeCardType } from "../types/TimeCardType.ts";

export const CreateReportFunction = DefineFunction({
  callback_id: "create_report",
  title: "Create Report",
  description: "Create a weekly and monthly report on the time entries",
  source_file: "functions/CreateReportFunction.ts",
  input_parameters: {
    properties: {
      user: {
        type: Schema.slack.types.user_id,
        description: "The user to collect time entries"
      },
      report_type: {
        type: Schema.types.string,
        description: "Either a weekly, monthly or general report"
      },
      time_entries: {
        type: Schema.types.array,
        items: { type: TimeCardType },
        description: "Each individual time entry of a user",
      },
    },
    required: ['user', 'report_type', 'time_entries'],
  },
  output_parameters: {
    properties: {
      table_string: {
        type: Schema.types.string,
        description: "Table that holds the time entries"
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
    required: ['table_string', 'signtime_string', 'holidays', 'comments'],
  },
});

function formatTime(time : string) 
{
  return new Date(time).toLocaleString('en-US', { 
    year: "numeric",
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
   });
}

function getDuration(duration : number)
{
  const hours = Math.floor(duration);
  const minutes = Math.round((duration - hours) * 60);

  return {hours, minutes};
}

function isWithinTimeFrame(type : string, time : Date)
{
  let now = new Date();
  now = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
  console.log("now = " + now);
  console.log("time = " + time);
  console.log("\n\n");
  
  if(type == "Weekly") {
    const lastWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    return (time >= lastWeek && time <= now) ? true : false;
  }
  else if(type == "Monthly") {
    return (time.getMonth() == now.getMonth() && time.getFullYear() == now.getFullYear()) ? true : false;
  }

  return false;
}

export default SlackFunction(CreateReportFunction, ({inputs}) => {
  const entries = inputs.time_entries;
  const type = inputs.report_type;
  const user = inputs.user;
  entries.sort((a,b) => new Date(a.time_in).getTime() - new Date(b.time_in).getTime());

  const column1 = "Time In";
  const column2 = "Time Out";
  const column3 = "Lunch?";
  const column4 = "Duration";
  
  let table = "\`\`\`";
  if(type == "Weekly") { table += "Weekly Report\n\n" }
  else if (type == "Monthly") { table += "Monthly Report\n\n" }
  else { table += "General Report\n\n" }

  table += column1.padEnd(32, ' ') + column2.padEnd(33, ' ') + column3.padEnd(21, ' ') + column4 + "\n";
  let signtime_string = "";
  let holidays = "";
  let comments = "";
  
  for(let i = 0; i < entries.length; i++) 
  {
    if(entries[i].person_name == user)
    {
      const time_in = formatTime(entries[i].time_in).replace(",", " @") + ' '.repeat(14);
      const time_out = formatTime(entries[i].time_out).replace(",", " @") + ' '.repeat(15);
      const duration = getDuration(Number(entries[i].duration));
      const lunch_break = entries[i].lunch_break ? "Yes" : "No";

      if((type == "Weekly" && isWithinTimeFrame("Weekly", new Date(entries[i].time_in))) || 
        (type == "Monthly" && isWithinTimeFrame("Monthly", new Date(entries[i].time_in))) ||
        (type == "General"))
      {
        const row = `${time_in}${time_out}${lunch_break.padEnd(21, ' ')}${duration.hours} hours & ${duration.minutes} minutes\n`;
        table += row;
        signtime_string += row;

        const holiday = entries[i].holiday_name;
        if(holiday != "undefined") {
          holidays += holiday + ", ";
        }

        const comment = entries[i].comments;
        if(comment != "undefined") {
          comments += `${time_in}`.substring(0,10) + `: ${comment}\n`;
        }
      }
    }
  }

  table += "\`\`\`";
  holidays = (holidays != "") ? holidays.slice(0, -2) : "No national holidays were included";
  comments = (comments != "") ? comments : "No comments were mentioned";
  return {
    outputs: {
      table_string: table,
      signtime_string: signtime_string,
      holidays: holidays,
      comments: comments,
    }
  }
});