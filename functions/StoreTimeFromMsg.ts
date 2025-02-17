import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { TIMECARD_DATASTORE } from "../datastores/TimecardDatastore.ts";

export const StoreTimeFromMsg = DefineFunction({
  callback_id: "store_time_from_msg",
  title: "Store Time From Message",
  source_file: "functions/StoreTimeFromMsg.ts",
  input_parameters: {
    properties: {
      is_first_msg: { 
        type: Schema.types.boolean,
        description: "Boolean for seeing if it's the first message of the day",
      },
      user_id: {
        type: Schema.slack.types.user_id,
        description: "The user id of the person who typed in a message",
      },
      timestamp: {
        type: Schema.types.string,
        description: "The time of when the message was sent",
      }
    },
    required: ['is_first_msg', 'user_id', 'timestamp']
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

export default SlackFunction(StoreTimeFromMsg, async({inputs, client}) => { 
  const{ is_first_msg, user_id, timestamp } = inputs;

  //if it's not the first msg of the day, do nothing
  if(!is_first_msg) {
    return { outputs: { confirmation_message: `This is not the first message of the day, so time entry was not saved` } };
  }

  const date_in = new Date(Number(timestamp) * 1000);
  const date_out = new Date(Number(timestamp) * 1000 + (9 * 60 * 60 * 1000));
  const lunch_break = true;
  const duration = 8;
  const holiday_name = findHoliday(date_in);

  const uuid = crypto.randomUUID();
  const putResponse = await client.apps.datastore.put({
    datastore: TIMECARD_DATASTORE,
    item: {
      id: uuid,
      person_name: user_id,
      time_in: date_in,
      time_out: date_out,
      duration: duration,
      lunch_break: lunch_break,
      holiday_name: holiday_name,
    }
  });

  console.log(putResponse);
  if (!putResponse.ok) {
    return { error: `Failed to store time: ${putResponse.error}` };
  }

  return { outputs: { confirmation_message: `Time entry has been saved from first message of the day!`} };
});

function findHoliday(date : Date)
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

  const input_date =  new Date(date.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
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