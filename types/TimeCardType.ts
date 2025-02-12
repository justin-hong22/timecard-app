import { DefineType, Schema } from "deno-slack-sdk/mod.ts";

export const TimeCardType = DefineType({
  title: "Time Information",
  description: "When someone clocks in and out, while determining holidays",
  name: "timecard_type",
  type: Schema.types.object,
  properties: {
    id: {type: Schema.types.string},
    person_name: {type: Schema.types.string},
    time_in: {type: Schema.types.string},
    time_out: {type: Schema.types.string},
    duration: {type: Schema.types.number},
    lunch_break: {type: Schema.types.boolean},
    holiday_name: {type: Schema.types.string},
    comments: {type: Schema.types.string},
  },
  required: ['id', 'person_name', 'time_in', 'time_out', 'duration', 'lunch_break', 'holiday_name'],
});