import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { TIMECARD_DATASTORE } from "../datastores/TimecardDatastore.ts";

export const SaveTimeFunction = DefineFunction({
  callback_id: "save_time",
  title: "Save Time",
  description: "Saving clocked in and out time to datastore",
  source_file: "functions/SaveTimeFunction.ts",
  input_parameters: {
    properties: {
      time_in: {
        type: Schema.types.string,
        description: "Clocked in time",
      },
      time_out: {
        type: Schema.types.string,
        description: "Clocked out time",
      },
      name: {
        type: Schema.types.string,
        description: "The person who entered time",
      }
    },
    required: [],
  },
  output_parameters: {
    properties: {},
    required: [],
  },
});

export default SlackFunction(SaveTimeFunction, async({inputs, client}) => {
  const {time_in, time_out, name} = inputs;
  
  const date_in = new Date(Number(time_in) * 1000);
  const date_out = new Date(Number(time_out) * 1000);
  const duration = (date_out.getTime() - date_in.getTime()) / 3600000;
  const holiday_name = findHoliday(date_in);
  const is_holiday = (holiday_name == null) ? false : true;

  const uuid = crypto.randomUUID();
  const putResponse = await client.apps.datastore.put({
    datastore: TIMECARD_DATASTORE,
    item: {
      id: uuid,
      time_in: date_in,
      time_out: date_out,
      duration: duration,
      is_holiday: is_holiday,
      holiday_name: holiday_name,
      person_name: name,
    }
  });

  console.log(putResponse);
  if (!putResponse.ok) {
    return { error: `Failed to store time: ${putResponse.error}` };
  }

  return { outputs: {} };
});

function findHoliday(input_date : Date)
{
  function getVariableHolidays(year : number, month : number, week : number, weekday : number)
  {
    const firstDay = new Date(year, month, 1).getDay();
    const offset = (weekday - firstDay + 7) % 7;
    const day = 1 + offset + (week - 1) * 7;
    const date = (month + 1) + "-" + day;
    return date;
  }

  const holidays = new Map([
    ['1-1', 'New Year\'s Day'],
    ['2-11', 'National Foundation Day'],
    ['2-23', 'Emperor\'s Birthday'],
    ['4-29', 'Showa Day'],
    ['5-3', 'Constitution Day'],
    ['5-4', 'Greenery Day'],
    ['5-5', 'Children\'s Day'],
    ['8-11', 'Mountain Day'],
    ['11-3', 'Culture Day'],
    ['11-23', 'Labor Thanksgiving Day'],
  ]);

  const input_year = input_date.getFullYear();
  holidays.set(getVariableHolidays(input_year, 0, 2, 1), 'Coming of Age Day');
  holidays.set(getVariableHolidays(input_year, 6, 3, 1), 'Marine Day');
  holidays.set(getVariableHolidays(input_year, 8, 3, 1), 'Respected for the Aged Day');
  holidays.set(getVariableHolidays(input_year, 9, 2, 1), 'Sports Day');

  const check_date = (input_date.getMonth() + 1) + '-' + input_date.getDate();
  let holiday_name = holidays.get(check_date);

  //Check for any "observed" holidays
  if(input_date.getDay() == 1 && holiday_name == null) {
    holiday_name = holidays.get((input_date.getMonth() + 1) + '-' + (input_date.getDate() - 1));
    if (holiday_name != null) { holiday_name = holiday_name + " (observed)"; } 
  }
  
  return holiday_name;  
}