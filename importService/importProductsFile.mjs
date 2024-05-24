import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const BUCKET_NAME = 'import-uploaded-bucket';

export async function importProductsFile(event) {
  const { name } = event.queryStringParameters;

  const s3Client = new S3Client({ region: 'us-east-1' });
  if (!name) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'File name is required' }),
    };
  }

  const params = {
    Bucket: BUCKET_NAME,
    Key: `uploaded/${name}`,
    Expires: 3600,
    ContentType: 'text/csv',
    ACL: 'private',
  };

  try {
    const command = new GetObjectCommand(params);
    const url = await getSignedUrl(s3Client, command, { expiresIn: 15 * 60 });

    return {
      statusCode: 200,
      body: JSON.stringify({ url }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Could not generate signed URL' }),
    };
  }
}
