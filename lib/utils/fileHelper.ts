import { v4 as uuidv4 } from "uuid";
type FileCategory = 'image' | 'video' | 'audio' | 'document' | 'other';
interface FileInfo {
	extension: string;
	category: FileCategory;
}

export const validImageTypes = [
	'image/jpeg',
	'image/png',
	'image/gif',
	'image/webp',
];

export const validVideoTypes = [
	'video/mp4',
	'video/quicktime',
	'video/x-msvideo',
	'video/webm',
];

// Map of MIME types to file extensions and categories
export const mimeTypeMap: Record<
	string,
	{ extension: string; category: FileCategory }
> = {
	// Image types
	'image/jpeg': { extension: 'jpg', category: 'image' },
	'image/png': { extension: 'png', category: 'image' },
	'image/gif': { extension: 'gif', category: 'image' },
	'image/webp': { extension: 'webp', category: 'image' },

	// Video types
	'video/mp4': { extension: 'mp4', category: 'video' },
	'video/quicktime': { extension: 'mov', category: 'video' },
	'video/x-msvideo': { extension: 'avi', category: 'video' },
	'video/webm': { extension: 'webm', category: 'video' },

	// Audio types
	'audio/mpeg': { extension: 'mp3', category: 'audio' },
	'audio/wav': { extension: 'wav', category: 'audio' },
	'audio/ogg': { extension: 'ogg', category: 'audio' },

	// Document types
	'application/pdf': { extension: 'pdf', category: 'document' },
	'application/msword': { extension: 'doc', category: 'document' },
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
		extension: 'docx',
		category: 'document',
	},
	'application/vnd.ms-excel': { extension: 'xls', category: 'document' },
	'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
		extension: 'xlsx',
		category: 'document',
	},
	'application/vnd.ms-powerpoint': { extension: 'ppt', category: 'document' },
	'application/vnd.openxmlformats-officedocument.presentationml.presentation': {
		extension: 'pptx',
		category: 'document',
	},
	'text/plain': { extension: 'txt', category: 'document' },

	// Other types
	'application/zip': { extension: 'zip', category: 'other' },
	'application/x-rar-compressed': { extension: 'rar', category: 'other' },
	'application/octet-stream': { extension: 'bin', category: 'other' },
};

// Helper function to get the file extension and category based on MIME type
export function getFileExtensionAndCategory(mimeType: string): FileInfo {
	const fileInfo = mimeTypeMap[mimeType];

	if (fileInfo) {
		return { extension: '.' + fileInfo.extension, category: fileInfo.category };
	}

	// Default case when MIME type is not recognized
	return { extension: 'unknown', category: 'other' };
}

export const createS3FileKey = (module:string,userId:string, fileName:string) => {
	const uuid = uuidv4(); // Generate a unique ID for the file
	return `${module}/${userId}/${uuid}${fileName}`; // Construct the S3 key
  };