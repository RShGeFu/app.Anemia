/**
 * Copyright bei G. Füchsl - 2018
 */

"use strict";

var observationFactory = (function() {
        
    /**
     * Das Objekt beinhaltet Funktionen um Konfigurations- oder Patienten-Observations in ihrer Funktionalität zu ergänzen
     */
    var vs = {

        // Einhängen einer Validierungsfunktion
        addValidation: function(observations) {

            if (observations) {                
                for(var i = 0; i < observations.length; i++) {

                    if (validationPerLOINC[observations[i].code.coding[0].code]) {
                        var func = validationPerLOINC[observations[i].code.coding[0].code];
                    } else {
                        var func = validationPerLOINC['default'];                        
                    }

                    if (!('validate' in observations[i])) {
                        Object.defineProperty(observations[i], 'validate', { value: func } );
                    }

                }
            }

        },

        // Einhängen einer Visualisierung der Observation
        addVisualisation: function(observations) {

        },
        
        getValidation: function(observations) {
            
            if (observations) {
                for(var i = 0; i < observations.length; i++) {
                    observations[i].validate();                
                }
            }
            
        }

    }

    /**
     * In diesem Objekt sind Validierungsfunktionen für die einzelnen Observations enthalten
     */
    var validationPerLOINC = {
        '29463-7':  function() {
                        // Schaue nach:
                        // 1. Werte vorhanden?
                        // 2. Referenz-Werte vorhanden?
                        // 3. Bewertung vorhanden?
                        // 4. Ansonsten - bewerten und Observation vervollständigen
                        // 5. Wenn nicht möglich - entsprechend bewerten
                    },
        '3141-9':   function() {

                    },
        '8302-2':   function() {

                    },
        '718-7':    function() {
                        
                    },
        '787-2':    function() {

                    },
        '1988-5':   function() {

                    },
        '2276-4':   function() {

                    },
        '30248-9':  function() {

                    },
        '4679-7':   function() {

                    },
        '42810-2':  function() {

                    },
        '20570-8':  function() {

                    },
        '2132-9':   function() {

                    },
        '2284-8':   function() {

                    },
        'default':  function() {
                        
                    }              
    }

    /**
     * In diesem Objekt sind Visualisierungsfunktionen für die einzelnen Observations enthalten
     */
    var visualisationPerLOINC = {
        '29463-7':  function() {
                        // Schaue nach:
                        // 1. Werte vorhanden?
                        // 2. Referenz-Werte vorhanden?
                        // 3. Bewertung vorhanden?
                        // 4. Ansonsten - bewerten und Observation vervollständigen
                        // 5. Wenn nicht möglich - entsprechend bewerten
                    },
        '3141-9':   function() {

                    },
        '8302-2':   function() {

                    },
        '718-7':    function() {
                        
                    },
        '787-2':    function() {

                    },
        '1988-5':   function() {

                    },
        '2276-4':   function() {

                    },
        '30248-9':  function() {

                    },
        '4679-7':   function() {

                    },
        '42810-2':  function() {

                    },
        '20570-8':  function() {

                    },
        '2132-9':   function() {

                    },
        '2284-8':   function() {

                    },
        'default':  function() {
                        
                    }              
    }

    /**
     * Das Objekt stellt die Liste der benötigten Observations für den Entscheidungsprozess zur Verfügung
     * Aus den vorgegebenen Konfigurationswerten werden Observations kreiert, die in eine Liste eingetragen werden
     * Schließlich können einzelne Observations durch Patienten-Observations ersetzt werden und verfügbar gemacht werden
     * So ist immer ein kompletter Satz von Observations für den Entscheidungsprozess vorhanden
     */
    var substitutedObservations = {
        
        obs: [],
        
        // Liste mit Observations aus der Konfiguration kreieren
        createByList: function(configList) {

                        if (configList.defaultReference) {                  // Konfiguration nachschauen                    
                            for(var i of configList.defaultReference) {  
                                var r = returnBaseObservationDefinition(i); // Observation erstellen und abholen
                                substitutedObservations.obs.push(r);        // ... und ab ins Array der benötigten Observations
                            }
                            vs.addValidation(substitutedObservations.obs);                            
                        }

                    },
        
        // Liste der Observations zur Verfügung stellen
        getList:    function() {
                        return substitutedObservations.obs;
                    },

        // Konfigurations-Observation gegen Patienten-Observation austauschen und zwar immer die neuester Patientenobservation einfügen
        replaceSubsitutedObservationByPatientValues: function(observation) {
                        var pos, d1, d2, ddiff;

                        if (substitutedObservations.obs) {
                            pos = substitutedObservations.obs.findIndex(j => j.code.coding[0].code === observation.code.coding[0].code); // Wo steht die Observation mit entsprechenden LOINC                           
                            if(pos > -1) {
                                
                                d1 = new Date(substitutedObservations.obs[pos].effectiveDateTime === 'undefined' ? substitutedObservations.obs[pos].meta.lastUpdated : substitutedObservations.obs[pos].effectiveDateTime),
                                d2 = new Date(observation.effectiveDateTime === 'undefined' ? observation.meta.lastUpdated : observation.effectiveDateTime);
                                ddiff = d1.valueOf() - d2.valueOf();
                                
                                if (substitutedObservations.obs[pos].identifier === "appAnem-test" || ddiff < 0) {  // Ersetze die eingeschriebene Observation, wenn...
                                    substitutedObservations.obs[pos] = observation;
                                }

                            }
                        }

                    },

        // Liste von Patientenobservations verarbeiten
        replaceSubstitutedObservationByPatientValueList: function(observations) {

                        if (observations.length > 0) {
                            for(var i = 0; i < observations.length; i++) {
                                substitutedObservations.replaceSubsitutedObservationByPatientValues(observations[i]);
                            }
                        }

                    }

    }

    // Stelle folgenden Funktionen zur Verfügung
    return {
        addValidation:      vs.addValidation,
        getValidation:      vs.getValidation,
        createObservs:      substitutedObservations.createByList,
        replaceSubstObservs:substitutedObservations.replaceSubstitutedObservationByPatientValueList,
        getObservs:         substitutedObservations.getList
    }

})();

/**
 * Stelle eine Observation zusammen ...
 */
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

  // Wenn ein Konfigurationsobjekt übergeben wurde, dann weise die Werte zur
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

var cardFactory = (function() {

})();