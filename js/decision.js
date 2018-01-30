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
                                Object.defineProperty(valueSet, item, { value: { value: val, assess: assessment } } );                                
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
        hasVB12:        function() { return valueSet.hasValue('vb12'); },
        isVB12Low:      function() { return valueSet.isValue('vb12', 'low'); },
        hasFolicAcid:   function() { return valueSet.hasValue('folicAcid'); },
        isFolicAcidLow: function() { return valueSet.isValue('folicAcid', 'low'); },
        hasWeight:      function() { return valueSet.hasValue('weight'); },

        /* Berechnungsfunktionen für Werte, die sich aus den gegeben Labordaten ergeben */
        // Eisenbedarf...
        ironNeeds:      function() {
                            if (valueSet.hasWeight()) {
                                return 1;
                            } else {
                                return 0;
                            }
                        },
        // Retikulozyten-Produktions-Index mit Bewertungsfunktion
        rpi:            function() {
                            return 1; // TESTWEISE!!
                        },
        isRPIHigh:      function(limit = 2) {
                            if (valueSet.rpi() > limit) {
                                return true;
                            } else {
                                return false;
                            }
                        },
    
        // Transferrin-Rezeptor-Index
        tfrRIndex:      function() {
                            return 0;
                        },

        // Zusammenfassende Funktion zur Berechnung aller Indizes
        calculateAll:   function() {                            
                            valueSet.maths = [];                            
                            valueSet.maths.push(valueSet.ironNeeds());                            
                            valueSet.maths.push(valueSet.rpi());
                            valueSet.maths.push(valueSet.tfrRIndex());                            
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
                                    if (valueSet.isRPIHigh(valueSet.rpi())) {
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
                                                }
                                            } else {
                                                // D: Makrozytäre Anämie
                                                // E: Vitamin B12 bestimmen
                                                valueSet.pushResults("diag-15", "recom-15");                           
                                            }
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
                                valueSet.diagnoses.push(labels.labels[r]);
                            }

                            if (rec != null) {
                                r = labels.labels.findIndex(i => i.id === rec);
                                valueSet.recommends.push(labels.labels[r]);
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