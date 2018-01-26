/**
 * Copyright bei G. Füchsl - 2018
 */

"use strict";

/**
 * Objekt 'decision'
 * Enthält die Kriterien und Methoden für den (medizinischen) Entscheidungsprozess
 */
var decision = (function() {

    var valueSet = {
        /* Dieses ValueSet wird dynamisch während des Programmablaufes ergänzt bzw. erfährt ein Update über setItem.
            Hierin stehen dann die validierten und bewerteten Kriterien für den Entscheidungsprozess*/
        
        /* Hier stehen die Ergebnisse aus dem Entscheidungsprozess,
            diese werden durch die Funktion executeDecision() befüllt */
        diagnoses:      ["Diagnoses"],
        recommends:     ["ToDo's"],
        errors:         ["Warnings"],
        maths:          ["Arithmetical"],
    
        /* Setzt ein Kriterium für den Entscheidungsprozess fest */
        setItem:        function(item, val, assessment) {                                                      
                            Object.defineProperty(valueSet, item, { value: { value: val, assess: assessment } } );                            
                        },
        
        /* Ab hier Definition von Funktionen für den gesamten Entscheidungsprozess */

        /* Allgemeine, abstrahierte Funktionen für die Tests */
        hasValue:       function(val) {                                                        
                            if (valueSet[val] != null) {
                                return true;
                            } else {                                
                                return false;
                            }
                        },
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
        hasSTFR:        function() { return valueSet.hasValue('sFTR'); },
        isSFTRNormal:   function() { return valueSet.isValue('sFTR', 'ok'); },
        hasHematokrit:  function() { return valueSet.hasValue('hematokrit'); },
        isRPIHigh:      function(limit = 2) {
                            if (valueSet.rpi > limit) {
                                return true;
                            } else {
                                return false;
                            }
                        },
        hasVB12:        function() { return valueSet.hasValue('vb12'); },
        isVB12Low:      function() { return valueSet.isValue('vb12', 'low'); },
        hasFolicAcid:   function() { return valueSet.hasValue('folicAcid'); },
        isFolicAcidLow: function() { return valueSet.isValue('folicAcid', 'low'); },

        /* Berechnungsfunktionen für Werte, die sich aus den gegeben Labordaten ergeben */
        ironNeeds:          null,
        rpi:                function() {
                                return 3; // TESTWEISE!!
                            },
        tfrRIndex:          function() {

                            },

        /* Die eigentliche Entscheidungsfunktion */
        executeMicrocyticDecision:
            function() {
                if (valueSet.hasFerritine()) {
                    if (valueSet.isFerritineLow()) {
                        // D: Eisenmangelanämie
                        // E: Eisensubstitution                        
                    } else {
                        if (valueSet.hasCRP()) {
                            if (valueSet.isCrpOK()) {
                                if (valueSet.isMicrocytic()) {
                                    // D: V.a. Thalassämie
                                    // E: Diagnostik
                                } else {
                                    // D: Eisenmangel unwahrscheinlich
                                    // E: 
                                }
                            } else {
                                if (valueSet.hasSTFR()) {
                                    if (valueSet.isSFTRNormal()) {
                                        // D: AOD
                                        // E: Spezifische Diagnostik
                                    } else {
                                        // D: Eisenmangel + AOD
                                        // E: 
                                    }
                                } else {
                                    // D: 
                                    // E: Löslichen Transferrin-Rezeptor bestimmen
                                }
                            }
                        } else {
                            // D: 
                            // E: CRP bestimmen
                        }
                    }
                } else {
                    // D: 
                    // E: Ferritin bestimmen
                }
            },
        executeDecision:    
            function() {                
                if (valueSet.hasHB()) {
                    if (valueSet.isAnemia()) {
                        if (valueSet.hasMCV()) {
                            if (valueSet.isMicrocytic()) {
                                executeMicrocyticDecision();
                            } else if (valueSet.isNormocytic()){

                            } else {
                                // D: Makrozytäre Anämie                            
                            }
                        } else {
                            // D: Anämie 
                            // E: MCV bestimmen
                        }
                    } else {
                        // D: Keine Anämie
                        // E: Andere Diagnostik empfohlen
                    }
                } else {
                    // D: Keine Diagnose
                    // E: Hb-Wert bestimmen
                }
            },

        /* Gibt die Ergebnisstruktur zurück */
        result:         function() {
                            valueSet.executeDecision();
                            return valueSet.diagnoses;
                        }
    };

    /* Die Kriterien sind gekapselt, nur die Methoden sind zugänglich */
    return {
        setItem:    valueSet.setItem,
        result:     valueSet.result        
    }

})();