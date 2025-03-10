import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { SlackAPIClient } from "deno-slack-api/types.ts";

export const DeleteTimeFunction = DefineFunction({
  callback_id: "delete_time",
  title: "Delete Time",
  description: "Deleting a time entry out of the datastore",
  source_file: "functions/DeleteTimeFunction.ts",
  input_parameters: {
    properties: {
      user_id: {
        type: Schema.types.string,
        description: "The person who entered time",
      },
      date: {
        type: Schema.types.string,
        description: "The date of the time entry to be deleted",
      }
    },
    required: ['user_id', 'date']
  },
  output_parameters: {
    properties: {
      confirmation_message: {
        type: Schema.types.string,
        description: "Description of the confirmation message"
      }
    },
    required: [],
  }
});

export async function getPrimaryKey(user_id : string, date : string, client : SlackAPIClient, datastore : string)
{  
  const query = await client.apps.datastore.query({
    datastore: datastore,
    expression: "contains(#time_in, :time_in) AND #person_name = :person_name",
    expression_attributes: { 
      "#time_in": "time_in", 
      "#person_name" : "person_name" 
    },
    expression_values: { 
      ":time_in": date,
      ":person_name": user_id,
    },
  });

  if(query.ok)
  {
    const items = query.items;
    const uuids = items.map(item => item.id);
    return uuids;
  }
  else {
    console.error(`Query failed: ${query.error}`);
    return [];
  }
}

async function deleteOutOfMsgDatastore(user_id : string, date : string, client : SlackAPIClient) 
{
  const primary_keys = await getPrimaryKey(user_id, date, client, "message_datastore");
  if(primary_keys.length > 0)
  {
    const msgDeleteQuery = await client.apps.datastore.bulkDelete({
    datastore: "message_datastore",
    ids: primary_keys,
    });
  
    if(!msgDeleteQuery.ok) {
      console.error(`Query failed: ${msgDeleteQuery.error}`);
    }
  }
}

export default SlackFunction(DeleteTimeFunction, async({inputs, client}) => {
  const {user_id, date} = inputs
  const uuids = await getPrimaryKey(user_id, date, client, "timecard_datastore");

  let msg = "";
  if(uuids.length > 0)
  {
    const deleteQuery = await client.apps.datastore.bulkDelete({
      datastore: "timecard_datastore",
      ids: uuids,
    });

    if(deleteQuery.ok) {
      msg = `${date}の時間エントリーを削除されました (Successfully deleted the time entry on ${date})`;
    }
    else {
      console.error(`Query failed: ${deleteQuery.error}`);
    }
  }
  else {
    msg = `${date}の時間エントリーは存在しません (There was no time entry to delete for ${date})`;
  }

  await deleteOutOfMsgDatastore(user_id, date, client);
  return {outputs: {confirmation_message: msg} }
});