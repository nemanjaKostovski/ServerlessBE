import {
  S3Client,
  GetObjectCommand,
  DeleteObjectCommand,
  CopyObjectCommand,
} from '@aws-sdk/client-s3';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import csvParser from 'csv-parser';

const s3Client = new S3Client();
const sqsClient = new SQSClient();

const BUCKET_NAME = 'import-uploaded-bucket';
const SQS_QUEUE_URL =
  'https://sqs.us-east-1.amazonaws.com/059551633106/CatalogItemsQueue';

const sendMessagePromises = [];

const sendMessage = async (queueUrl, messageBody) => {
  console.log('Sending message to SQS inside');
  const command = new SendMessageCommand({
    QueueUrl: queueUrl,
    MessageBody: messageBody,
  });
  console.log('command', command);
  await sqsClient.send(command);
};

export async function importFileParser(event, context) {
  const recordPromises = event.Records.map(async (record) => {
    const getObjectParams = {
      Bucket: BUCKET_NAME,
      Key: record.s3.object.key,
    };

    try {
      const { Body } = await s3Client.send(
        new GetObjectCommand(getObjectParams)
      );
      const queueUrl = SQS_QUEUE_URL;

      return new Promise((resolve, reject) => {
        Body.pipe(csvParser())
          .on('data', async (data) => {
            console.log('Parsed record:', data);
            try {
              const sendMessagePromise = sendMessage(
                queueUrl,
                JSON.stringify(data)
              );
              sendMessagePromises.push(sendMessagePromise);
            } catch (error) {
              console.log('Error sending message to SQS:', error);
              // throw error;
              reject(error);
            }
          })
          .on('end', async () => {
            console.log('Sending message to SQS');
            await Promise.all(sendMessagePromises);
            console.log('Message sent to SQS');
            console.log('Copying and deleting file');
            await copyAndDelete(record);
            console.log('CSV file successfully processed');
            resolve();
          })
          .on('error', (error) => {
            console.error('Error processing CSV file', error);
            reject(error);
          });
      });
    } catch (error) {
      console.error('Error getting object from S3:', error);
      throw error;
    }
  });

  try {
    await Promise.all(recordPromises);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'File parsed successfully' }),
    };
  } catch (error) {
    console.error('Error processing records:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error parsing file' }),
    };
  }
}

async function copyAndDelete(record) {
  const copyObjectParams = {
    Bucket: process.env.BUCKET_NAME,
    CopySource: `${process.env.BUCKET_NAME}/${record.s3.object.key}`,
    Key: `parsed/${record.s3.object.key.split('/').pop()}`,
  };
  await s3Client.send(new CopyObjectCommand(copyObjectParams));
  console.log(copyObjectParams);
  console.log('File copied to parsed folder');
  const deleteObjectParams = {
    Bucket: process.env.BUCKET_NAME,
    Key: record.s3.object.key,
  };
  console.log('Deleting original file');
  await s3Client.send(new DeleteObjectCommand(deleteObjectParams));
}
