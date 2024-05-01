import AWS from 'aws-sdk';
import { products, stock } from './products.mjs';

const dynamoDBClient = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });

async function insertDynamo(table_name, items) {
  try {
    for (const item of items) {
      const params = {
        TableName: table_name,
        Item: item,
      };
      await dynamoDBClient.put(params).promise();
    }
  } catch (error) {
    console.error(error);
  }
}

insertDynamo('products', products);
insertDynamo('stock', stock);
