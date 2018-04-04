/**
 * Copyright bei G. Füchsl - 2018
 */

"use strict";

var observationFactory = (function() {
        
    /**
     * Das Objekt beinhaltet Funktionen um Konfigurations- oder Patienten-Observations in ihrer Funktionalität zu ergänzen
     */
    var vs = {
        
        patient:        "",             // Patientendaten (als Observation)
        clName:         "inpReact",     // Name des Class-Selectors für die Reaktion auf Usereingaben (für das Inputfeld gedacht)

        // Merke Dir den Klassennamen für die Reaktion auf Usereingaben
        setClassName:   function(cn) {
                            vs.clName = cn;
                        },

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

                    // ... hole die entsprechende HTML-Visualisierung und der Reaktion auf User-Eingabe
                    if (ident === "appAnem-test") {
                        var func = visualisationPerIdentifier['config'],
                            func2 = writeAndValidatePerIdentifer['config'],
                            prop = vs['clName'];                            
                    } else if (ident != "") {
                        var func = visualisationPerIdentifier['patient'],
                            func2 = writeAndValidatePerIdentifer['patient'],
                            prop = 'patient';
                    } else {
                        var func = visualisationPerIdentifier['default'],
                            func2 = writeAndValidatePerIdentifer['default'],
                            prop = 'default';
                    }

                    // ... und erstelle drei Property dazu (Visualisierung und die Reaktion auf Usereingaben)
                    if (!('asHTMLTableRow' in observations[i])) {
                        Object.defineProperty(observations[i], 'asHTMLTableRow', { value: func } );
                    }
                    
                    if (!('writeValueAndValidate' in observations[i])) {
                        Object.defineProperty(observations[i], 'writeValueAndValidate', { value: func2 } );
                    }

                    if (!('onChange' in observations[i])) {
                        Object.defineProperty(observations[i], 'onChange', { value: prop } );
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
                            value:  Number('valueQuantity' in this ? this.valueQuantity.value : this.value[0].valueQuantity.value)
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

    // Validierungsfunktion für eine Laborobservation
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
            if (val < this.validRange[0].low.value) {
                this.interpretation.coding[0].code = 'nvl';
                this.interpretation.text = 'not valid / under valid range';
            } else if (val < this.referenceRange[0].low.value) {
                this.interpretation.coding[0].code = 'low';
                this.interpretation.text = 'low / under normal range';
            } else if (val > this.validRange[0].high.value) {
                this.interpretation.coding[0].code = 'nvh';
                this.interpretation.text = 'not valid / above valid range';
            } else if (val > this.referenceRange[0].high.value) {
                this.interpretation.coding[0].code = 'high';
                this.interpretation.text = 'high / above normal range';
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
        // Kommt die Observation vom Patienten, zeige sie ohne Veränderungsmöglichkeit an       
        patient:    function() {
                
                        // Die Farbkodierung der Interpretation
                        var bdColor;                        
                        if (this.interpretation.coding[0].code.substring(0, 2) === 'nv') {
                            bdColor = 'badge-info';                            
                            if (this.interpretation.coding[0].code.substring(0, 3) != 'nvn') {
                                bdColor = 'badge-info';
                            }
                        } else if (this.interpretation.coding[0].code === 'ok') {
                            bdColor = 'badge-success';
                        } else {
                            bdColor = 'badge-danger';
                        }

                        // Die Tabellenform/Spalten der einzelnen Werte erzeugen
                        var htmlStr = "<tr><th scope=\"row\">" + this.code.coding[0].display + "</th>";                        
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
                        
                        // Gib diesen zusammengesetzten HTML-String zurück
                        return htmlStr;
                    },

        // Ist die Observation generiert, dann gib ihr die Möglichkeit zur Usereingabe...
        config:     function() { 
                
                        // Die Farbkodierung der Interpretation
                        var bdColor;                        
                        if (this.interpretation.coding[0].code.substring(0, 2) === 'nv') {
                            bdColor = 'badge-dark';
                            if (this.interpretation.coding[0].code.substring(0, 3) != 'nvn') {
                                bdColor = 'badge-info';
                            }
                        } else if (this.interpretation.coding[0].code === 'ok') {
                            bdColor = 'badge-success';
                        } else {
                            bdColor = 'badge-danger';
                        }
                    
                        // Hole den aktuellen Wert der Observation
                        var getValue;
                        if ('value' in this) {
                            getValue = this.value[0].valueQuantity.value;
                        } else {
                            getValue = this.valueQuantity.value;
                        }
                        getValue = getValue == null || getValue == 'undefined' ? 0 : getValue;

                        // War die Observation in ihrem Wert schon mal verändert?
                        var changeColor = '#ffffff';
                        if ('alreadyChanged' in this) {
                            changeColor = this['alreadyChanged'];
                        }

                        // Setze den HTML-String in Tabellenform ...
                        var htmlStr = "<tr><small><th scope=\"row\">" + this.code.coding[0].display + "</th></small>";                        
                        htmlStr += "<td><small><span id=\"" + this.onChange + "_badge_" + this.code.coding[0].code + "\" class=\"badge " + bdColor +  "\">" + this.interpretation.coding[0].code + "</span></small></td>";
                        
                        // ... mit einem Inputfeld mit dem aktuellen Wert der Observation zusammen ...
                        htmlStr += "<td><small><input id=\"" + this.code.coding[0].code + "\" class=\"" + this.onChange + "\" size=\"2\" type=\"text\" value=\"" + getValue + "\" style=\"background: " + changeColor + ";\"></input></small></td>";                        
                        if ('value' in this) {
                            htmlStr += "<td><small>" + this.value[0].valueQuantity.unit + "</small></td>";
                        } else {
                            htmlStr += "<td><small>" + this.valueQuantity.unit + "</small></td>";                            
                        }
                        htmlStr += "<td><small>" + this.referenceRange[0].low.value + "</small></td>";
                        htmlStr += "<td>-</td>";
                        htmlStr += "<td><small>" + this.referenceRange[0].high.value + "</small></td>";
                        htmlStr += "</tr>";
                        
                        // Gib den zusammengesetzten HTML-String zurück
                        return htmlStr;
                    },
        
        // Mache einen Default-String für einen nicht vorhersehbaren Ausnahmefall
        default:    function() { 
                        var htmlStr = "<tr><th scope=\"row\">NO</th>";
                        htmlStr += "<td>Value</td>";
                        htmlStr += "</tr>";
                        return htmlStr; 
                    }              
    }
    
    /**
     * In diesem Objekt ist hinterlegt, ob und wie eine Observation verändert werden kann (wenn ein User etwas eingegeben hat)
     */
    var writeAndValidatePerIdentifer = {        
        // Kommt die Observation vom Patienten -> keine Änderungsmöglichkeiten
        patient:    function(v) {

                    },
        // Ist es einer aus der Konfiguration heraus generierte Observation, dann ist sie änderbar
        config:     function(v, c) { 
                        if ('value' in this) {
                            this.value[0].valueQuantity.value = v;
                        } else {
                            this.valueQuantity.value = v;
                        }
                        this.validate();
                        if (!('alreadyChanged' in this)) {
                            Object.defineProperty(this, 'alreadyChanged', { value: c } );
                        }
                    
                    },
        // Eine Reaktionsmöglichkeit für einen unvorhergesehene Fall -> keine Änderungsmöglichkeit (damit es zu keinem Programmabbruch kommt, 
        // wenn die Funktion aufgerufen wird )
        default:    function(v) {

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

        // Grundstruktur des Datasets für die Funktionsrückgabe festlegen
        // s. Testdatensatz data.js
        datasetForDecision: getDataSetBasis(),
        
        // Liste mit Observations aus der Konfiguration kreieren
        createByList: function(configList) {

                        if (configList.defaultReference) {                  // Konfiguration nachschauen - gibt es sie? (Sicherheitshalber wegen Programmstabilität)
                            
                            substitutedObservations.obs = [];               // Das Feld initialisieren (sonst wird beim erneuten Aufruf die Liste zu lange)
                            
                            for(var i of configList.defaultReference) {                               
                                var r = returnBaseObservationDefinition(i, vs ? vs.getPatient().gender : 'female'); // Observation erstellen und abholen ...
                                substitutedObservations.obs.push(r);                                                // ... und ab ins Array der benötigten Observations
                            }

                            vs.addValidation(substitutedObservations.obs);      // Hänge die Validierungsfunktion an
                            vs.addVisualisation(substitutedObservations.obs);   // Hänge die Visualisierungsfunktion an
                        }

                    },
        
        // Liste der Observations zur Verfügung stellen
        getList:    function() {
                        return substitutedObservations.obs;
                    },

        // Die Kriterien für den Entscheidungsalgorithmus zusammenstellen - wird benötigt, um den nativen Entscheidungsalgorithmus bedienen zu können
        createCriteriaForDecision: function(config, pat) {
                        
                        if (substitutedObservations.obs) {                          // Gibt des das Array? Sicherheitshalber wegen Programmstabilität
                            
                            substitutedObservations.datasetForDecision.kval = [];   // Das Feld initialisieren (sonst wird beim erneuten Aufruf die Liste zu lange)
                            
                            // Aus der Observation die benötigten Daten abholen und in einer eigenen Liste speichern...
                            for(var i = 0; i < substitutedObservations.obs.length; i++) {
                                if ('fetchDecisionCriterion' in substitutedObservations.obs[i]) {                                    
                                    substitutedObservations.datasetForDecision.kval.push(substitutedObservations.obs[i].fetchDecisionCriterion());
                                }
                            }
                            // Die Liste nachbearbeiten: Nicht jeder Name eine Observation entspricht einer ID für den nativen Entscheidungsalgorithmus...
                            // ... aber der LOINC-Code: Anpassung der ID noch erforderlich
                            for(var i = 0; i < substitutedObservations.datasetForDecision.kval.length; i++) {
                                var pos = config.defaultReference.findIndex(j => j.loinc == substitutedObservations.datasetForDecision.kval[i].loinc);
                                substitutedObservations.datasetForDecision.kval[i].id = config.defaultReference[pos].id;
                            }

                            // Liste in den nativen Datensatz einfügen
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
    var init = function(obsList, pat, config, classNameForUserReaction) {
        vs.setClassName(classNameForUserReaction);                                          // Elemente für User-Reaktion auf UI zugänglich machen
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
        init:                           init,                                           // Initalisierungsfunktion
        resultNativeDataset:            substitutedObservations.getCriteriaForDecision, // Datensatz für den originären Entscheidungsalgorithmus liefern
        resultProcessedObservations:    substitutedObservations.getList                 // Datensatz der bearbeitete Observations liefern
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

  /**
   * EIGENE ERWEITERUNG FÜR DIE VALIDIERUNG - ANGELEHNT AN DEN REFERENZBEREICH
   * ES GIBT AUCH EINEN WERTEBEREICH FÜR BIOLOGISCH MÖGLICHE WERTE!!
   * BEI ZULÄSSIGEN USEREINGABEN MUSS EIN SOLCHER BEREICH BERÜCKSICHTIGT WERDEN, UM VÖLLIG UNSINNIGE EINGABEN
   * VERMEIDEN ZU KÖNNEN
   */
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

    var configObj = arguments[0], gender = arguments[1] ? arguments[1] : 'male';    // Das Geschlecht ist zur Referenzparameter-Entscheidung wichtig!

    if (configObj && configObj.required) {

        // LOINC und Name
        res.code.coding[0].code = configObj.loinc;
        res.code.coding[0].display = configObj.name;
        
        // Wert an sich
        res.value[0].valueQuantity.value = configObj.value;
        res.value[0].valueQuantity.unit = configObj.unit;

        // Referenzbereiche
        res.value[1].valueRange.low.value = configObj.refMin[gender] ? configObj.refMin[gender] : configObj.refMin;
        res.value[1].valueRange.low.unit = configObj.unit;
        res.value[1].valueRange.high.value = configObj.refMax[gender] ? configObj.refMax[gender] : configObj.refMax;
        res.value[1].valueRange.high.unit = configObj.unit;

        res.referenceRange[0].low.value = configObj.refMin[gender] ? configObj.refMin[gender] : configObj.refMin;
        res.referenceRange[0].low.unit = configObj.unit;
        res.referenceRange[0].high.value = configObj.refMax[gender] ? configObj.refMax[gender] : configObj.refMax;
        res.referenceRange[0].high.unit = configObj.unit;

        // Validitätsbereich
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

    // Als Funktion, um mehrere Karten basteln zu können...
    return function() {

        // Definition der benötigten Parameter in der Karte
        var htmlString      = "",                   // Der gesamte HTML-String für die Karte
            htmlTableString = "",                   // Der String mit der Tabelleneinträge für die Karte
            title           = "Card",               // Titel der Karte
            bgColor         = "#111111",            // Hintergrundfarbe - hier mit Defaultwert
            withTable       = false,                // false: Zunächst nur normale Karte; true: Karte mit Tabelle
            params          = [],                   // beinhaltet Observations der Laborparameter
            destination     = "",                   // Ziel, wo die Karte hingeschrieben werden soll
            reactOn         = "inpReact",           // Name für den Class-Selector für die Callbacks für die Usereingaben
            config          = null,                 // beinhaltet Konfigurationsvorgaben
            // Grundstruktur des Datasets für die Funktionsrückgabe festlegen
            // s. Testdatensatz data.js
            datasetForDecision = getDataSetBasis(); // Grundstruktur des nativen Datensatzes für den Entscheidungsalgorithmus holen

        // Initialisierungsfunktion, je nach übergebenen Parametern
        function initCard(parameters) {
        
            if (typeof parameters === 'string') {                
                htmlTableString = parameters;
                title           = "Card";
                bgColor         = "#ffffff";
                withTable       = false;
            } else if (typeof parameters === 'object') {
                datasetForDecision.gender   = parameters.patient ? parameters.patient.gender : "female";
                config                      = parameters.config;
                params                      = parameters.content;    
                title                       = parameters.title ? parameters.title : 'Card';
                bgColor                     = parameters.background ? parameters.background : '#112233';
                withTable                   = true;
                reactOn                     = parameters.reactOn;
            }

        }

        // Die Karte zusammensetzen - ein Ort, d.h. ein DOM-Objekt (<div class="card"></div>) für die Karte muß existieren, um den String dort
        // hinschreiben zu können
        function setHTMLString() {
            
            var contentString = "";
            htmlString = "";            
            
            if (htmlTableString === "") {                 
                for(var i = 0; i < params.length; i++) {
                    if ('asHTMLTableRow' in params[i]) {
                        contentString += params[i].asHTMLTableRow();    
                    }
                }
            } else {
                contentString = htmlTableString;
            }
                        
            htmlString += "<div class=\"card-body\"><h4 class=\"card-title\"><span id=\"fact" + title + "\">" + title + "<span></h4>";
            htmlString += withTable ? "<table class=\"table table-hover table-sm\"><tbody>" : "";
            htmlString += contentString; 
            htmlString += withTable ? "</tbody></table>" : "";
            htmlString += "</div>";            

        }

        // Auf die Usereingaben in ein Input-Feld reagieren - Das Inputfeld hat die ID des zugehörigen LOINCs,
        // anhand derer die zugehörige Observation aus der Liste gefunden wird
        // Potentielle Erweiterung (bisher noch keine zündende Idee...): der Callback-Funktion des Inputfeldes wird die Observation bekannt gemacht...
        function reactToUser() {
            var pos = params.findIndex(j => j.code.coding[0].code === this.id);
            
            // Wenn die Observation existiert ...
            if (pos > -1) {

                // Ändere den Wert und kennzeichne sie, dass sie verändert wurde
                params[pos].writeValueAndValidate(this.value, '#ffbfbf');                

                // Setze die Karte zusammen, schreibe sie an Ort und Stelle und hänge die Callbacks (wieder) an
                setHTMLString();                
                $("#" + destination).html(htmlString);
                $("." + reactOn).change(reactToUser);
                                
                // Generiere eine Liste der Kriterien für den nativen Entscheidungsalgorithmus und validiere sie
                createDecisionList();                
                validatePatientLaboratoryObservations(datasetForDecision);                
                
                // Eine Entscheidung muß hier dann fallen ... 
                for(var i = 0; i < datasetForDecision.kval.length; i++) {                    
                    var result =    testNormalAndValidRange(datasetForDecision.kval[i].value,
                                                            datasetForDecision.kval[i].refMin,
                                                            datasetForDecision.kval[i].refMax,
                                                            datasetForDecision.kval[i].validMin,
                                                            datasetForDecision.kval[i].validMax);
                    decision.setItem(datasetForDecision.kval[i]['id'],
                                     datasetForDecision.kval[i]['value'],
                                     result.status);                    
                }
                
                // Ergebniskarten zusammenstellen und die Farbe ändern
                $(".results").css({
                    "background-color": "#ffbfbf",
                    "transition": "0.5s all ease-in-out"
                });
                composeResultCards();
            }
        }

        // Funktion: Lass die ursprüngliche Karte verschwinden und lass die neu generierte Karte erscheinen
        function displayCard(dest) {

            destination = dest;
            
            setHTMLString();
                        
            $("#" + destination).fadeOut(600, function() {
                $("#" + destination).css("display", "none");
                $("#" + destination).html(htmlString);
                $("#" + destination).css("background", bgColor);
                $("#" + destination).fadeIn(300);
                $("." + reactOn).change(reactToUser);
                                          
                // Generiere eine Liste der Kriterien für den nativen Entscheidungsalgorithmus und validiere sie
                createDecisionList();
                validatePatientLaboratoryObservations(datasetForDecision);
                
                // Eine Entscheidung muß hier dann fallen ... 
                for(var i = 0; i < datasetForDecision.kval.length; i++) {                    
                    var result =    testNormalAndValidRange(datasetForDecision.kval[i].value,
                                                            datasetForDecision.kval[i].refMin,
                                                            datasetForDecision.kval[i].refMax,
                                                            datasetForDecision.kval[i].validMin,
                                                            datasetForDecision.kval[i].validMax);
                    decision.setItem(datasetForDecision.kval[i]['id'],
                                     datasetForDecision.kval[i]['value'],
                                     result.status);                    
                }           
                composeResultCards();

            });
        
        }

        // Hilfsfunktion - s. auch observationFactory.createCriteriaForDecision
        // Die Kriterien für den Entscheidungsalgorithmus zusammenstellen - wird benötigt, um den nativen Entscheidungsalgorithmus bedienen zu können        
        function createDecisionList() {
                        
            if (params && config) {                                                         // Gibt es Observations und eine Konfiguration?
                datasetForDecision.kval = [];                                               // Initalisiere die Liste für die Kriterien
                for(var i = 0; i < params.length; i++) {                                    // Gehe die Observations durch und hole die benötigten Daten
                    if ('fetchDecisionCriterion' in params[i]) {
                        datasetForDecision.kval.push(params[i].fetchDecisionCriterion());
                    }
                }
                for(var i = 0; i < datasetForDecision.kval.length; i++) {                   // Passe die benötigten nativen IDs anhand der LOINC-Codes an
                    var pos = config.defaultReference.findIndex(j => j.loinc == datasetForDecision.kval[i].loinc);
                    datasetForDecision.kval[i].id = config.defaultReference[pos].id;
                }  
                console.log(datasetForDecision)                              ;
            }

        }

        // Stelle öffentlich zur Verfügung nur zwei Funktionen
        return {
            init:       initCard,       // Initialisierungsfunktion
            display:    displayCard     // Visualisierungsfunktion
        }

    }   

})();