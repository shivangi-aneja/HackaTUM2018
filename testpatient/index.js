var PatientOperations = require('PatientOperations');
var ImageOperations = require('ImageOperations');

var result_temp;
async function findPatient(nametosearch) {

    var patientList = await PatientOperations.listPatients();
    var index;
    for(index = 0; index < patientList.length; index++) {
        var patient = patientList[index];
        if( patient.familyName.toUpperCase() == nametosearch.toUpperCase()) {
            return patient;
        }
    }
    
    return null;
}

exports.handler = async (event) => {
    
    var message = "Hello!";
    if (event.request.type== "IntentRequest")
    {
        if(event.request.intent.name=="PatientPhoto")
        {
            if(process.env.Name=="")
            {
                return {"version" : 1.0,
                response:{
                outputSpeech:{
                type: "PlainText",
                text:"Patient not found "
                },
                shouldEndSession:false
                }
        };
            }
            else
            {
                var imageList = await ImageOperations.listImages(result_temp.patientId);
                message += 'I have ' + imageList.length + ' pictures!';
                return {"version" : 1.0,
                response:{
                outputSpeech:{
                type: "PlainText",
                text:message
                },
                shouldEndSession:false
                }
        };

            }
           
        }
        else if(event.request.intent.name=="Customerauth")
        {
            var customer=event.request.intent.slots.firstname.value;
            var result1= await findPatient(customer);
            if (result1==null)
            {
             return {"version" : 1.0,
                response:{
                outputSpeech:{
                type: "PlainText",
                text:"Patient not found. Please repeat of the form My lastname is. For example My lastname is Serai."
                },
                shouldEndSession:false
                }
        };
            }
            else {
                process.env.Name="fafa";
                result_temp=result1;
                return {"version" : 1.0,
                            response:{
                            outputSpeech:{
                            type: "PlainText",
                            text:"Welcome " + result1.givenName + " " + result1.familyName
                            },
                            shouldEndSession:false
                            }
                    };
            }
            
        }
        else if(event.request.intent.name == "register")
        {
            var fname=event.request.intent.slots.firstname.value;
            if (fname!=null)
            {
            var split=fname.split(" ")
            await PatientOperations.createPatient(split[0],split[1]);
            return {"version" : 1.0,
                    response:{
                    outputSpeech:{
                    type: "PlainText",
                    text:"Thank you. Registered sucessfully. Please use your lastname to login. For example My lastname is Serai."
                    },
                shouldEndSession:false
                }
        };
            }
        
            
        }
        
        


}
 return {
        version: "1.0",
        response: {
            outputSpeech: {
                type: "PlainText",
                text: message
            },
            shouldEndSession: false
        }
    };
        
           
    }
    
    
