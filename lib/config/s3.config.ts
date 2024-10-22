import AWS from 'aws-sdk'

export const S3_BUCKET = process.env.BUCKET_NAME
export const REGION = process.env.REGION

const ACCESS_KEY = process.env.ACCESS_KEY
const SECRET_KEY = process.env.SECRET_KEY

AWS.config.update({
  accessKeyId: ACCESS_KEY,
  secretAccessKey: SECRET_KEY,
})

const s3 = new AWS.S3({
  params: { Bucket: S3_BUCKET },
  region: REGION,
})

export default s3
