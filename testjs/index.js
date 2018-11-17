const AWS = require('aws-sdk')
const lambda = new AWS.Lambda({apiVersion: '2015-03-31'})


const PATIENT_LAMBDA = "arn:aws:lambda:eu-west-1:456918724835:function:dr-cloud-patient-service";

//import createPatient from 'PatientOperations'
var PatientOperations = require("PatientOperations");
var ImageOperations = require("ImageOperations");



exports.handler = async event => {
    var result = ImageOperations.listImages();
    return result;

};
