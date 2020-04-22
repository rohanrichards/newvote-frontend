// https://cloudinary.com/documentation/image_transformation_reference#quality_parameter

import { FileUploader } from 'ng2-file-upload'

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