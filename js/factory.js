/**
 * Copyright bei G. Füchsl - 2018
 */

"use strict";

var observationFactory = (function() {
        
    /**
     * Das Objekt beinhaltet Funktionen um Konfigurations- oder Patienten-Observations in ihrer Funktionalität zu ergänzen
     */
    var vs = {

        patient:        "",

        // Merke Dir den geladenen Patienten
        setPatient:     function(p) {
                            vs.patient = p;
                        },

        // Stelle den geladenen Patienten zur Verfügung
        getPatient:     function() {
                            return vs.patient;
                        },

        // Einhängen einer Validierungsfunktion
        addValidation: function(observations) {

            // Wenn Observations gefunden wurden ...
            if (observations) {                

                // Gehe die Liste durch ...
                for(var i = 0; i < observations.length; i++) {
                    
                    // ... und hole die beötigte Validierungsfunktion je nach LOINC-Code ...
                    if (validationPerLOINC[observations[i].code.coding[0].code]) {
                        var func = validationPerLOINC[observations[i].code.coding[0].code];
                    } else {
                        var func = validationPerLOINC['default'];                        
                    }

                    // und erstelle eine Property mit dieser Funktion
                    if (!('validate' in observations[i])) {
                        Object.defineProperty(observations[i], 'validate', { value: func() } );
                    }

                }
            }

        },

        // Einhängen einer Visualisierung der Observation
        addVisualisation: function(observations) {

            var ident = "";

            // Wenn Observations gefunden wurden
            if (observations) {
                for(var i = 0; i < observations.length; i++) {

                    // Wenn eine ID vorhanden ist ...
                    if ('id' in observations[i]) {
                        ident = observations[i].id;
                    } else {
                        ident = "";
                    }                    

                    // ... hole die entsprechende HTML-Visualisierung
                    if (ident === "appAnem-test") {
                        var func = visualisationPerIdentifier['config'];
                    } else if (ident != "") {
                        var func = visualisationPerIdentifier['patient'];
                    } else {
                        var func = visualisationPerIdentifier['default'];
                    }

                    // ... und erstelle eine Property dazu
                    if (!('asHTMLTableRow' in observations[i])) {
                        Object.defineProperty(observations[i], 'asHTMLTableRow', { value: func } );
                    }

                }
            }

        },

        /**
         * Einhängen einer Hilfsfunktion - liefert einen 'verkürzten' Datensatz für das Decision-Modul
         * Im Prinzip wäre die direkte Übergabe der Observation an den Entscheidungsalgorithmus möglich - dieser müsste die
         * Observation 'verstehen' */        
        addFetchingDecisionCriteria: function(observations) {

            // Wenn Observations vorhanden sind ...
            if (observations) {
        
                // ... hänge in jede Observation eine Funktion, die einen minimalen Umfang an Werten aus der Observation liefert 
                // (s. Testdatensatz unter data.js!!)
                for(var i = 0; i < observations.length; i++) {

                    var func = function() {
                        return {
                            loinc:  this.code.coding[0].code,
                            id:     this.code.coding[0].display,
                            value:  'valueQuantity' in this ? this.valueQuantity.value : this.value[0].valueQuantity.value
                        }
                    }

                    if (!('fetchDecisionCriterion' in observations[i])) {
                        Object.defineProperty(observations[i], 'fetchDecisionCriterion', { value: func } );
                    }
                }            
            
            }
        },
        
        // Validierung der Observation-Liste durchführen 
        doValidation: function(observations) {
            
            if (observations) {
                for(var i = 0; i < observations.length; i++) {
                    observations[i].validate();                
                }
            }
            
        }

    }

    /**
     * In diesem Objekt sind Validierungsfunktionen für die einzelnen Observations enthalten
     * Aktuell ist im Prinzip eine Funktion zur Validierung der einzelnen Labor-Observations hinterlegt, es könnten auf
     * die angelegte Art jedoch für die unterschiedlichen Observations auch unterschiedliche Validierungen 
     * durchgeführt werden
     */
    var validationPerLOINC = {
        // Gewicht und Größe - Hier ist noch nichts hinterlegt
        '29463-7':  function() { return function() { }; },
        '3141-9':   function() { return function() { }; },
        '8302-2':   function() { return function() { }; },

        // Laborwerte
        '718-7':    function() { return validateLab; },
        '787-2':    function() { return validateLab; },
        '1988-5':   function() { return validateLab; },
        '2276-4':   function() { return validateLab; },
        '30248-9':  function() { return validateLab; },
        '4679-7':   function() { return validateLab; },
        '42810-2':  function() { return validateLab; },
        '20570-8':  function() { return validateLab; },
        '2132-9':   function() { return validateLab; },
        '2284-8':   function() { return validateLab; },

        // Alles andere ...
        'default':  function() { return function() { }; }              
    }

    function validateLab() {

        // In der Konfiguration den zur Observation passenden Wert heraussuchen - Hier wäre ein Mapping für semantisch gleiche LOINCs denkbar ...
        var pos = configuration.defaultReference.findIndex(j => j.loinc === this.code.coding[0].code);

        // Liegt ein Validitätsbereich vor? Wenn nicht, dann einführen und mit Werten aus der Konfiguration befüllen...
        if (!('validRange' in this)) {
            Object.defineProperties(this, {
                "validRange" : { value: [{ // Provides guide for interpretation
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
                    }]
                }
            });            
            this.validRange[0].low.value = configuration.defaultReference[pos].validMin;
            this.validRange[0].low.unit = configuration.defaultReference[pos].unit;
            this.validRange[0].high.value = configuration.defaultReference[pos].validMax;
            this.validRange[0].high.unit = configuration.defaultReference[pos].unit;                    
        }
        
        // Liegt ein Referenzbereich vor? Wenn nicht, dann einführen und mit Werten aus der Konfiguration befüllen...
        if (!'referenceRange' in this) {
            Object.defineProperties(this, {
                "referenceRange" : { value: [{ // Provides guide for interpretation
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
                    }]
                }
            });            
            this.referenceRange[0].low.value = configuration.defaultReference[pos].refMin;
            this.referenceRange[0].low.unit = configuration.defaultReference[pos].unit;
            this.referenceRange[0].high.value = configuration.defaultReference[pos].refMax;
            this.referenceRange[0].high.unit = configuration.defaultReference[pos].unit;                    
        }
        
        // Liegt eine Bedeutung für den Referenzbereich vor?
        if (!('meaning' in this.referenceRange)) {
            Object.defineProperties(this.referenceRange, {
                    "meaning": { value: { 
                                        coding: [ { code: "normal",
                                                    display: "Normal Range",
                                                    system: "http://hl7.org/fhir/referencerange-meaning"
                                                } ],
                                        text: "" 
                                    }
                                }
            });
        }

        // Liegt eine Interpretation vor? Wenn nein, dann führe sie ein und interpretiere die vorliegende Observation ...
        if (!('interpretation' in this)) {
            Object.defineProperties(this, {
                    "interpretation" : { value : {
                        "coding" : [{ 
                                        "code":  ""
                                    }],
                        "text" : ""                                    
                        }
                    }
                });
            }
                                
        // In welcher Struktur der Observation liegt der Wert der Observation vor?
        var val = !this.value ? this.valueQuantity.value : this.value[0].valueQuantity.value;
                        
        // Bewerte nun ....
        if (val) {
            if (val < this.referenceRange[0].low.value) {
                this.interpretation.coding[0].code = 'low';
                this.interpretation.text = 'low / under normal range';
            } else if (val < this.validRange[0].low.value) {
                this.interpretation.coding[0].code = 'nvl';
                this.interpretation.text = 'not valid / under valid range';
            } else if (val > this.referenceRange[0].high.value) {
                this.interpretation.coding[0].code = 'high';
                this.interpretation.text = 'high / above normal range';
            } else if (val > this.validRange[0].high.value) {
                this.interpretation.coding[0].code = 'nvh';
                this.interpretation.text = 'not valid / above valid range';
            } else {
                this.interpretation.coding[0].code = 'ok';
                this.interpretation.text = 'in normal range';
            }
        } else {
            this.interpretation.coding[0].code = 'nvn';
            this.interpretation.text = 'not valid / no value';                            
        } 

    }

    /**
     * In diesem Objekt sind Visualisierungsfunktionen für die einzelnen Observations enthalten, je nachdem, ob sie vom 
     * Patienten stammen oder aus der Konfigurationsvorgabe
     */
    var visualisationPerIdentifier = {
        patient:    function() {
                
                        var bdColor;
                        if (this.interpretation.coding[0].code.substring(0, 2) === 'nv') {
                            bdColor = 'badge-info';
                        } else if (this.interpretation.coding[0].code === 'ok') {
                            bdColor = 'badge-success';
                        } else {
                            bdColor = 'badge-danger';
                        }
                
                        var htmlStr = "<tr><th scope=\"row\">" + this.code.coding[0].display + "</th>";
                        //htmlStr += "<td>" + this.code.coding[0].display + "</td>";
                        htmlStr += "<td><span class=\"badge " + bdColor + "\">" + this.interpretation.coding[0].code + "</span></td>";
                        if ('value' in this) {
                            htmlStr += "<td>" + this.value[0].valueQuantity.value + "</td>";
                            htmlStr += "<td>" + this.value[0].valueQuantity.unit + "</td>";
                        } else {
                            htmlStr += "<td>" + this.valueQuantity.value + "</td>";
                            htmlStr += "<td>" + this.valueQuantity.unit + "</td>";                            
                        }
                        htmlStr += "<td>" + this.referenceRange[0].low.value + "</td>";
                        htmlStr += "<td>-</td>";
                        htmlStr += "<td>" + this.referenceRange[0].high.value + "</td>";
                        htmlStr += "</tr>";
                        
                        return htmlStr;
                    },
        config:     function() { 
                
                        var bdColor;
                        if (this.interpretation.coding[0].code.substring(0, 2) === 'nv') {
                            bdColor = 'badge-warning';
                        } else if (this.interpretation.coding[0].code === 'ok') {
                            bdColor = 'badge-success';
                        } else {
                            bdColor = 'badge-danger';
                        }
    
                        var htmlStr = "<tr><small><th scope=\"row\">" + this.code.coding[0].display + "</th></small>";
                        //htmlStr += "<td>" + this.code.coding[0].display + "</td>";
                        htmlStr += "<td><small><span class=\"badge " + bdColor +  "\">" + this.interpretation.coding[0].code + "</span></small></td>";
                        htmlStr += "<td><small><input id=\"" + this.code.coding[0].code + "\" class=\"ds_values_gf2\" size=\"2\" type=\"text\" value=\"0\"></input></small></td>";                        
                        if ('value' in this) {
                            htmlStr += "<td><small>" + this.value[0].valueQuantity.unit + "</small></td>";
                        } else {
                            htmlStr += "<td><small>" + this.valueQuantity.unit + "</small></td>";                            
                        }
                        htmlStr += "<td><small>" + this.referenceRange[0].low.value + "</small></td>";
                        htmlStr += "<td>-</td>";
                        htmlStr += "<td><small>" + this.referenceRange[0].high.value + "</small></td>";
                        htmlStr += "</tr>";
                        
                        return htmlStr;
                    },
        default:    function() { 
                        var htmlStr = "<tr><th scope=\"row\"></th>";
                        htmlStr += "<td>no Value</td>";
                        htmlStr += "</tr>";
                        return htmlStr; 
                    }              
    }

    /**
     * Das Objekt stellt die Liste der benötigten Observations für den Entscheidungsprozess zur Verfügung
     * Aus den vorgegebenen Konfigurationswerten werden Observations kreiert, die in eine Liste eingetragen werden
     * Schließlich können einzelne Observations durch Patienten-Observations ersetzt werden und verfügbar gemacht werden
     * So ist immer ein kompletter Satz von Observations für den Entscheidungsprozess vorhanden
     */
    var substitutedObservations = {
        
        // Arrays für native Observations und bearbeitete Observations
        obs: [],
        obsForDecision: [],

        // Grundstruktur des Datasets für die Funktionsrückgabe festlegen
        // s. Testdatensatz data.js
        datasetForDecision: {         
            type: "key-val-ref",
            id:   "labor",
            name: "Labor",
            lang: "en",
            kval: [],
            gender: "female"
        },
        
        // Liste mit Observations aus der Konfiguration kreieren
        createByList: function(configList) {

                        if (configList.defaultReference) {                  // Konfiguration nachschauen                                                
                            for(var i of configList.defaultReference) {                                  
                                var r = returnBaseObservationDefinition(i, vs.getPatient().gender); // Observation erstellen und abholen
                                substitutedObservations.obs.push(r);        // ... und ab ins Array der benötigten Observations
                            }
                            vs.addValidation(substitutedObservations.obs);
                            vs.addVisualisation(substitutedObservations.obs);                            
                        }

                    },
        
        // Liste der Observations zur Verfügung stellen
        getList:    function() {
                        return substitutedObservations.obs;
                    },

        // Stellt die Kriterien für den Entscheidungsalgorithmus zusammen
        createCriteriaForDecision: function(config, pat) {
                        
                        if (substitutedObservations.obs) {
                            for(var i = 0; i < substitutedObservations.obs.length; i++) {
                                if ('fetchDecisionCriterion' in substitutedObservations.obs[i]) {
                                    substitutedObservations.obsForDecision.push(substitutedObservations.obs[i].fetchDecisionCriterion());
                                }
                            }
                            for(var i = 0; i < substitutedObservations.obsForDecision.length; i++) {
                                var pos = config.defaultReference.findIndex(j => j.loinc == substitutedObservations.obsForDecision[i].loinc);
                                substitutedObservations.obsForDecision[i].id = config.defaultReference[pos].id;
                            }
                            substitutedObservations.datasetForDecision.kval = substitutedObservations.obsForDecision;
                            substitutedObservations.datasetForDecision.gender = pat.gender ? pat.gender : 'female';
                        }
            
                    },

        // Veröffentlicht die Liste der Entscheidungskriterien
        getCriteriaForDecision: function() {
                        return substitutedObservations.datasetForDecision;
                    },

        // Konfigurations-Observation gegen Patienten-Observation austauschen und zwar immer die neueste Patientenobservation einfügen
        replaceSubsitutedObservationByPatientValues: function(observation) {
                        var pos, d1, d2, ddiff;

                        if (substitutedObservations.obs) {
                            pos = substitutedObservations.obs.findIndex(j => j.code.coding[0].code === observation.code.coding[0].code); // Wo steht die Observation mit entsprechenden LOINC                           
                            if(pos > -1) {
                                
                                // Datum berücksichtigen
                                d1 = new Date(substitutedObservations.obs[pos].effectiveDateTime === 'undefined' ? substitutedObservations.obs[pos].meta.lastUpdated : substitutedObservations.obs[pos].effectiveDateTime),
                                d2 = new Date(observation.effectiveDateTime === 'undefined' ? observation.meta.lastUpdated : observation.effectiveDateTime);
                                ddiff = d1.valueOf() - d2.valueOf();
                                
                                // Austauschen...
                                if (substitutedObservations.obs[pos].id === "appAnem-test" || ddiff < 0) {  // Ersetze die eingeschriebene Observation, wenn...
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

    /** 
     * Initialisierung der Factory mit der Liste von Observations, Patientendaten und der Konfigurationsinformationen
     * Hierbei Anfügen von Validierung und Visualisierung, Zusammenstellen der Wertereihe für den Entscheidungsprozess
     * aus der Konfiguration heraus. Einfügen der Patienten-Observations in die Wertereihe.
     */
    var init = function(obsList, pat, config) {
        vs.setPatient(pat);                                                                 // Patienten merken
        vs.addValidation(obsList);                                                          // Validierungsfunktion an die Observation knüpfen
        vs.addVisualisation(obsList);                                                       // Visualisierungsfunktion an die Observation knüpfen
        substitutedObservations.createByList(config);                                       // Satz an entscheidungsnotwendigen Observations erstellen
        substitutedObservations.replaceSubstitutedObservationByPatientValueList(obsList);   // Neueste Patienten-Observations einfügen
        vs.doValidation(substitutedObservations.getList());                                 // Validierung des zusammengestellen Satzes an Observations durchführen
        vs.addFetchingDecisionCriteria(substitutedObservations.getList());                  // Datenextraktionsfunktions für originären 
                                                                                            // Entscheidungsalgorithmus an die Observation knüpfen
        substitutedObservations.createCriteriaForDecision(config, pat);                     // Datensatz für den originären Entscheidungsalgorithmus erstellen
    }

    /**
     * Stelle folgenden Funktionen zur Verfügung
     * Initialiserung und Ergebnis
     */
    return {
        init:                           init,
        resultNativeDataset:            substitutedObservations.getCriteriaForDecision, // Datensatz für den originären Entscheidungsalgorithmus liefern
        resultProcessedObservations:    substitutedObservations.getList                 // Bearbeitete Observations liefern
    }

})();

/**
 * Stelle eine Observation zusammen ...
 * s. Definition auf https://www.hl7.org/fhir/ bzw. https://www.hl7.org/fhir/observation.html
 */
function returnBaseObservationDefinition() {    

  var res = {
  "resourceType" : "Observation",
  "id" : "appAnem-test", // Business Identifier for observation
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

  "validRange" : [{ // Provides guide for interpretation
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

  // Wenn ein Konfigurationsobjekt übergeben wurde und benötigt wird, dann weise die Werte zur
  if (arguments.length > 0) {

    var configObj = arguments[0], gender = arguments[1] ? arguments[1] : 'male';

    if (configObj && configObj.required) {

        res.code.coding[0].code = configObj.loinc;
        res.code.coding[0].display = configObj.name;
        
        res.value[0].valueQuantity.value = configObj.value;
        res.value[0].valueQuantity.unit = configObj.unit;

        res.value[1].valueRange.low.value = configObj.refMin[gender] ? configObj.refMin[gender] : configObj.refMin;
        res.value[1].valueRange.low.unit = configObj.unit;
        res.value[1].valueRange.high.value = configObj.refMax[gender] ? configObj.refMax[gender] : configObj.refMax;
        res.value[1].valueRange.high.unit = configObj.unit;

        res.referenceRange[0].low.value = configObj.refMin[gender] ? configObj.refMin[gender] : configObj.refMin;
        res.referenceRange[0].low.unit = configObj.unit;
        res.referenceRange[0].high.value = configObj.refMax[gender] ? configObj.refMax[gender] : configObj.refMax;
        res.referenceRange[0].high.unit = configObj.unit;

        res.validRange[0].low.value = configObj.validMin;
        res.validRange[0].low.unit = configObj.unit;
        res.validRange[0].high.value = configObj.validMax;
        res.validRange[0].high.unit = configObj.unit;
    
    }

  }

  return res;
}

/**
 * Closure für die Erstellung einer Patientenkarte mit oder ohne einer Tabelle
 * Liefert eine Funktion, die die Karte nach vorgegebenen Parametern erstelle
 */
var cardFactory = (function() {

    return function() {

        var htmlString = "", 
            bgColor = "#111111",
            title = "Card",
            withTable = false,
            params;        

        function initCard(parameters) {
        
            var htmlTableString = "", title = "";
            
            if (typeof parameters === 'string') {
                
                htmlTableString = parameters;
                title           = "Card";
                bgColor         = "#ffffff";
                withTable       = false;

            } else if (typeof parameters === 'object') {

                params = parameters.content;    
                
                for(var i = 0; i < parameters.content.length; i++) {
                    if ('asHTMLTableRow' in parameters.content[i]) {
                        htmlTableString += parameters.content[i].asHTMLTableRow();    
                    }
                }                
                
                title           = parameters.title ? parameters.title : 'Card';
                bgColor         = parameters.background ? parameters.background : '#112233';
                withTable       = true;                
            }
        
            htmlString  = "<div id=\"labfactory-card\ class=\"card factory\">";
            htmlString += "<div class=\"card-body\"><h4 class=\"card-title\"><span id=\"fact" + title + "\">" + title + "<span></h4>";
            htmlString += withTable ? "<table class=\"table table-hover table-sm\"><tbody>" : "";
            htmlString += htmlTableString; 
            htmlString += withTable ? "</tbody></table>" : "";
            htmlString += "</div></div>";
        }

        function reactToUser() {            
            var pos = params.findIndex(j => j.code.coding[0].code === this.id);
            alert(JSON.stringify(params[pos]));
            $(this).css({
                "background-color": "#ffbfbf",
                "transition": "0.5s all ease-in-out"
            });        
        }

        function displayCard(destination) {
                        
            $(destination).fadeOut(500, function() {
                $(destination).css("display", "none");
                $(destination).html(htmlString);
                $(destination).css("background", bgColor);
                $(destination).fadeIn(500);
                $(".ds_values_gf2").change(reactToUser);                
            });
        
        }

        return {
            init:       initCard,        
            display:    displayCard
        }

    }   

})();