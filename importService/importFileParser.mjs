import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import csvParser from 'csv-parser';

const BUCKET_NAME = 'import-uploaded-bucket';

const s3Client = new S3Client();

export async function importFileParser(event) {
  const recordPromises = event.Records.map(async (record) => {
    const getObjectParams = {
      Bucket: BUCKET_NAME,
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
