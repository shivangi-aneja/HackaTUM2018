const IMAGE_TABLE = process.env.IMAGE_TABLE;
const PATIENT_TABLE = process.env.PATIENT_TABLE;
const AWS = require('aws-sdk');
const uuidv1 = require('uuid/v1');
const dynamoDb = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});

exports.handler = async function(s3Event) {
    console.log("EVENT", JSON.stringify(s3Event));

    const rec = s3Event.Records[0];

    if (rec.eventName.startsWith('ObjectCreated')) {
        await onCreated(rec.s3.bucket.name, rec.s3.object.key);
    } else if (rec.eventName.startsWith('ObjectRemoved')) {
        await onDeleted(rec.s3.bucket.name, rec.s3.object.key);
    } else {
        console.warn('Ignoring an unknown event:', rec.eventName);
    }
};


async function onCreated(s3Bucket, s3Key) {
    
    var names = parseS3Key(s3Key);
    console.log(names);
    
    if(names && names.length >= 2) {
        var patId = await getPatientId(names[0], names[1]);
        console.log(patId);
        
        const imageId = uuidv1();
    
        await dynamoDb.put({
            TableName: IMAGE_TABLE,
            Item: { imageId, patientId: patId, s3Key, s3Bucket, fileName: s3Key }
        }).promise();
        
    }
    
    
}
async function onDeleted(s3Bucket, s3Key) {
    
    var names = parseS3Key(s3Key);
    
    if(names && names.length >= 2) {
        var patId = await getPatientId(names[0], names[1]);
        const imageId = await findImageId(patId, s3Key);

        if (!imageId) {
            throw new Error('Cannot found an image for patientId: ' + patId + ' and fileName: ' + s3Key);
        }
        await dynamoDb.delete({
            TableName: IMAGE_TABLE,
            Key: { imageId },
        }).promise();
    }
}

async function getPatientId(firstName, lastName) {
    const res = await dynamoDb.scan({
        TableName: PATIENT_TABLE
    }).promise();
    
    
    if(res.Items && res.Items.length) {
        var i;
        for(i = 0; i < res.Items.length; i++) {
            if(res.Items[i].familyName == lastName && res.Items[i].givenName == firstName) {
                return res.Items[i].patientId;
            }
        }
    }
    
    return null;
}

async function findImageId(patientId, fileName) {
    const res = await dynamoDb.query({
        TableName: IMAGE_TABLE,
        IndexName: 'patientId_idx',
        KeyConditionExpression: 'patientId = :patientId',
        FilterExpression: 'fileName = :fileName',
        ExpressionAttributeValues: {
            ':patientId': patientId,
            ':fileName': fileName
        }
    }).promise();

    return res.Items && res.Items.length ? res.Items[0].imageId : null;
}


function parseS3Key(s3Key) {
    const keyParts = /([^_]+)_([^_]+)/.exec(s3Key);
    if (!keyParts) {
        throw new Error('Cannot process the S3 key: ' + s3Key);
    }
    return [keyParts[1], keyParts[2]];
}