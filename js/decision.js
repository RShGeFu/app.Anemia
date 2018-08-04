/**
 * Copyright bei G. Füchsl - 2018
 */

"use strict";

/**
 * Objekt 'decision'
 * Enthält die Kriterien und Methoden für den (medizinischen) Entscheidungsprozess
 */
var decision = (function() {

    /* Labelliste für die Übersetzung */
    var labels = getTranslationList();    

    /****************************************************************************************************************
        Dieses ValueSet wird dynamisch während des Programmablaufes ergänzt bzw. erfährt ein Update über 'setItem'.
        Hierin stehen dann die bewerteten Kriterien für den Entscheidungsprozess
    *****************************************************************************************************************/
    var valueSet = {
        
        /*****************************************************************************************************************
            Nimmt ein Kriterium für den Entscheidungsprozess in 'valueSet' auf
            Diese Funktion wird augerufen, wenn die Klinische Patientenkarte und die Laborkarte zusammengestellt werden,
            sowie wenn der User 'Spieldaten' eingibt.
        ******************************************************************************************************************/
        setItem:        function(item, val, assessment) {
                            // Lege die Property neu an, wenn sie nicht existiert ...
                            if (valueSet[item] == null) {
                                Object.defineProperty(valueSet, item, { value: { value: val, assess: assessment  } } );                                
                            // ... sonst weise ihr den aktuellen Wert zu!
                            } else {
                                valueSet[item]['value'] = val;
                                valueSet[item]['assess'] = assessment;
                            }                            
                        },
        
        /****************************************************************************** 
            Ab hier Definition von Funktionen für den gesamten Entscheidungsprozess 
        *******************************************************************************/

        /* Allgemeine, abstrahierte Funktionen für die Tests */
        // Ist das benötigte Entscheidungskriterium überhaupt in 'valueSet' aufgenommen?
        hasValue:       function(val) {      
                            // Nur wenn das Entscheidungskriterium vorhanden UND valide ist, dann ...                        
                            if (valueSet[val] != null && valueSet[val]['assess'] != null && valueSet[val]['assess'].substring(0,2) != 'nv') {
                                return true;
                            } else {                                
                                return false;
                            }
                        },
        hasValueNAss:   function(val) {      
                            // Nur wenn das Entscheidungskriterium vorhanden, dann ...                        
                            if (valueSet[val] != null) {
                                return true;
                            } else {                                
                                return false;
                            }
                        },
                        
        // Wie ist die Bewertung des aufgenommen Entscheidungskriterium ausgefallen?
        isValue:        function(val, ass) {                            
                            if (valueSet[val]['assess'] === ass) {
                                return true;
                            } else {                                
                                return false;
                            }
                        },

        /* Konkret benötigte Entscheidungen */
        hasHB:          function() { return valueSet.hasValue('hemoglobin'); },
        isAnemia:       function() { return valueSet.isValue('hemoglobin', 'low'); },
        hasMCV:         function() { return valueSet.hasValue('mcv'); },
        isMicrocytic:   function() { return valueSet.isValue('mcv', 'low'); },
        isNormocytic:   function() { return valueSet.isValue('mcv', 'ok'); },
        hasFerritine:   function() { return valueSet.hasValue('ferritine'); },
        isFerritineLow: function() { return valueSet.isValue('ferritine', 'low'); },        
        hasCRP:         function() { return valueSet.hasValue('crp'); },
        isCrpOK:        function() { return valueSet.isValue('crp', 'ok'); },
        hasSTFR:        function() { return valueSet.hasValue('sTFR'); },
        isSFTRNormal:   function() { return valueSet.isValue('sTFR', 'ok'); },
        hasHematokrit:  function() { return valueSet.hasValue('hematokrit'); },
        hasVB12:        function() { return valueSet.hasValue('vitb12'); },
        isVB12Low:      function() { return valueSet.isValue('vitb12', 'low'); },
        hasFolicAcid:   function() { return valueSet.hasValue('folicAcid'); },
        isFolicAcidLow: function() { return valueSet.isValue('folicAcid', 'low'); },
        hasFolicAcid:   function() { return valueSet.hasValue('folicAcid'); },
        hasReticulocytes:function() { return valueSet.hasValue('reticulocytepc'); },
        hasReticulocHb: function() { return valueSet.hasValue('reticulocytehb'); },
        hasWeight:      function() { return valueSet.hasValueNAss('weight'); },
        hasHeight:      function() { return valueSet.hasValueNAss('height'); },

        /* Berechnungsfunktionen für Werte, die sich aus den gegeben Labordaten ergeben */
        // Eisenbedarf...
        ironNeeds:      function() {                            

                            if (valueSet.hasWeight() && valueSet.hasHB()) {     // Wenn Gewicht und Hb verfügbar
                                
                                var targetHb1 = Number(valueSet.hemoglobin.value) + 1,  // Ziel-Hb-Wert in g/dl - Typ-Sicherheit wichtig bei USer-Eingaben!
                                    targetHb2 = Number(valueSet.hemoglobin.value) + 2,  // Ziel-Hb-Wert in g/dl - Typ-Sicherheit wichtig bei USer-Eingaben
                                    ironReserve = 500;                          // Reserveeisen in mg ab einem Gewicht > 35kg
                                    
                                if (valueSet.weight.value < 35) {
                                    ironReserve = 15 * valueSet.weight.value;   // Reserveeisen in mg bis zu einem Gewicht < 35kg
                                }
                                
                                return {
                                    target1: function() { return targetHb1; },
                                    target2: function() { return targetHb2; },
                                    target1Iron: Math.round((targetHb1 - valueSet.hemoglobin.value) * valueSet.weight.value * 2.4 + ironReserve), // Formel nach Ganzoni
                                    target2Iron: Math.round((targetHb2 - valueSet.hemoglobin.value) * valueSet.weight.value * 2.4 + ironReserve)  // Formel nach Ganzoni)
                                }
                            
                            }   

                            return {
                                target1: function() { return 0; },
                                target2: function() { return 0; },
                                target1Iron: 0,
                                target2Iron: 0
                            };
                        },

        // Retikulozyten-Produktions-Index mit Bewertungsfunktion
        rpi:            function() {
                            if (valueSet.hasHematokrit() && valueSet.hasReticulocytes()) {
                                let shift = 1;
                                if (valueSet.hematokrit.value <= 40) {      // 35 in der Literatur, hier die Werte der verlinkten Präsentation
                                    shift = 1.5;
                                }
                                if (valueSet.hematokrit.value <= 30) {      // 25 in der Literatur
                                    shift = 2;
                                }
                                if (valueSet.hematokrit.value <= 20) {      // 15 in der Literatur
                                    shift = 2.5;
                                }                                
                                return Math.round(valueSet.reticulocytepc.value * valueSet.hematokrit.value / shift / 45 * 10) / 10;                                
                            }                            
                            return 0;
                        },
        isRPIHigh:      function(limit = configuration.limitRPI) {
                            if (valueSet.rpi() > limit) {
                                return true;
                            }
                            return false;
                        },
    
        // Transferrin-Rezeptor-Ferritin-Index mit Bewertungsfunktion 
        tfrFIndex:      function() {
                            if (valueSet.hasSTFR() && valueSet.hasFerritine()) {
                                var rIndex = Math.round(valueSet.sTFR.value / Math.log(valueSet.ferritine.value) * 10) / 10,
                                    compare = configuration.labTestKit_tfrFIndexCRP_OK;
                                if (valueSet.hasCRP()) {
                                    if (valueSet.isCrpOK()) {
                                        compare = configuration.labTestKit_tfrFIndexCRP_OK;
                                    } else {
                                        compare = configuration.labTestKit_trfFIndexCRP_High;
                                    }
                                }
                                if (rIndex > compare * 2) {
                                    rIndex = compare * 2;
                                }
                                return rIndex;
                            }
                            return 0;
                        },
        isTfrFIndexHigh:function() {
                            if (valueSet.hasCRP()) {
                                let index = valueSet.tfrFIndex();
                                if (valueSet.isCrpOK()) {
                                    if (index > configuration.labTestKit_tfrFIndexCRP_OK) {                                                    
                                        return true;
                                    }
                                    return false;
                                } else {
                                    if (index > configuration.labTestKit_trfFIndexCRP_High) { 
                                        return true;
                                    }
                                    return false;
                                }
                            }
                            return false;
                        },

        // BMI als Nebenprodukt
        // MUSS NOCH OPTIMIERT WERDEN!!!
        bmi:            function() {
                            if (valueSet.hasWeight() && valueSet.hasHeight()) {
                                var w = 0, h = 0, t = "";
                                // Grenzwerte berücksichtigen!!                                                                
                                if (Number(valueSet.weight.value).valueOf() < configuration.weightLow) {
                                    w = 40;
                                    t = "< ";
                                } else if (Number(valueSet.weight.value).valueOf() > configuration.weightHigh) {
                                        w = 200;
                                        t = "> ";
                                } else {
                                    w = Number(valueSet.weight.value).valueOf();
                                }

                                if (Number(valueSet.height.value).valueOf() < configuration.heightLow) {
                                    h = 120;
                                    t = "> ";
                                } else if (Number(valueSet.height.value).valueOf() > configuration.heightHigh) {
                                        h = 220;
                                        t = "< ";
                                } else {
                                    h = Number(valueSet.height.value).valueOf();
                                }                             

                                return t + Math.round(w / (h/100 * h/100) * 10) / 10;
                            }

                            return 0;
                        },

        // Zusammenfassende Funktion zur Berechnung aller Indizes und Zusammenstellen des Ergebnis-Objekts
        calculateAll:   function() {                
                            // Erst zurücksetzen
                            valueSet.maths = [];

                            /* Die Ergebnisstruktur beinhaltet ...                            
                            [0]: Eisenbedarf
                            [1]: Retikulozytenproduktionsindex
                            [2]: Transferrin-Rezeptor-Ferritin-Index
                            [3]: Für den Thomas-Plot gültigen Retikulozyten-Hb-Wert
                            [4]: Für den Thomas-Plot gültigen Referenzwert des Transferrin-Rezeptor-Ferritin-Index
                            [5]: BMI
                            */
                            
                            // Beginn Zusammenstellen: Zuerst den Eisenbedarf...
                            valueSet.maths.push(valueSet.ironNeeds());                            
                            // dann den Retikulozytenreprodultionsindex...
                            valueSet.maths.push(valueSet.rpi());
                            // dann den Transferrin-Rezeptor-Ferritin-Index
                            valueSet.maths.push(valueSet.tfrFIndex());
                            // dann den Retikulozyten-Hb, je nach Vorhandensein ...                            
                            if (valueSet.hasReticulocHb()) {
                                valueSet.maths.push(valueSet.reticulocytehb.value);
                            } else {
                                valueSet.maths.push(configuration.averageRetiHb);
                            }
                            // dann den Referenzwert des Transferrin-Rezeptor-Ferritin-Index für den Thomas-Plot je nach CRP-Status ...
                            if (valueSet.hasCRP()) {                                
                                if (valueSet.isCrpOK()) {
                                    valueSet.maths.push(configuration.labTestKit_tfrFIndexCRP_OK);                                    
                                } else {
                                    valueSet.maths.push(configuration.labTestKit_tfrFIndexCRP_High);                                    
                                }
                            } else {                                                                
                                valueSet.maths.push(configuration.labTestKit_tfrFIndexCRP_OK);
                            }
                            // dann den BMI als AddOn.
                            valueSet.maths.push(valueSet.bmi());                            
                        },

        /*********************************
           Die Entscheidungsfunktion(en)
        /*********************************/
        
        /* Unterentscheidungsalgorithmus 'executeMicrocyticDecisionBranch': In diesen Arm mit multiplen Entscheidungen münden 
            zwei(!) übergeordnete Entscheidungswege */
        executeMicrocyticDecisionBranch:
            function() {                
                if (valueSet.hasFerritine()) {
                    if (valueSet.isFerritineLow()) {
                        // D: Eisenmangelanämie
                        // E: Eisensubstitution                        
                        valueSet.pushResults("diag-6", "recom-6");
                    } else {
                        if (valueSet.hasCRP()) {                            
                            if (valueSet.isCrpOK()) {
                                if (valueSet.isMicrocytic()) {
                                    // D: Mikrozytäre Anämie bei V.a. Thalassämie
                                    // E: Thalassämie - Diagnostik
                                    valueSet.pushResults("diag-7", "recom-7");
                                } else {
                                    // D: Eisenmangel unwahrscheinlich - V.a. Hypoplastische/Infiltrative/Dyserythropoietische KM-Störung
                                    // E: Diagnostik - Knochenmarkszytologie
                                    valueSet.pushResults("diag-8", "recom-8");
                                }
                            } else {                                
                                if (valueSet.hasSTFR()) {                                    
                                    if (valueSet.isSFTRNormal()) {
                                        // D: AOD
                                        // E: Spezifische Diagnostik
                                        valueSet.pushResults("diag-9", "recom-9");                              
                                    } else {
                                        // D: Eisenmangel + AOD
                                        // E: Spezifische Diagnostik und Eisensubstiution                                        
                                        valueSet.pushResults("diag-10", "recom-10");                              
                                    }
                                } else {
                                    // D: Mikrozytäre Anämie
                                    // E: Löslichen Transferrin-Rezeptor bestimmen
                                    valueSet.pushResults("diag-4", "recom-11");
                                }
                            }
                        } else {
                            // D: Mikrozytäre Anämie
                            // E: CRP bestimmen
                            valueSet.pushResults("diag-4", "recom-5");
                        }
                    }
                } else {
                    // D: Mikrozytäre Anämie
                    // E: Ferritin bestimmen
                    valueSet.pushResults("diag-4", "recom-4");
                }
            },
        
        /* Hauptentscheidungsalgorithmus 'executeDecision' */
        executeDecision:    
            function() {
                
                // Erst die Arrays für das Ergebnis zurücksetzen...
                valueSet.diagnoses = [];
                valueSet.recommends = [];
                
                // Dann den Decision-Prozess starten!
                if (valueSet.hasHB()) {
                    if (valueSet.isAnemia()) {
                        if (valueSet.hasMCV()) {
                            if (valueSet.isMicrocytic()) {
                                // Mikrozytäre Anämie differenzieren
                                valueSet.executeMicrocyticDecisionBranch();
                            } else {
                                if (valueSet.hasHematokrit()) {                                    
                                    if (valueSet.isRPIHigh()) {
                                        // D: Hämolyse, Akute Blutung
                                        // E: Diagnostik und ...
                                        valueSet.pushResults("diag-12", "recom-12");
                                        valueSet.executeMicrocyticDecisionBranch();
                                    } else {
                                        if (valueSet.isNormocytic()) {
                                            // D: V.a. Hypoplastische/Infiltrative/Dyserythropoietische KM-Störung
                                            // E: Knochenmarkszytologie
                                            valueSet.pushResults("diag-8", "recom-8");
                                        } else {
                                            if (valueSet.hasVB12()) {
                                                if (valueSet.isVB12Low()) {
                                                    // D: Makrozytäre Anämie bei Vit B12-Mangel
                                                    // E: Substitution
                                                    valueSet.pushResults("diag-13", "recom-13");
                                                } else {                                                    
                                                    if (valueSet.hasFolicAcid()) {
                                                        if (valueSet.isFolicAcidLow()) {
                                                            // D: Makrozytäre Anämie bei Folsäure-Mangel
                                                            // E: Subistution
                                                            valueSet.pushResults("diag-14", "recom-14");
                                                        } else {
                                                            // D: V.a. Hypoplastische/Infiltrative/Dyserythropoietische KM-Störung
                                                            // E: Knochenmarkszytologie
                                                            valueSet.pushResults("diag-8", "recom-8");                                                      
                                                        }
                                                    } else {
                                                        // D: Makrozytäre Anämie
                                                        // E: Folsäure bestimmen
                                                        valueSet.pushResults("diag-15", "recom-16");                           
                                                    }                                                            
                                                }
                                            } else {
                                                // D: Makrozytäre Anämie
                                                // E: Vitamin B12 bestimmen
                                                valueSet.pushResults("diag-15", "recom-15");                           
                                            }
                                        }
                                    }
                                } else {
                                    // D: Nicht-Mikrozytäre Anämie
                                    // E: Hämatokrit bestimmen
                                    valueSet.pushResults("diag-3", "recom-3");
                                }
                            }
                        } else {
                            // D: Anämie 
                            // E: MCV bestimmen
                            valueSet.pushResults("diag-2", "recom-2");
                        }
                    } else {
                        // D: Keine Anämie
                        // E: Beschwerdebezogende Diagnostik empfohlen
                        valueSet.pushResults("diag-1", "recom-1");
                    }
                } else {
                    // D: Keine Diagnostik möglich
                    // E: Laborbestimmungen empfohlen
                    valueSet.pushResults("diag-0", "recom-0");
                }
            },

        /*******************************************************************************
            Hier stehen die Ergebnisse aus dem Entscheidungs- und Berechnungsprozess,
            diese werden durch die Funktion executeDecision() befüllt 
        ********************************************************************************/
        
        diagnoses:      [],
        recommends:     [],        
        maths:          [],
        
        /* Schiebt Ergebnisse des Entscheidungsprozesses auf den jeweiligen Stack */
        pushResults:    function(res, rec) {
                            var r; 
                            
                            if (res != null) {
                                r = labels.labels.findIndex(i => i.id === res);
                                // Wenn Diagnose noch nicht auf dem Stack ...
                                if (valueSet.diagnoses.indexOf(labels.labels[r]) == -1) {
                                    valueSet.diagnoses.push(labels.labels[r]);
                                }
                            }

                            if (rec != null) {
                                r = labels.labels.findIndex(i => i.id === rec);
                                // Wenn Empfehlung noch nicht auf dem Stack ...
                                if (valueSet.recommends.indexOf(labels.labels[r]) == -1) {
                                    valueSet.recommends.push(labels.labels[r]);
                                }
                            }                                                        
                        },
    
        /* Führt den Entscheidungs- und Berechnungsprozess durch und gibt die Ergebnisstruktur zurück */        
        result:         function() {                            

                            valueSet.calculateAll();                          
                            valueSet.executeDecision();
                            
                            return {
                                diagnoses:  valueSet.diagnoses,
                                recommends: valueSet.recommends,
                                maths:      valueSet.maths
                            }

                        }
    };

    /********************************************************************
        Die Kriterien und der größte Teil der Methodensind gekapselt, 
        nur die zwei folgenden Methoden sind zugänglich 
    *********************************************************************/
    return {
        setItem:    valueSet.setItem,
        result:     valueSet.result        
    }

})();

/***********************************************************************************
 * Idee bzw. Experimentell: Entscheidungsalgorithmus auf dem Boden von Obersations *
 * Funktioniert in Zusammenhang mit der globalen Variable 'observationFactory'     *
 * s. 'factory.js'                                                                 *
 ***********************************************************************************/
var decisionWithObservations = (function() {
    
    var listOfObservations =    [],    // Set von Observations: Enthält die Observations, die als Entscheidungsparameter gelten
                                       // Zusammengestellt von 'observationFactory'
        diagnoses =             [],    // Array für die Diagnosen aus dem Entscheidungsalgorithmus
        recommends =            [],    // Array für die Empfehlungen aus dem Entscheidungsalgorithmus
        labels =                getTranslationList();    // IDs der UI-Elemente
                        
    /**
     * Initialisierungsfunktion: Die Liste Observations mit den Parametern für die Entscheidungsunterstützung wird übergeben,
     * nochmals auf Vollständigkeit geprüft (müsste aus factory.js vollständig kommen) und zugewiesen
     * @param {*} obs 
     */
    function initDecisionDataset(obs) {

        // Validiere 'obs', ... (wirklich alle benötigten Observations enthalten?)
        for(var i = 0; i < configuration.defaultReference.length; i++) {           
            
            if (obs.find(function(toTest) {                                                                                     
                                            if ('resourceType' in toTest && toTest.resourceType === 'Observation') {
                                                return toTest.code.coding[0].code === configuration.defaultReference[i].loinc;
                                            } else {                                                
                                                return false;
                                            }
                                          }) == -1) {                
                return;
            }            

        }

        // ... erst dann weise zu!        
        listOfObservations = obs;
    }

    /**
     * Liefert den Wert einer Observation aus dem Set, ausgehend von der 'id' der 'configuration'
     * @param {*} parameter 
     */
    function getValueOf(parameter) {
        
        var o = obs(parameter);     // Nutzt die Funktion obs(), um die betreffende Observation zu erhalten...
        
        // ... um den Wert dann zu liefern
        if (o) {
            return !o.value ? o.valueQuantity.value : o.value[0].valueQuantity.value;
        }
        return -1;

    }

    /**
     * Liefert die Observation aus dem Set, ausgehend von der 'id' der 'configuration'
     * @param {*} parameter 
     */
    function obs(parameter) {
        var posP, posO;

        // Hole den entsprechenden LOINC-Code...
        posP = configuration.defaultReference.findIndex(function(toTest) {                                                            
                                                            return toTest.id === parameter;
                                                        });
        
        // Wenn der LOINC-Code gefunden ist, dann hole den Wert der entsprechenden Observation...
        if (posP > -1) {
            posO = listOfObservations.find(function(toTest) {

                                                if ('resourceType' in toTest && toTest.resourceType === 'Observation') {
                                                    
                                                    // Schaut im semantischen Mapping-Array des Parameters nach ....
                                                    for (var i = 0; i < configuration.defaultReference[posP].acceptedLOINC.length; i++) {
                                                        if (toTest.code.coding[0].code === configuration.defaultReference[posP].acceptedLOINC[i]) {
                                                            return true;
                                                        }
                                                    }
                                                    return false;

                                                } else {
                                                    return false;
                                                }   

                                            });            
            return posO;
        }
        
        // Sonst liefe nichts ...
        return null;        
    }

    /**
     * Liefert den Retikulozyten-Produktions-Index
     */
    function getRPI() {

        var shift = 1,                      // Hämatologisch vorgegeben...
            v = getValueOf('hematokrit');   // Hole den Wert aus der Observation über die ID aus der 'configuration'

        if (v <= 40) {      // 35 in der Literatur, hier die Werte der verlinkten Präsentation
            shift = 1.5;
        }
        if (v <= 30) {      // 25 in der Literatur
            shift = 2;
        }
        if (v <= 20) {      // 15 in der Literatur
            shift = 2.5;
        }                                

        return Math.round(getValueOf('reticulocytepc') * getValueOf('hematokrit') / shift / 45 * 10) / 10;                                

    }

    /**
     *  Schiebt Ergebnisse des Entscheidungsprozesses auf den jeweiligen Stack
     */
    function pushResults(res, rec) {

        var r; 
    
        if (res != null) {
            r = labels.labels.findIndex(i => i.id === res);
            // Wenn Diagnose noch nicht auf dem Stack ...
            if (diagnoses.indexOf(labels.labels[r]) == -1) {
                diagnoses.push(labels.labels[r]);
            }
        }

        if (rec != null) {
            r = labels.labels.findIndex(i => i.id === rec);
            // Wenn Empfehlung noch nicht auf dem Stack ...
            if (recommends.indexOf(labels.labels[r]) == -1) {
                recommends.push(labels.labels[r]);
            }
        }                                                        
    }    

    /**
     * Liefert das Ergebnis des Entscheidungsprozesses auf Grundlage eines Sets von Observations
     */
    function result() {

        var val = "";

        // Nur Observations vorhanden sind, gibt es einen Entscheidungsprozess und ein Ergebnis...
        if (listOfObservations.length > 0) {

            diagnoses = [],     // Arrays ...
            recommends = [];    // re-initialisieren

            if (obs('hemoglobin').isValue('nv')) {
                
                // D: Keine Diagnostik möglich
                // E: Laborbestimmungen empfohlen
                pushResults("diag-0", "recom-0");                

            /**
             * Anämie vorhanden?
             */
            } else if (obs('hemoglobin').isValue('low')) {
                
                if (obs('mcv').isValue('nv')) {

                    // D: Anämie 
                    // E: MCV bestimmen
                    pushResults("diag-2", "recom-2");

                /**
                 * Mikrozytäre Anämie?
                 */
                } else if (obs('mcv').isValue('low')) {

                    //executeMicrocyticDecisionBranch();

                /**
                 * Normozytäre und makrozytäre Anämie
                 */
                } else {

                    if (obs('hematokrit').isValue('nv')) {
                        
                        // D: Nicht-Mikrozytäre Anämie
                        // E: Hämatokrit bestimmen
                        pushResults("diag-3", "recom-3");

                    } else {

                        /**
                         * Werden Retikulozyten (reaktiv) vermehrt produziert?
                         * Retikulozytenproduktionsindex prüfen
                         */                        
                        if (getRPI() > configuration.limitRPI) {
                                        
                            // D: Hämolyse, Akute Blutung
                            // E: Diagnostik und ...
                            pushResults("diag-12", "recom-12");
                            //executeMicrocyticDecisionBranch();

                        } else {

                            /**
                             * Normozytäre Anämie?
                             */
                            if (obs('mcv').isValue('ok')) {

                                // D: V.a. Hypoplastische/Infiltrative/Dyserythropoietische KM-Störung
                                // E: Knochenmarkszytologie
                                pushResults("diag-8", "recom-8");

                            /**
                             * Makrozytäre Anämie!
                             */
                            } else {

                            }

                        }
                    }
                }

            } else {
                
                // D: Keine Anämie
                // E: Beschwerdebezogende Diagnostik empfohlen
                pushResults("diag-1", "recom-1");

            }
                                    
            // Ergebnis-Verifizierung: Code zur Testergebnis-Generierung und -Anzeige
            for(var i = 0; i < listOfObservations.length; i++) {
                val += !listOfObservations[i].value ? listOfObservations[i].valueQuantity.value : listOfObservations[i].value[0].valueQuantity.value + "\n";                
            }

            return  "OK! " + 
                    listOfObservations.length + " Einträge:\n" + 
                    val +
                    "\nHämoglobin: " + getValueOf('hemoglobin') + " - i.O.: " + obs('hemoglobin').isValue('ok') +
                    "\nRPI: " + getRPI() +
                    "\nDiagnosen: " + JSON.stringify(diagnoses) +
                    "\nEmpfehlungen: " + JSON.stringify(recommends);

        }

        return "Nicht OK!";

    }

    return {
        init:       initDecisionDataset,
        getResult:  result
    }

})();
