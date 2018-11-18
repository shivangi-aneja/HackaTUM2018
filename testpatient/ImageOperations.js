const AWS = require('aws-sdk');
const lambda = new AWS.Lambda({apiVersion: '2015-03-31'});

const IMAGE_LAMBDA = 'arn:aws:lambda:eu-west-1:456918724835:function:dr-cloud-image-service';

exports.listImages = async function(pid) {
    const imageList =  JSON.parse((await lambda.invoke({
        FunctionName: IMAGE_LAMBDA,
        Payload: JSON.stringify({
            action: 'list', 
            body: {
                patientId: pid
            }
        })
    }).promise()).Payload)
    console.log('imageList', imageList)
    
    return imageList;
}

exports.getImage = async function(iid) {
    const imageGotten = JSON.parse((await lambda.invoke({
        FunctionName: IMAGE_LAMBDA,
        Payload: JSON.stringify({
            action: 'get',
            body: {
                imageId: iid
            }
        })
    }).promise()).Payload)
    console.log('imageGotten', imageGotten)
    
    return imageGotten;
}
