import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { products, stock } from './products.mjs';

const dynamoDBClient = new DynamoDBClient({ region: 'us-east-1' });

async function insertDynamo(table_name, items) {
  try {
    for (const item of items) {
      const params = {
        TableName: table_name,
        Item: marshall(item),
      };
      await dynamoDBClient.send(new PutItemCommand(params));
    }
  } catch (error) {
    console.error(error);
  }
}

insertDynamo('products', products);
insertDynamo('stock', stock);
