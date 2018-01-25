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
                            /*
                            var k = Object.getOwnPropertyNames(valueSet);
                            for(var i of k) {
                                alert(i + " / " + valueSet[i]['value'] + " / " + valueSet[i]['assess']);
                            }*/
                        },
        
        /* Ab hier Definition von Funktionen für den gesamten Entscheidungsprozess */

        /* Allgemeine, abstrahierte Funktionen für die Tests */
        hasValue:       function(val) {
                            if (valueSet.val != null && valueSet.val != 'undefined') {
                                return true;
                            } else {                                
                                return false;
                            }
                        },
        isValue:        function(val, ass) {
                            if (valueSet.val.assess === ass) {
                                return true;
                            } else {                                
                                return false;
                            }
                        },

        /* Konkret benötigte Entscheidungen */
        hasHB:          valueSet.hasValue(hemoglobin),
        isAnemia:       valueSet.isValue(hemoglobin, 'low'),
        hasMCV:         valueSet.hasValue(mcv),
        isMicrocytic:   valueSet.isValue(mcv, 'low'),
        isNormocytic:   valueSet.isValue(mcv, 'ok'),
        hasFerritine:   valueSet.hasValue(ferritine),
        isFerritineLow: valueSet.isValue(ferritine, 'low'),        
        hasCRP:         valueSet.hasValue(crp),
        isCrpOK:        valueSet.isValue(crp, 'ok'),
        hasSTFR:        valueSet.hasValue(sFTR),
        isSFTRNormal:   valueSet.isValue(sFTR, 'ok'),
        hasHematokrit:  valueSet.hasValue(hematokrit),
        isRPIHigh:      function(limit = 2) {
                            if (valueSet.rpi > limit) {
                                return true;
                            } else {
                                return false;
                            }
                        },
        hasVB12:        valueSet.hasValue(vb12),
        isVB12Low:      valueSet.isValue(vb12, 'low'),
        hasFolicAcid:   valueSet.hasValue(folicAcid),
        isFolicAcidLow: valueSet.isValue(folicAcid, 'low'),

        /* Berechnungsfunktionen für Werte, die sich aus den gegeben Labordaten ergeben */
        ironNeeds:          null,
        rpi:                function() {
                                return 3; // TESTWEISE!!
                            },

        tfrRIndex:          function() {

                            },

        /* Die eigentliche Entscheidungsfunktion */
        executeDecision:    null,

        /* Gibt die Ergebnisstruktur zurück */
        result:         function() {
                            valueSet.isAnemia();
                        }
    };

    /* Die Kriterien sind gekapselt, nur die Methoden sind zugänglich */
    return {
        setItem:    valueSet.setItem,
        result:     valueSet.result
    }

})();