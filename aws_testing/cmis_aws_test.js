const { S3Client, ListBucketsCommand } = require('@aws-sdk/client-s3');
require('dotenv').config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

async function testConnection() {
  try {
    const command = new ListBucketsCommand({});
    const response = await s3Client.send(command);
    console.log('Connection successful!');
    console.log('Your buckets:', response.Buckets.map(b => b.Name));
  } catch (error) {
    console.error('Connection failed:', error.message);
  }
}

testConnection();

//npm install @aws-sdk/client-s3 dotenv
//node test-s3-access.js
