import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';
import { createProduct } from './productService.mjs';

const snsClient = new SNSClient();
export async function catalogBatchProcess(event, context) {
  try {
    const products = event.Records.map((record) => JSON.parse(record.body));
    products.map(async (product) => await createProduct(product));
    const message = {
      Message: 'Products successfully created!',
      TopicArn: '',
    };
    const command = new PublishCommand(message);
    console.log('Sending message to SNS', command);
    const response = await snsClient.send(command);
    console.log('Message sent to SNS', response);
  } catch (error) {
    console.error(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Products successfully created!' }),
  };
}
