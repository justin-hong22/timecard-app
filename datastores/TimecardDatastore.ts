import { DefineDatastore, Schema } from "deno-slack-sdk/mod.ts";

export const TIMECARD_DATASTORE = 'timecard_datastore';

const TimecardDatastore = DefineDatastore({
  name: TIMECARD_DATASTORE,
  primary_key: 'id',
  attributes: {
    id: {
      type: Schema.types.string,
    },
    person_name: {
      type: Schema.slack.types.user_id,
    },
    time_in: {
      type: Schema.types.string,
    },
    time_out: {
      type: Schema.types.string,
    },
    duration: {
      type: Schema.types.number,
    },
    lunch_break: {
      type: Schema.types.boolean,
    },
    holiday_name: {
      type: Schema.types.string,
    },
    comments: {
      type: Schema.types.string,
    }
  }
});

export default TimecardDatastore;

//To delete entries out of datastore, use this terminal command
//slack datastore delete '{ "datastore": "TIMECARD_DATASTORE", "id": "XXX" }'

//To view what's in the datastore, use this
//slack datastore query '{"datastore": "TIMECARD_DATASTORE"}'