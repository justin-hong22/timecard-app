import { DefineType, Schema } from "deno-slack-sdk/mod.ts";

export const TimeCardType = DefineType({
  title: "Time Information",
  description: "When someone clocks in and out, while determining holidays",
  name: "timecard_type",
  type: Schema.types.object,
  properties: {
    id: {type: Schema.types.string},
    time_in: {type: Schema.types.string},
    time_out: {type: Schema.types.string},
    duration: {type: Schema.types.number},
    is_holiday: {type: Schema.types.boolean},
    holiday_name: {type: Schema.types.string},
    person_name: {type: Schema.types.string},
  },
  required: ['id', 'time_in', 'time_out', 'duration', 'is_holiday', 'holiday_name'],
});