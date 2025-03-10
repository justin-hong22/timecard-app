import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { TIMECARD_DATASTORE } from "../datastores/TimecardDatastore.ts";

export const SaveTimeFunction = DefineFunction({
  callback_id: "save_time",
  title: "Save Time",
  description: "Saving clocked in and out time to datastore",
  source_file: "functions/SaveTimeFunction.ts",
  input_parameters: {
    properties: {
      name: {
        type: Schema.types.string,
        description: "The person who entered time",
      },
      time_in: {
        type: Schema.types.string,
        description: "Clocked in time",
      },
      time_out: {
        type: Schema.types.string,
        description: "Clocked out time",
      },
      lunch_break: {
        type: Schema.types.boolean,
        description: "Boolean to determine if a lunch break was taken. Defaults to 60 minutes",
      },
      comments: {
        type: Schema.types.string,
        description: "Any comments the person has",
      },
      from_msg: {
        type: Schema.types.boolean,
        description: "Boolen to determine where the workflow came from", 
      },
      is_first_msg: { 
        type: Schema.types.boolean,
        description: "Boolean for seeing if it's the first message of the day",
      },
    },
    required: ['name', 'time_in', 'lunch_break', 'from_msg', 'is_first_msg'],
  },
  output_parameters: {
    properties: {
      confirmation_message: {
        type: Schema.types.string,
        description: "Description of the confirmation message"
      }
    },
    required: [],
  },
});

export default SlackFunction(SaveTimeFunction, async({inputs, client}) => {
  const {name, time_in, time_out, lunch_break, comments, from_msg, is_first_msg} = inputs;
  let date_in, date_out, duration, holiday_name;
  const tokyoOffset = 9 * 60 * 60 * 1000;

  if(from_msg)
  {
    if(!is_first_msg) {
      return { outputs: { confirmation_message: `今日はもうメッセージを送ったので時間エントリーをされません (This is not the first message of the day, so time entry was not saved)` } };
    }

    date_in = new Date(Number(time_in) * 1000 + tokyoOffset);
    date_out = new Date(Number(time_in) * 1000 + (9 * 60 * 60 * 1000) + tokyoOffset);
    duration = 8;
    holiday_name = FindHoliday(date_in);
  }
  else
  {
    const end_time = (time_out == null) ? (Number(time_in) * 1000) + (9 * 60 * 60 * 1000) : Number(time_out) * 1000;

    date_in = new Date(Number(time_in) * 1000 + tokyoOffset);
    date_out = new Date(end_time + tokyoOffset);
    duration = lunch_break ? (date_out.getTime() - date_in.getTime() - 3600000) / 3600000 : (date_out.getTime() - date_in.getTime()) / 3600000;
    holiday_name = FindHoliday(date_in);
  }

  const uuid = crypto.randomUUID();
  const putResponse = await client.apps.datastore.put({
    datastore: TIMECARD_DATASTORE,
    item: {
      id: uuid,
      person_name: name,
      time_in: date_in,
      time_out: date_out,
      duration: duration,
      lunch_break: lunch_break,
      holiday_name: holiday_name,
      comments: comments,
    }
  });

  console.log(putResponse);
  if (!putResponse.ok) {
    return { error: `Failed to store time: ${putResponse.error}` };
  }

  if(from_msg && is_first_msg) { 
    return { outputs: { confirmation_message: `今日の最初メッセージから時間エントリーを保存されました！ (Time entry has been saved from first message of the day!)`} }
  }

  return { outputs: {} };
});

export function FindHoliday(input_date : Date)
{
  function getVariableHolidays(year : number, month : number, week : number, weekday : number)
  {
    const firstDay = new Date(year, month, 1).getDay();
    const offset = (weekday - firstDay + 7) % 7;
    const day = 1 + offset + (week - 1) * 7;
    const date = (month + 1) + "-" + day;
    return date;
  }

  const holidays_jp = new Map([
    ['1-1', '元日'],
    ['2-11', '建国記念の日'],
    ['2-23', '天皇誕生日'],
    ['3-20', '春分の日'],
    ['4-29', '昭和の日'],
    ['5-3', '憲法記念日'],
    ['5-4', 'みどりの日'],
    ['5-5', 'こどもの日'],
    ['8-11', '山の日'],
    ['9-23', '秋分の日'],
    ['11-3', '文化の日'],
    ['11-23', '勤労感謝の日'],
  ]);

  const holidays_en = new Map([
    ['1-1', 'New Year\'s Day'],
    ['2-11', 'National Foundation Day'],
    ['2-23', 'Emperor\'s Birthday'],
    ['3-20', 'Vernal Equinox Day'],
    ['4-29', 'Showa Day'],
    ['5-3', 'Constitution Day'],
    ['5-4', 'Greenery Day'],
    ['5-5', 'Children\'s Day'],
    ['8-11', 'Mountain Day'],
    ['9-23', 'Autumnal Equinox Day'],
    ['11-3', 'Culture Day'],
    ['11-23', 'Labor Thanksgiving Day'],
  ]);
  
  const input_year = input_date.getFullYear()
  holidays_jp.set(getVariableHolidays(input_year, 0, 2, 1), '成人の日');
  holidays_jp.set(getVariableHolidays(input_year, 6, 3, 1), '海の日');
  holidays_jp.set(getVariableHolidays(input_year, 8, 3, 1), '敬老の日');
  holidays_jp.set(getVariableHolidays(input_year, 9, 2, 1), 'スポーツの日');

  holidays_en.set(getVariableHolidays(input_year, 0, 2, 1), 'Coming of Age Day');
  holidays_en.set(getVariableHolidays(input_year, 6, 3, 1), 'Marine Day');
  holidays_en.set(getVariableHolidays(input_year, 8, 3, 1), 'Respected for the Aged Day');
  holidays_en.set(getVariableHolidays(input_year, 9, 2, 1), 'Sports Day');

  const check_date = (input_date.getMonth() + 1) + '-' + input_date.getDate();
  let holiday_name = holidays_jp.get(check_date);
  if(holiday_name != null) {
    holiday_name = holiday_name + " (" + holidays_en.get(check_date) + ")";
  } 

  //Check for any "observed" holidays
  if(input_date.getDay() == 1 && holiday_name == null) {
    const holiday_name_jp = holidays_jp.get((input_date.getMonth() + 1) + '-' + (input_date.getDate() - 1));
    const holiday_name_en = holidays_en.get((input_date.getMonth() + 1) + '-' + (input_date.getDate() - 1));
    if (holiday_name_jp != null) { holiday_name = holiday_name_jp + " (振替休日) (" + holiday_name_en + " (observed))"; } 
  }
  
  return holiday_name;  
}