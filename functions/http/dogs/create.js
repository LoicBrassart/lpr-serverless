import uuid from "uuid";
import * as dynamoDbLib from "../../../libs/dynamodb-lib";
import { success, failure } from "../../../libs/response-lib";

export async function main(event, context) {
  const data = event.mock ? event.body : JSON.parse(event.body);
  const params = {
    TableName: process.env.dogsTableName,
    Item: {
      id: uuid.v1(),
      name: data.name,
      breed: data.breed
    }
  };

  try {
    await dynamoDbLib.call("put", params);
    return success(params.Item);
  } catch (e) {
    return failure({ error: e });
  }
}
