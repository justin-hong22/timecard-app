interface TimeEntries 
{
  id: string;
  person_name: string;
  time_in: string;
  time_out: string;
  duration: number;
  lunch_break: boolean;
  holiday_name: string;
  comments: string;
}

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
  
  if(type == "Weekly") {
    const lastWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    return (time >= lastWeek && time <= now) ? true : false;
  }
  else if(type == "Monthly") {
    return (time.getMonth() == now.getMonth() && time.getFullYear() == now.getFullYear()) ? true : false;
  }

  return false;
}

function getReportType(input: string) : string 
{
  const part = input.split("(");
  return part[1].split(")")[0];
}

export function GenerateReport(user: string, report_type: string, entries: TimeEntries[])
{
  const type = getReportType(report_type);
  entries.sort((a,b) => new Date(a.time_in).getTime() - new Date(b.time_in).getTime());

  const column1 = "出勤 (Time In)";
  const column2 = "退勤 (Time Out)";
  const column3 = "昼休み (Lunch)";
  const column4 = "間 (Duration)";
  
  let table = "\`\`\`";
  if(type == "Weekly") { table += "週報 (Weekly Report)\n\n" }
  else if (type == "Monthly") { table += "月報 (Monthly Report)\n\n" }
  else { table += "一般レポート (General Report)\n\n" }

  table += column1.padEnd(21, ' ') + column2.padEnd(22, ' ') + column3.padEnd(18, ' ') + column4 + "\n";
  let signtime_string = "";
  let holidays = "";
  let comments = "";
  
  for(let i = 0; i < entries.length; i++) 
  {
    if(entries[i].person_name == user)
    {
      const time_in = formatTime(entries[i].time_in).replace(",", " @");
      const time_out = formatTime(entries[i].time_out).replace(",", " @");
      const duration = getDuration(Number(entries[i].duration));
      const lunch_break = entries[i].lunch_break ? "Yes" : "No";

      if((type == "Weekly" && isWithinTimeFrame("Weekly", new Date(entries[i].time_in))) || 
        (type == "Monthly" && isWithinTimeFrame("Monthly", new Date(entries[i].time_in))) ||
        (type == "General"))
      {
        table += `${time_in + ' '.repeat(5)}${time_out + ' '.repeat(5)}${lunch_break.padEnd(20, ' ')}${duration.hours} hrs & ${duration.minutes} min\n`;
        signtime_string += `${time_in + ' '.repeat(12)}${time_out + ' '.repeat(18)}${lunch_break.padEnd(35, ' ')}${duration.hours} hrs & ${duration.minutes} min\n`;

        const holiday = entries[i].holiday_name;
        if(holiday != "undefined" && holiday != "") {
          holidays += holiday + ", ";
        }

        const comment = entries[i].comments;
        if(comment != "undefined" && comment != "") {
          comments += `${time_in}`.substring(0,10) + `: ${comment}\n`;
        }
      }
    }
  }

  table += "\`\`\`";
  holidays = (holidays != "") ? holidays.slice(0, -2) : "休日なし (No national holidays were elapsed)";
  comments = (comments != "") ? comments : "コメントなし (No comments were mentioned)";

  return {table, holidays, comments}
}