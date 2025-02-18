export function FindHoliday(date : Date)
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