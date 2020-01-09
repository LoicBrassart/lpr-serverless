import * as dynamoDbLib from "../../../libs/dynamodb-lib";
import { success, failure } from "../../../libs/response-lib";

export async function main(event, context) {
  const params = {
    TableName: process.env.dogsTableName
  };

  try {
    await dynamoDbLib.call("get");
    return success(params.Item);
  } catch (e) {
    return failure({ error: e });
  }
}
