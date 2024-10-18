import fs from 'fs'
import multer from 'multer'
import s3 from '@/lib/config/s3.config'

const uploadParams: any = {
  Bucket: process.env.AWS_BUCKET_NAME,
  Expires: 86400,
}

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: function (_req: any, file: any, cb: any) {
    cb(null, file.originalname)
  },
})

export const upload = multer({
  storage: storage,
  limits: { fieldSize: 25 * 1024 * 1024 },
})

interface UploadFileAttributes {
  source?: any //file path
  targetName: any //s3 key
  buffer?: any
  contentType?: string
  options?: {
    deleteOnSuccess: boolean
  }
}

export const multerErrorHandler = (err: any, req: any, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    // Multer specific errors
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "File size exceeds limit" });
    }
    return res.status(400).json({ message: "Multer error: " + err.message });
  } else if (err) {
    // Other errors
    return res
      .status(500)
      .json({ message: "Internal Server Error: " + err.message });
  }
  next();
};

//The uploadFile function
export async function uploadFile(data: UploadFileAttributes) {
  const { source, targetName, buffer, contentType, options } = data
  return new Promise((resolve, reject) => {
    if (buffer) {
      const putParams: any = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: targetName,
        Body: buffer,
        ContentType: contentType,
        ACL: 'public-read',
      }
      //upload in to s3
      s3.putObject(putParams, function (err: any, data: any) {
        if (err) {
          console.log('Error while uploading:', err)
          return reject(false)
        } else {
          console.log('Original image upload success', data)
          return resolve(true)
        }
      })
    } else {
      fs.readFile(source, async function (err: any, filedata: any) {
        if (!err) {
          const putParams: any = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: targetName,
            Body: filedata,
            ContentType: contentType,
            ACL: 'public-read',
          }
          s3.putObject(putParams, async function (err: any, data: any) {
            if (err) {
              console.log('Error while uploading:', err)
              return reject(false)
            } else {
              console.log('----- upload success -----', data)
              if (Boolean(options?.deleteOnSuccess)) {
                fs.unlink(source, (err) => {
                  if (err) return console.error(err)
                })
              }
              return resolve(true)
            }
          })
        } else {
          console.log(err, 'Error from readFile function in upload function')
          return reject(false)
        }
      })
    }
  })
}

//The retrieveFile function
export const retrieveFile = {
  object: function (Key: string) {
    s3.getObject({ ...uploadParams, Key }, function (err: any, data: any) {
      if (err) {
        return console.log(err)
      } else {
        return data.Body
      }
    })
  },
  signed: function (Key: string) {
    return s3.getSignedUrl('getObject', { ...uploadParams, Key })
  },
  publicUrl: (key: string) => `${process.env.AWS_S3_URL}/${key}`,
  compressedUrl: (key: string) => `${process.env.AWS_S3_URL}/optimized/${key}`,
}

export async function deleteS3Object(key: string): Promise<void> {
  const params: any = {
    Bucket: process.env.AWS_BUCKET_NAME, // Specify your bucket name
    Key: key, // Specify the key of the object you want to delete
  }

  try {
    await s3.deleteObject(params).promise()
    console.log(`Successfully deleted object with key ${key}`)
  } catch (error) {
    console.error(`Error deleting object with key ${key}:`, error)
    throw error // Propagate the error to the caller if needed
  }
}
