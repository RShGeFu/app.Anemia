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
                                if (valueSet.hematokrit.value <= 35) {
                                    shift = 1.5;
                                }
                                if (valueSet.hematokrit.value <= 25) {
                                    shift = 2;
                                }
                                if (valueSet.hematokrit.value <= 15) {
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
                                if (Number(valueSet.weight.value).valueOf() < 40) {
                                    w = 40;
                                    t = "< ";
                                } else if (Number(valueSet.weight.value).valueOf() > 200) {
                                        w = 200;
                                        t = "> ";
                                } else {
                                    w = Number(valueSet.weight.value).valueOf();
                                }

                                if (Number(valueSet.height.value).valueOf() < 120) {
                                    h = 120;
                                    t = "> ";
                                } else if (Number(valueSet.height.value).valueOf() > 220) {
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

/**
 * Idee: Entscheidungsalgorithmus auf dem Boden von Obersations
 * Closure mit Entwicklungspotential ...
 */
var decisionWithObservations = (function() {

    var listOfObservations = [];

    function initDecisionDataset(obs) {
        this.listOfObservations = obs;
    }

    return {
        init:       initDecisionDataset
    }

})();