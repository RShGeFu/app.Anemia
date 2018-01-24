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
        isAnemia:       function() {
                            if (valueSet.hemoglobin.assess === 'low') {
                                return true;
                            } else {
                                // Fehlermeldung festlegen
                                return false;
                            }
                        },
        isMicrocytic:   function() {
                            if (valueSet.mcv.assess === 'low') {
                                return true;
                            } else {
                                // Fehlermeldung festlegen
                                return false;
                            }
                        },
        hasFerritine:       null,
        ferritineIsNormal:  null,
        hasCRP:             null,
        crpIsNormal:        null,        
        hasSTFR:            null,
        stfrIsNormal:       null,

        /* Berechnungsfunktionen für Werte, die sich aus den gegeben Labordaten ergeben */
        ironNeeds:          null,
        rpi:                function() {
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