import * as dynamoDbLib from "../../../libs/dynamodb-lib";
import { success, failure } from "../../../libs/response-lib";

export async function main(event, context) {
  const params = {
    TableName: process.env.dogsTableName
  };

  try {
    const res = await dynamoDbLib.call("scan", params);
    return success(res);
  } catch (e) {
    return failure({ error: e });
  }
}
