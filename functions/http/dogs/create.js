import * as dynamoDbLib from "../../../libs/dynamodb-lib";
import { success, failure } from "../../../libs/response-lib";

export async function main(event, context) {
  const data = event.mock ? event.body : JSON.parse(event.body);
  const params = {
    TableName: process.env.dogsTableName
  };

  try {
    const res = await dynamoDbLib.call("get", params);
    return success(res.Item);
  } catch (e) {
    return failure({ error: e });
  }
}
