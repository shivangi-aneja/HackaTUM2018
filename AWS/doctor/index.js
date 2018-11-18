var PatientOperations = require('PatientOperations');
var ImageOperations = require('ImageOperations');

var imageIndex = -1;
var imageList;


async function findPatient(nametosearch) {
    
    var patientList = await PatientOperations.listPatients();
    var index;
    for(index = 0; index < patientList.length; index++) {
        var patient = patientList[index];
        if(patient.familyName.toUpperCase() == nametosearch.toUpperCase() || patient.givenName.toUpperCase() == nametosearch.toUpperCase()) {
            return patient;
        }
    }
    
    return null;
}

function setupBgImage(urlpath, descText) {
    
    return [{
        type: "Display.RenderTemplate",
        template: {
            type: "BodyTemplate1",
            backgroundImage: {
                sources: [
                  {
                    url: urlpath
                  }
                ]
            },
            
            textContent: {
                primaryText: {
                  text: descText,
                  type: "PlainText"
                }
            }
        }
    }];
}


async function getAllPatients() {
    var result = "";
    
     var patientList = await PatientOperations.listPatients();
    var index;
    
    if(patientList.length > 0) {
        var patient = patientList[0];
        result += patient.givenName + " " + patient.familyName;
    }
    for(index = 1; index < patientList.length; index++) {
        var patient = patientList[index];
        result += ", " + patient.givenName + " " + patient.familyName;
    }
    
    return result;
}

function setupText(descText) {
    
    return [{
        type: "Display.RenderTemplate",
        template: {
            type: "BodyTemplate1",
            
            textContent: {
                primaryText: {
                  text: descText,
                  type: "PlainText"
                }
            }
        }
    }];
}


function getUrlofImage(imageStructure) {
    return 'https://s3-eu-west-1.amazonaws.com/' + imageStructure['s3Bucket'] + '/' + imageStructure['s3Key'];
}

function getHealthyText(imageStructure) {
    var healthy = imageStructure['healthy'];
    var unhealthy = imageStructure['unhealthy'];
    
    if(healthy && unhealthy) {
        return 'Healthy ' + healthy + "%   Unhealthy: " + unhealthy + "%";
    } else {
        return "";
    }
}


exports.handler = async (event) => {
    
    var message = "Hello";
    var theDirectives = [];
    
    switch(event.request.type) {
        case "IntentRequest":
            switch(event.request.intent.name) {
                case "call_someone":
                    var nametocall = event.request.intent.slots.nametocall.value;
                    var res = await findPatient(nametocall)
                    if(res == null) {
                        message = nametocall + "is not a patient";
                    } else {
                        message = 'Yes, I know ' + res.givenName + " " + res.familyName;
                        imageList = await ImageOperations.listImages(res.patientId);
                        message += 'I have ' + imageList.length + (imageList.length == 1 ? ' picture' : ' pictures');
                        
                        if(imageList.length > 0) {
                            theDirectives = setupBgImage(getUrlofImage(imageList[0]), getHealthyText(imageList[0]));
                            imageIndex = 0;
                        }
                    }
                    break;
                    
                case "next":
                    message += imageIndex;
                    
                    if(imageIndex >= 0) {
                        if(imageIndex < imageList.length - 1) {
                            theDirectives = setupBgImage(getUrlofImage(imageList[++imageIndex]), getHealthyText(imageList[imageIndex]));
                        }
                        else {
                            message = 'That was everything';
                            imageIndex = -1;
                        }
                    }
                    break;
                    
                    
                case "something_wrong":
                    message = "Ok, your secretary will make an appointment"
                    break;
                    
                case "list_patients":
                    var text = await getAllPatients();
                    theDirectives = setupText(text);
                    break;
            }
            break;
    }
    
    return {
        version: "1.0",
        response: {
            directives: theDirectives,
            outputSpeech: {
                type: "PlainText",
                text: message
            },
            shouldEndSession: false
        }
    };
};
