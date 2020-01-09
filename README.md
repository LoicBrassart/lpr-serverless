# README

Serverless initiation by Grégoire Louise @ La Pilule Rouge

### Launch Project

- Create a Git Branch : serverless-init-FIRSTNAME-LASTNAME
- Install virtualBox & vagrant : [how to](https://linuxize.com/post/how-to-install-vagrant-on-ubuntu-18-04/)
- Run **vagrant up** to build our VM.
- Run **vagrant ssh** to enter our VM.
- Run **cd /vagrant**
- welcome to our project directory inside our VM.

For an easier comprehension, webpack puglin has already been set :
Plugins are defined in serverless.yml file like this :

```yaml
plugins:
  - serverless-webpack
```

You can read webpack.config.js and .babelrc file to see how configuration is done.

- Run **aws configure** with the credetials given to you.

- Change Service name (first line of serverless.yml) with your firstname and lastname

### Our first Resource Creation

We will use serverless [resources](https://serverless.com/framework/docs/providers/aws/guide/resources/)

In the serverless.yml, line 117 you can see an exemple, of a resource definition.

First of all, we want to keep our serverless.yml file clean, so we're going to define our resources in a separate file.
To do so, we'll use :

```yaml
resources: ${file(resources.yml)}
```

in our serverless.yml.

Here \${file()} indicates that we are pointing to another file, named resources.yml in our example.
So we need to create a **resources.yml** file in our project root.

Once again, to keep our resources.yml file clean, we will make it point to other files, one file per resource definition.

So we now need to create a **resources** directory in our project root, and we'll create a **table-dogs.yml** file inside it.

You'll need to refere the **table-dogs.yml** file in the **resources.yml** file using :

```yaml
- ${file(resources/table-dogs.yml)}
```

Tips : the dash - in a YAML file represents an array item.

We now want to create our first resoucre, a [DynamoDB table](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-dynamodb-table.html). The table definition will be written in our newly created **table-dogs.yml** file.

As we have created a .yml file, we will use the YAML synthax

### dogs Table creation instructions

- !! Read the Documentation, some properties are required, some aren't !!
- As we used links to keep our files clean, **table-dogs.yml** needs to begin with

```yaml
Resources:
  dogsTable:
```

- Where dogsTable will be the logical name of the resource.
- Be carefull with the indentation.
- We don't need any Global or Local secondary indexes for now.
- BillingMode should be set to `PAY_PER_REQUEST`.
- Hash key need to be named id.
- TableName need to be : <SERVICENAME>-<STAGE>-dogs
- Tips : you can acces information defined in the serverless.yml keys by using \${self:<nameOfTheKey>}

### Backend Preparation

To keep our CRUD functions clean we will define some functions that will be used by most of our Lambdas.
this code is from the official [serverless guide](https://serverless-stack.com/#table-of-contents)

- Create a **libs/** directory in project root

- Create a **libs/reponse-lib.js** file
- Paste

```javascript
export function success(body) {
  return buildResponse(200, body);
}

export function failure(body) {
  return buildResponse(500, body);
}

function buildResponse(statusCode, body) {
  return {
    statusCode: statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true
    },
    body: JSON.stringify(body)
  };
}
```

- Create a **libs/dynamodb-lib.js** file
- Paste

```javascript
import AWS from "aws-sdk";

export function call(action, params) {
  const dynamoDb = new AWS.DynamoDB.DocumentClient();

  return dynamoDb[action](params).promise();
}
```

- We can now create our first Lambda!

### First Lambda Creation

Serverless [documentation](https://serverless.com/framework/docs/providers/aws/guide/functions/)
Like for the resources definitions, we want to keep our serverless.yml file clean.

- You can remplace the lines 74 to 76 with

```yaml
functions: ${file(functions.yml)}
```

and create a **functions.yml** file in our project root.
You can also remove the handler.js file, as it is not used anymore.

- As for the resources.yml file, our new functions.yml file will refere to other files, one per function definition, in a **functions** directory that we need to create in our projet root.

- To keep our **functions** directory clean, we will organize it by event types. As we are creating a CRUD, we an create an **http** directory inside our **functions** directory.

- We want to create a POST lambda for our dogs DynamoDB table, so we can create a **dogs** directory inside the **http** directory.

- In this **dogs** directory, we'll need to create two files : create.js and functions.yml

- create.js will contain our code, functions.yml will contain the definition of our lambda.

\*For serverless to find our lambda definition, we need to make a reference of this functions.yml file in our serverless.yml file.
Remember we write `functions: ${file(functions.yml)}` in the serverless.yml file and that we alreay created a functions.yml file in our projet root?
All we have to do is to add

```yaml
- ${file(functions/http/dogs/functions.yml)}
```

in that file, as we did for the resources.\*

\*Little explanation here : when we will ask to serverless to build our code, it will read the serverless.yml file. When it will read

```yaml
functions: ${file(functions.yml)}
```

it will go to the root of our project and search for a functions.yml file, and read it.
It will then read

```yaml
- ${file(functions/http/dogs/functions.yml)}
```

, go to the root of the project, and search for a functions directory enter http directory, dogs directory, and read the functions.yml file. Bingo, serverless had find our lambda definition.\*

- Back to our **create.js** file inside our dogs directory. Paste :

```javascript
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
```

- And our **functions.yml** file inside our dogs directory. Paste :

```yaml
createDog:
  handler: functions/http/dogs.main
  events:
    - http:
        path: dogs
        method: post
        cors: true
        private: true
  iamRoleStatements:
    - Effect: Allow
      Action:
        - dynamodb:PutItem
        - dynamodb:UpdateItem
        - dynamodb:UpdateTable
      Resource:
        - "Fn::GetAtt": [dogsTable, Arn]
```

- We now need an example to tryout our new lambda : create a **mocks/** directory in project root.
- Create a **mocks/createDog.json** file, and Paste :

```javascript
{
    "mock": true,
    "body": {
        "name": "John",
        "breed": "Beagle"
    }
}
```

### Deploy and run our First Lambda

- Run

```
serverless deploy --stage dev
```

. Congratulations, you have created you first serverless backend ! **Save the value of the apiKey, this is the value of the dev-init-LASTNAME-FIRSTNAME-Key key**.

- Run

```
serverless invoke -f createDog --path mocks/createDog.json
```

. You should get a nice 200 status. **Save the ID somewhere, you'll need it later**

### What now?

You can now create a GET, a GET_ALL, an UPDATE and a DELETE lambdas for our dogs.
You will now use [Postman](https://www.getpostman.com/) to do your tests. You'll need to add a header, the key should be **x-api-key** and the value is the value of the apiKey you saved earlier.

### Kennel Creation

Now that we have a complete CRUD for our Dogs, let's do the same for kennels.

- Create a DynamoDB table : **kennelsTable**
- Create a complete CRUD for kennels. You can Copy/Paste the Lambdas used for Dogs.
- For the POST lambda, you only need id and name in the Item for now.
