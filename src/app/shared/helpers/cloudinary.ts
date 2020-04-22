// https://cloudinary.com/documentation/image_transformation_reference#quality_parameter

import { FileUploader, FileUploaderOptions, FileItem } from 'ng2-file-upload'

function blurImage() {
    const param = 'e_blur:'
    return param + 3000
}

function insertQualityParams(quality: string) {

    const param = 'q_auto'
    const qualityOptions = ['best', 'good', 'evo', 'low', 'jpegmini']
    let newUrlString

    if (!qualityOptions.includes(quality)) {
        newUrlString = param
        return newUrlString
    }

    newUrlString = param + ':' + quality
    return newUrlString
}

// https://cloudinary.com/documentation/image_transformation_reference#width_parameter
function insertDimensionParams(dimensions: any) {
    const param = 'w_'
    // const height = 'h_';

    if (typeof dimensions !== 'object') {
        return param + 'auto'
    }

    return param + 'auto'
}

// EXAMPLE URL 'https://res.cloudinary.com/newvote/image/upload/v1557485661/yq3owxqczybbtjpuoaep.png';

function createUrl(url: string, quality: string, dimensions: any, blur?: any) {
    const removeHttps = url.slice().replace(/(^\w+:|^)\/\//, '')
    const splitUrl = removeHttps.split('/')

    const paramsArray = []

    paramsArray.push(insertQualityParams(quality))
    paramsArray.push(insertDimensionParams(dimensions))
    
    if (blur) {
        paramsArray.push(blurImage())
    }

    splitUrl[4] = paramsArray.join(',')
    return `https://${splitUrl.join('/')}`
}

export function optimizeImage(url: string, isLowQuality?: boolean, child?: boolean, blur?: boolean) {
    if (!url) {
        return ''
    }

    // For child cards we remove the image
    if (url.includes('assets')) {

        if (child) {
            return ''
        }

        return url
    }

    if (isLowQuality) {
        return createUrl(url, 'low', 'auto', blur)
    }

    return createUrl(url, 'auto', 'auto', blur)
}

// set up the file uploader
const uploaderOptions: FileUploaderOptions = {
    url: 'https://api.cloudinary.com/v1_1/newvote/upload',
    // Upload files automatically upon addition to upload queue
    autoUpload: false,
    // Use xhrTransport in favor of iframeTransport
    isHTML5: true,
    // Calculate progress independently for each uploaded file
    removeAfterUpload: true,
    // XHR request headers
    headers: [
        {
            name: 'X-Requested-With',
            value: 'XMLHttpRequest'
        }
    ]
}

const buildItemForm = (fileItem: any, form: FormData): any => {
    // Add Cloudinary's unsigned upload preset to the upload form
    form.append('upload_preset', 'qhf7z3qa')
    // Add file to upload
    form.append('file', fileItem)

    // Use default "withCredentials" value for CORS requests
    fileItem.withCredentials = false
    return { fileItem, form }
}

export const cloudinaryUploader = () => {
    const uploader = new FileUploader(uploaderOptions)
    uploader.onAfterAddingFile = (fileItem: FileItem) => {
        if (uploader.queue.length > 1) {
            uploader.removeFromQueue(uploader.queue[0])
        }
    }
    uploader.onBuildItemForm = buildItemForm
    return uploader
}
