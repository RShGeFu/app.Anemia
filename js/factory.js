/**
 * Copyright bei G. Füchsl - 2018
 */

"use strict";

var observationFactory = (function() {
        
    var vs = {
        addValidation: function(observations) {
            console.log("observationFactory: start addValidation - " + typeof observations);
            console.log("------------------------------------------------------------");            
            if (observations) {                
                for(var i = 0; i < observations.length; i++) {

                    if (validationPerLOINC[observations[i].code.coding[0].code]) {
                        var func = validationPerLOINC[observations[i].code.coding[0].code];
                    } else {
                        var func = function() {
                            console.log("observation / other " + this.code.coding[0].code);
                        }
                    }
                    Object.defineProperty(observations[i], 'validate', { value: func } );

                }
            }
            console.log("--------------------------------------- ENDE");                    
        },

        getValidation: function(observations) {
            
            console.log("observationFactory: start getValidation");            
            console.log("---------------------------------------");            
            if (observations) {
                for(var i = 0; i < observations.length; i++) {
                    observations[i].validate();                
                }
            }
            console.log("--------------------------------------- ENDE");            
            
        }
    }

    var validationPerLOINC = {
        '29463-7':  function() {
                        console.log('LOINC 29463-7 direkt hinterlegt');
                        // Schaue nach:
                        // 1. Werte vorhanden?
                        // 2. Referenz-Werte vorhanden?
                        // 3. Bewertung vorhanden?
                        // 4. Ansonsten - bewerten und Observation vervollständigen
                        // 5. Wenn nicht möglich - entsprechend bewerten
                    },
        '718-7':    function() {
                        console.log('LOINC 718-7 direkt hinterlegt');                        
                    },
        'default':  function() {
                        var obs = returnBaseObservationDefinition();
                        console.log('Default direkt hinterlegt ' + JSON.stringify(obs));
                        console.log("--------------------------------------- ENDE");            
                    }              
    }

    var substitutedObservations = {
        
        obs: [],
        
        createByList: function(configList) {
                        if (configList.defaultReference) {
                            console.log("createByList ---------------------------");
                            for(var i of configList.defaultReference) {  
                                var r = returnBaseObservationDefinition(i);
                                substitutedObservations.obs.push(r);
                            }
                            vs.addValidation(substitutedObservations.obs);
                            console.log("createByList -----------------------ENDE")
                        }
                    },

        createByObject: function(configObj) {
                            return returnBaseObservationDefinition(configObj);                            
                    }
    }

    return {
        addValidation: vs.addValidation,
        getValidation: vs.getValidation,
        direktGet: function(loinc) {
                        return validationPerLOINC[loinc];
                    },
        createObservs: substitutedObservations.createByList
    }

})();

function returnBaseObservationDefinition() {    

  var res = {
  "resourceType" : "Observation",
  "meta" : {
      "versionId":"1.0",
      "lastUpdated": new Date().toString(),
      "tag":[
                { 
                    "system":"",
                    "code":"x"
                }
            ]
    },  // from Resource: id, meta, implicitRules, and language
        // from DomainResource: text, contained, extension, and modifierExtension
  
  "identifier" : "appAnem-test", // Business Identifier for observation
        //"basedOn" : [{ Reference(CarePlan|DeviceRequest|ImmunizationRecommendation|MedicationRequest|NutritionOrder|ProcedureRequest|ReferralRequest) }], // Fulfills plan, proposal or order
  
  "status" : "preliminary", // R!  registered | preliminary | final | amended +
  "category" : { 
      "coding":[
          { 
            "system":"http://hl7.org/fhir/observation-category",
            "code":"laboratory"
        }] 
    } , // Classification of  type of observation
  
  "code" : {
      "coding": [
            {
                // from Element: extension
                "system" : "http://loinc.com", // Identity of the terminology system
                "version" : "", // Version of the system - if relevant
                "code" : "", // Symbol in syntax defined by the system
                "display" : "", // Representation defined by the system
                "userSelected" : true // If this coding was chosen directly by the user
            }         // R!  Type of observation (code / type)
        ]
    },
  "subject" : "Test-Patient", //{ Reference(Patient|Group|Device|Location) }, Who and/or what this is about
            //"context" : { Reference(Encounter|EpisodeOfCare) }, // Healthcare event during which this observation is made
            // effective[x]: Clinically relevant time/time-period for observation. One of these 2:
  "effectiveDateTime" : new Date().toString(),
            //"effectivePeriod" : { Period },
            //"issued" : "<instant>", // Date/Time this was made available
  "performer" : {
    // from Element: extension
    "reference" : window.location, // C? Literal reference, Relative, internal or absolute URL
    "identifier" : "Test-Performer", // Logical reference, when literal reference is not known
    "display" : "Performer: " + window.location // Text alternative for the resource
  },        // [{ Reference(Practitioner|Organization|Patient|RelatedPerson) }], // Who is responsible for the observation
  
  "value": [ //[x]: Actual result. One of these 11:

                { "valueQuantity" : { 
                        "value":    0.0,
                        "unit":     "",
                        "system":   "http://unitsofmeasure.org/",
                        "code":     ""
                    } 
                },
  
            //"valueCodeableConcept" : { CodeableConcept },
            //"valueString" : "<string>",
            //"valueBoolean" : <boolean>,
                
                { "valueRange" : {
                    // from Element: extension
                    "low" : { 
                        // from Element: extension
                        "value" : 0.0, // Numerical value (with implicit precision)
                        "comparator" : "<", // < | <= | >= | > - how to understand the value
                        "unit" : "", // Unit representation
                        "system" : "http://unitsofmeasure.org/", // C? System that defines coded unit form
                        "code" : "" // Coded form of the unit
                      }, // C? Low limit
                    "high" :  { 
                        // from Element: extension
                        "value" : 0.0, // Numerical value (with implicit precision)
                        "comparator" : ">", // < | <= | >= | > - how to understand the value
                        "unit" : "", // Unit representation
                        "system" : "http://unitsofmeasure.org/", // C? System that defines coded unit form
                        "code" : "" // Coded form of the unit
                      }
                  }
                },
            
            //"valueRatio" : { Ratio },
            //"valueSampledData" : { SampledData },
            //"valueAttachment" : { Attachment },
            //"valueTime" : "<time>",
            //"valueDateTime" : "<dateTime>",
            //"valuePeriod" : { Period },

    ],
  
  
  //"dataAbsentReason" : { CodeableConcept }, // C? Why the result is missing
  "interpretation" : {
            // from Element: extension
                "coding" : [
                                { 
                                    "code":  "ok"
                                }
                            ], // Code defined by a terminology system
                "text" : "normal" // Plain text representation of the concept
    }, // High, low, normal, etc.

  "comment" : "Test-Observation", // Comments about result
  
  /*
  "bodySite" : { CodeableConcept }, // Observed body part
  "method" : { CodeableConcept }, // How it was done
  "specimen" : { Reference(Specimen) }, // Specimen used for this observation
  "device" : { Reference(Device|DeviceMetric) }, // (Measurement) Device*/

  "referenceRange" : [{ // Provides guide for interpretation
    "low" : {
        // from Element: extension
        "value" : 0.0, // Numerical value (with implicit precision)
        "comparator" : "<", // < | <= | >= | > - how to understand the value
        "unit" : "", // Unit representation
        "system" : "http://unitsofmeasure.org/", // C? System that defines coded unit form
        "code" : "" // Coded form of the unit
      }, // C? Low Range, if relevant
    "high" : {
        // from Element: extension
        "value" : 0.0, // Numerical value (with implicit precision)
        "comparator" : ">", // < | <= | >= | > - how to understand the value
        "unit" : "", // Unit representation
        "system" : "http://unitsofmeasure.org/", // C? System that defines coded unit form
        "code" : "" // Coded form of the unit
      }, // C? High Range, if relevant
    "type" : {  "coding": "",
                "text": "" }, // Reference range qualifier
    "appliesTo" : [{  
                        "coding": "",
                        "text": "" 
                    }], // Reference range population
    "age" : {                     // from Element: extension
        "low" : { 
            // from Element: extension
            "value" : 0.0, // Numerical value (with implicit precision)
            "comparator" : "<", // < | <= | >= | > - how to understand the value
            "unit" : "", // Unit representation
            "system" : "", // C? System that defines coded unit form
            "code" : "" // Coded form of the unit
          }, // C? Low limit
        "high" :  { 
            // from Element: extension
            "value" : 120.0, // Numerical value (with implicit precision)
            "comparator" : ">", // < | <= | >= | > - how to understand the value
            "unit" : "", // Unit representation
            "system" : "", // C? System that defines coded unit form
            "code" : "" // Coded form of the unit
          }
      }, // Applicable age range, if relevant
    "text" : "" // Text based reference range in an observation
  }],

  /*
  "related" : [{ // Resource related to this observation
    "type" : "<code>", // has-member | derived-from | sequel-to | replaces | qualified-by | interfered-by
    "target" : { Reference(Observation|QuestionnaireResponse|Sequence) } // R!  Resource that is related to this one
  }],

  "component" : [{ // Component results
    "code" : { CodeableConcept }, // R!  Type of component observation (code / type)
    // value[x]: Actual component result. One of these 10:
    "valueQuantity" : { Quantity },
    "valueCodeableConcept" : { CodeableConcept },
    "valueString" : "<string>",
    "valueRange" : { Range },
    "valueRatio" : { Ratio },
    "valueSampledData" : { SampledData },
    "valueAttachment" : { Attachment },
    "valueTime" : "<time>",
    "valueDateTime" : "<dateTime>",
    "valuePeriod" : { Period },
    "dataAbsentReason" : { CodeableConcept }, // C? Why the component result is missing
    "interpretation" : { CodeableConcept }, // High, low, normal, etc.
    "referenceRange" : [{ Content as for Observation.referenceRange }] // Provides guide for interpretation of component result
  }]*/
  }

  if (arguments.length > 0) {

    var configObj = arguments[0];    

    if (configObj && configObj.required) {

        res.code.coding[0].code = configObj.loinc;
        res.code.coding[0].display = configObj.name;
        res.value[0].valueQuantity.value = configObj.value;
        res.value[0].valueQuantity.unit = configObj.unit;
        res.value[1].valueRange.low.value = configObj.refMin.male ? configObj.refMin.male : configObj.refMin;
        res.value[1].valueRange.low.unit = configObj.unit;
        res.value[1].valueRange.high.value = configObj.refMax.male ? configObj.refMax.male : configObj.refMax;
        res.value[1].valueRange.high.unit = configObj.unit;
        res.referenceRange[0].low.value = configObj.validMin;
        res.referenceRange[0].low.unit = configObj.unit;
        res.referenceRange[0].high.value = configObj.validMax;
        res.referenceRange[0].high.unit = configObj.unit;
    
    }

  }

  return res;
}