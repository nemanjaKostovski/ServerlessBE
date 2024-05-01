import AWS from 'aws-sdk';
import { randomUUID } from 'crypto';

const dynamoDBClient = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });

const PRODUCTS_TABLE = 'products';
const STOCK_TABLE = 'stock';

export async function createProduct(product) {
  try {
    const productId = randomUUID();
    const params = {
      TableName: PRODUCTS_TABLE,
      Item: { productId, ...product },
    };
    await dynamoDBClient.put(params).promise();
  } catch (error) {
    console.error(error);
    throw new Error('Could not create product');
  }
}

export async function getProductList() {
  try {
    const productsParams = {
      TableName: PRODUCTS_TABLE,
    };
    const productsResponse = await dynamoDBClient
      .scan(productsParams)
      .promise();

    const stockParams = {
      TableName: STOCK_TABLE,
    };
    const stockResponse = await dynamoDBClient.scan(stockParams).promise();

    const stockMap = {};
    stockResponse.Items.forEach((item) => {
      stockMap[item.productId] = item.count;
    });

    const productList = productsResponse.Items.map((item) => ({
      ...item,
      count: stockMap[item.productId] || 0,
    }));

    return productList;
  } catch (error) {
    console.error(error);
    throw new Error('Could not retrieve products');
  }
}

export async function getProductById(productId) {
  try {
    const params = {
      TableName: PRODUCTS_TABLE,
      Key: { productId },
    };
    const productResponse = await dynamoDBClient.get(params).promise();
    return productResponse.Item;
  } catch (error) {
    console.error(error);
    throw new Error('Could not retrieve product');
  }
}
