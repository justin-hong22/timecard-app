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

async function getPimaryKey(user_id : string, date : string, client : SlackAPIClient)
{  
  const query = await client.apps.datastore.query({
    datastore: "timecard_datastore",
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

export default SlackFunction(DeleteTimeFunction, async({inputs, client}) => {
  const {user_id, date} = inputs
  const uuids = await getPimaryKey(user_id, date, client);

  let msg = "";
  if(uuids.length > 0)
  {
    const deleteQuery = await client.apps.datastore.bulkDelete({
      datastore: "timecard_datastore",
      ids: uuids,
    });

    if(deleteQuery.ok) {
      msg = `Successfully deleted the time entry on ${date}`;
    }
    else {
      console.error(`Query failed: ${deleteQuery.error}`);
    }
  }
  else {
    msg = `There was no time entry to delete for ${date}`;
  }
    
  return {outputs: {confirmation_message: msg} }
});