/**
 * Copyright bei G. Füchsl - 2018
 */

"use strict";

/* Globale Konfigurationsvariable für die konstanten Werte im App-Kontext */

var configuration = {

    labTestKit:                         "Roche",     // 'Dade-Behring'-Test möglich
    labTestKit_tfrFIndexCRP_OK:         3.2,         // Grenzwert für Roche-Test - Grenzwert für Dade-Behring-Test 1.5 (Dtsch Arztebl 2005; 102(9))
    labTestKit_tfrFIndexCRP_High:       2.0,         // Grenzwert für Roche-Test - Grenzwert für Dade-Behring-Test 0.8 (Dtsch Arztebl 2005; 102(9))

    averageRetiHb:                      28,          // in pg, benötigt für den Thomas-Plot
    
    limitRPI:                           2,           // Grenzwert für den Retikulozytenproduktionsindex

    weightLow:                          40,          // Grenzwerte für die BMI-Berechnung 
    weightHigh:                         200,
    heightLow:                          120,
    heightHigh:                         220,

    defaultReference: [                              // Ab hier werden Labor-Referenzparameter für User-Eingaben angegeben
        {                 
            id:             "hemoglobin",
            name:           "Hemoglobin",
            loinc:          "718-7",
            required:       true,
            value:          null,
            refMin:         {
                                female: 12.0,
                                male:   14.0
                            },
            refMax:         {
                                female: 16.0,
                                male: 18.0
                            },
            unit:           "g/dl",
            validMin:       2.0,
            validMax:       22,
            siFaktor:       0.621,
            intUnit:        "mmol/l",
            acceptedLOINC:                           // Im Grunde wäre es überlegenswert dieses Array bereits bei loinc als 'Haupt-LOINC'-Array zu verwenden und
                                                     // das Mapping von LOINCS bereits von Anfang zu berücksichtigen - die Entwicklung der App startete 
                                                     // mit nur einem Code; das Mapping auf mehrere Codes als Konzept wurde erst im Verlauf überlegt.
                                                     // Als Weiterentwicklung könnte loinc: ["718-7"] geschrieben und ggf. 'defaultReference.loinc' dann durch
                                                     // 'defaultReference.loinc[0]' ersetzt werden...
                            ["718-7", "30350-3", "30313-1", "20509-6", "14775-1" ]
                                                     // Das Array enthält an Position 0 nochmals den führenden LOINC-Code. Eine Anpassung/Umstellung der 
                                                     // Business-Logik auf dieses Array als 'Haupt-LOINC'-Array könnte damit leichter erfolgen,
                                                     // z.B. als: defaultReference.acceptedLOINC[0]
        },
        {            
            id:             "mcv",
            name:           "MCV",
            loinc:          "787-2",
            required:       true,
            value:          null,
            refMin:         78.0,
            refMax:         94.0,
            unit:           "fl",
            validMin:       30.0,
            validMax:       180,           
            acceptedLOINC:  ["787-2" ]
        },
        {            
            id:             "crp",
            name:           "CRP",
            loinc:          "1988-5",
            required:       true,
            value:          null,
            refMin:         0.0,
            refMax:         6.0,
            unit:           "mg/l",
            validMin:       1,
            validMax:       600,
            acceptedLOINC:  ["1988-5" ]
        },
        {            
            id:             "ferritine",
            name:           "Ferritine",
            loinc:          "2276-4",
            required:       true,
            value:          null,
            refMin:         {
                                female: 22,
                                male:   34
                            },
            refMax:         {
                                female: 112,
                                male:   310
                            },
            unit:           "µg/ml",
            validMin:       1,
            validMax:       6000,
            siFaktor:       0.474,
            siUnit:         "pmol/l",
            acceptedLOINC:  ["2276-4" ]
        },
        {            
            id:             "sTFR",
            name:           "soluble Transferrin Receptor",
            loinc:          "30248-9",
            required:       true,
            value:          null,
            refMin:         1.9,
            refMax:         5.0,
            unit:           "mg/dl",
            validMin:       0.001,
            validMax:       50,
            acceptedLOINC:  ["30248-9" ]
        },
        {            
            id:             "reticulocytepc",
            name:           "Reticulocyte",
            loinc:          "4679-7",
            required:       true,
            value:          null,
            refMin:         0.5,
            refMax:         2.0,
            unit:           "%",
            validMin:       0.001,
            validMax:       25.0,
            acceptedLOINC:  ["4679-7" ]
        },
        {            
            id:             "reticulocytehb",
            name:           "Reticuloyte Hb",
            loinc:          "42810-2",
            required:       true,
            value:          null,
            refMin:         28.5,
            refMax:         34.5,
            unit:           "pg",
            validMin:       1,
            validMax:       60,
            acceptedLOINC:  ["42810-2" ]
        },
        {
            id:             "hematokrit",
            name:           "Hematokrit",
            loinc:          "20570-8",
            required:       true,
            value:          null,
            refMin:         {
                                female: 37,
                                male:   40
                            },
            refMax:         {
                                female: 47,
                                male:   54
                            },
            unit:           "%",
            validMin:       1 ,
            validMax:       75,
            acceptedLOINC:  ["20570-8" ]
        },
        {
            id:             "vitb12",
            name:           "Vitamine B12",
            loinc:          "2132-9",
            required:       true,
            value:          null,
            refMin:         200,
            refMax:         300,
            unit:           "pg/ml",
            validMin:       1.0,
            validMax:       3000.0,
            siFaktor:       0.738,
            siUnit:         "pmol/l",
            acceptedLOINC:  ["2132-9" ]
        },
        {
            id:             "folicAcid",
            name:           "Folic Acid",
            loinc:          "2284-8",
            required:       true,
            value:          null,
            refMin:         2.0,
            refMax:         50.0,
            unit:           "ng/ml",
            validMin:       0.001,
            validMax:       150.0,
            acceptedLOINC:  ["2284-8" ]
        }

    ]

}

// Konfiguration für Zugriffe sperren und unveränderlich machen
Object.freeze(configuration);