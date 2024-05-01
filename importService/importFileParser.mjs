import {
  S3Client,
  GetObjectCommand,
  DeleteObjectCommand,
  CopyObjectCommand,
} from '@aws-sdk/client-s3';
import csvParser from 'csv-parser';

const s3Client = new S3Client();

export async function importFileParser(event, context) {
  const recordPromises = event.Records.map(async (record) => {
    const getObjectParams = {
      Bucket: process.env.BUCKET_NAME,
      Key: record.s3.object.key,
    };

    try {
      const { Body } = await s3Client.send(
        new GetObjectCommand(getObjectParams)
      );

      Body.pipe(csvParser())
        .on('data', (data) => {
          console.log('Parsed record:', data);
        })
        .on('end', async () => {
          try {
            await copyAndDelete(record);
            console.log('CSV file successfully processed');
          } catch (error) {
            console.error('Error copying and deleting file:', error);
            throw error;
          }
        })
        .on('error', (error) => {
          console.error('Error processing CSV file', error);
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
