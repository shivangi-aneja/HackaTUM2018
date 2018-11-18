const AWS = require('aws-sdk')
const lambda = new AWS.Lambda({apiVersion: '2015-03-31'})

const PATIENT_LAMBDA = "arn:aws:lambda:eu-west-1:456918724835:function:dr-cloud-patient-service"

exports.createPatient = async function(firstName, lastName) {
  
    const patientCreated = JSON.parse((await lambda.invoke({
        FunctionName: PATIENT_LAMBDA,
        Payload: JSON.stringify({
            action: 'create',
            body: {
                givenName: firstName,
                familyName: lastName
            }
        })
    }).promise()).Payload)
    console.log('patientCreated', patientCreated)
    
    return patientCreated;
};


exports.getPatient = async function(patId) {
    const patientGotten = JSON.parse((await lambda.invoke({
        FunctionName: PATIENT_LAMBDA,
        Payload: JSON.stringify({
            action: 'get',
            body: {
                patientId: patId
            }
        })
    }).promise()).Payload)
    console.log('patientGotten', patientGotten)

    return patientGotten;
};


exports.updatePatient = async function(patId, firstName, lastName) {
    const patientUpdated = JSON.parse((await lambda.invoke({
        FunctionName: PATIENT_LAMBDA,
        Payload: JSON.stringify({
            action: 'update',
            body: {
                patientId: patId,
                givenName: firstName,
                familyName: lastName
            }
        })
    }).promise()).Payload)
    console.log('patientUpdated', patientUpdated)
    
    return patientUpdated;
};


exports.listPatients = async function() {
    const patientList =  JSON.parse((await lambda.invoke({
        FunctionName: PATIENT_LAMBDA,
        Payload: JSON.stringify({
            action: 'list'
        })
    }).promise()).Payload)
    console.log('patientList', patientList)
    
    return patientList;
}


exports.deletePatient = async function(patId) {
    const patientDeleted = JSON.parse((await lambda.invoke({
        FunctionName: PATIENT_LAMBDA,
        Payload: JSON.stringify({
            action: 'delete',
            body: {
                patientId: patId
            }
        })
    }).promise()).Payload)
    console.log('patientDeleted', patientDeleted)

    return patientDeleted;
}
