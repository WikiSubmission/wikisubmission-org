import { S3Client } from '@aws-sdk/client-s3'

export const s3Client = new S3Client({
  region: 'eu-north-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
})

export const BUCKET_NAME = 'wikisubmission'
export const CLOUDFRONT_URL = 'https://cdn.wikisubmission.org'
