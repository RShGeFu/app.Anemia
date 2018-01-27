/**
 * Copyright bei G. Füchsl - 2018
 */

"use strict";

/**
 * Objekt 'decision'
 * Enthält die Kriterien und Methoden für den (medizinischen) Entscheidungsprozess
 */
var decision = (function() {

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
                            Object.defineProperty(valueSet, item, { value: { value: val, assess: assessment } } );                            
                        },
        
        /****************************************************************************** 
            Ab hier Definition von Funktionen für den gesamten Entscheidungsprozess 
        *******************************************************************************/

        /* Allgemeine, abstrahierte Funktionen für die Tests */
        // Ist das benötigte Entscheidungskriterium überhaupt in 'valueSet' aufgenommen?
        hasValue:       function(val) {      
                            // Nur wenn das Entscheidungskriterium vorhanden UND valide ist, dann ...                        
                            if (valueSet[val] != null && valueSet[val]['assess'].substring(0,2) != 'nv') {
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
                            } else {
                                return null;
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
        tfrRIndex:          function() {

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
                    } else {
                        if (valueSet.hasCRP()) {                            
                            if (valueSet.isCrpOK()) {
                                if (valueSet.isMicrocytic()) {
                                    // D: V.a. Thalassämie
                                    // E: Diagnostik
                                } else {
                                    // D: Eisenmangel unwahrscheinlich
                                    // E: Diagnostik                                    
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
        
        /* Hauptentscheidungsalgorithmus 'executeDecision' */
        executeDecision:    
            function() {                
                if (valueSet.hasHB()) {
                    if (valueSet.isAnemia()) {
                        if (valueSet.hasMCV()) {
                            if (valueSet.isMicrocytic()) {
                                valueSet.executeMicrocyticDecisionBranch();
                            } else {
                                if (valueSet.hasHematokrit()) {
                                    if (valueSet.isRPIHigh(valueSet.rpi())) {
                                        valueSet.executeMicrocyticDecisionBranch();
                                    } else {
                                        if (valueSet.isNormocytic()) {
                                            // D: V.a. Hypoplastische/Infiltrative/Dyserythropoietische KM-Störung
                                            // E: Knochenmarkszytologie    
                                        } else {
                                            if (valueSet.hasVB12()) {
                                                if (valueSet.isVB12Low()) {
                                                    // D: Vit B12-Mangel
                                                    // E: Substitution
                                                }
                                            } else {
                                                // D:
                                                // E: Vitamin B12 bestimmen
                                                valueSet.diagnoses.push("Vit B12 bestimmen");
                                            }
                                            if (valueSet.hasFolicAcid()) {
                                                if (valueSet.isFolicAcidLow()) {
                                                    // D: Folsäure-Mangel
                                                    // E: Subistution
                                                } else {
                                                    // D: V.a. Hypoplastische/Infiltrative/Dyserythropoietische KM-Störung
                                                    // E: Knochenmarkszytologie                                                        
                                                }
                                            } else {
                                                // D:
                                                // E: Folsäure bestimmen
                                                valueSet.diagnoses.push("Folsäure bestimmen");
                                            }
                                        }

                                    }
                                } else {
                                    // D: Nicht-Mikrozytäre Anämie
                                    // E: Hämatokrit bestimmen
                                }
                            }

                            /********************************************************************************************
                            /* Ursprünglicher Algorithmus, in dem normozytär und makrozytär zuerst unterschieden wurden
                            } else if (valueSet.isNormocytic()) {
                                if (valueSet.hasHematokrit()) {
                                    if (valueSet.isRPIHigh()) {
                                        // D: V.a. Hämolyse, V.a. akute Blutung
                                        // E: Diagnostik
                                        valueSet.executeMicrocyticDecisionBranch();
                                    } else {
                                        // D: V.a. Hypoplastische/Infiltrative/Dyserythropoietische KM-Störung
                                        // E: Knochenmarkszytologie    
                                    }
                                } else {
                                    // D:
                                    // E: Hämatokrit bestimmen
                                }
                            } else {
                                if (valueSet.hasHematokrit()) {
                                    if (valueSet.isRPIHigh()) {
                                        // D: V.a. Hämolyse, V.a. akute Blutung
                                        // E: Diagnostik
                                        valueSet.executeMicrocyticDecisionBranch();
                                    } else {
                                        
                                        if (valueSet.hasVB12()) {
                                            if (valueSet.isVB12Low()) {
                                                // D: VitB12-Mangel / Anämie
                                                // E: Substitution
                                            } else {
                                                // D: Ausschluß Vit B12-Mangel
                                                // E:
                                            }
                                        } else {
                                            // D: 
                                            // E: Bestimmung von Vit B12
                                        }
                                        
                                        if (valueSet.hasFolicAcid()) {
                                            if (valueSet.isFolicAcidLow()) {
                                                // D: Folsäure-Mangel / Anämie
                                                // E: Substitution
                                            } else {
                                                // D: Ausschluß Folsäure-Mangel
                                                // E:
                                            }
                                        } else {
                                            // D: 
                                            // E: Bestimmung von Folsäure
                                        }

                                    }
                                } else {
                                    // D: Makrozytäre Anämie
                                    // E: Hämatokrit bestimmen
                                }                                
                            }
                            *********************************************************************/

                        } else {
                            // D: Anämie 
                            // E: MCV bestimmen
                        }
                    } else {
                        // D: Keine Anämie
                        // E: Andere Diagnostik empfohlen
                    }
                } else {
                    // D: Diagnose-Stellung nicht möglich
                    // E: Hb-Wert bestimmen
                }
            },

        /*******************************************************************
            Hier stehen die Ergebnisse aus dem Entscheidungsprozess,
            diese werden durch die Funktion executeDecision() befüllt 
        ********************************************************************/
        diagnoses:      ["Diagnoses"],
        recommends:     ["ToDo's"],
        errors:         ["Warnings"],
        maths:          ["Arithmetical"],
    
        /* Führt den Entscheidungsprozess durch und gibt die Ergebnisstruktur zurück */        
        result:         function() {
                            valueSet.executeDecision();
                            return   valueSet.diagnoses;
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