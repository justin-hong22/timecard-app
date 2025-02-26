import { DefineDatastore, Schema } from "deno-slack-sdk/mod.ts";

export const MESSAGE_DATASTORE = 'message_datastore';

const MessageDatastore = DefineDatastore({
  name: MESSAGE_DATASTORE,
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
    }
  }
});

export default MessageDatastore;

//To delete entries out of datastore, use this terminal command
//slack datastore delete '{ "datastore": "MESSAGE_DATASTORE", "id": "XXX" }'

//To view what's in the datastore, use this
//slack datastore query '{"datastore": "MESSAGE_DATASTORE" }'