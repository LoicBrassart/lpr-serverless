import * as dynamoDbLib from "../../../libs/dynamodb-lib";
import { success, failure } from "../../../libs/response-lib";

export async function main(event, context) {
  const data = event.mock ? event.pathParameters : event.pathParameters;
  const params = {
    TableName: process.env.dogsTableName,
    Key: { id: data.id }
  };

  try {
    const res = await dynamoDbLib.call("get", params);
    return success(res);
  } catch (e) {
    return failure({ error: e });
  }
}
