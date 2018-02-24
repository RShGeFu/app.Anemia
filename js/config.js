/**
 * Copyright bei G. Füchsl - 2018
 */

"use strict";

/* Globale Konfigurationsvariable für die konstanten Werte im App-Kontext */

var configuration = {

    labTestKit:                         "Roche",     // 'Dade-Behring'-Test möglich
    labTestKit_tfrFIndexCRP_OK:         3.2,         // Grenzwert für Roche-Test - Grenzwert für Dade-Behring-Test 1.5 (Dtsch Arztebl 2005; 102(9))
    labTestKit_trfFIndexCRP_High:       2.0,         // Grenzwert für Roche-Test - Grenzwert für Dade-Behring-Test 0.8 (Dtsch Arztebl 2005; 102(9))

    averageRetiHb:                      28,          // in pg, benötigt für den Thomas-Plot
    
    limitRPI:                           2,           // Grenzwert für den Retikulozytenproduktionsindex

    defaultReference: [                              // Ab hier werden Referenzparameter für USer-Eingaben angegeben
        {                 
            id:             "hemoglobin",
            name:           "Hemoglobin",
            loinc:          0,
            value:          null,
            refMin:         {
                                female: 12.0,
                                male:   14.0
                            },
            refMax:         {
                                female: 14.0,
                                male: 16.0
                            },
            unit:           "g/dl",
            validMin:       2.5,
            validMax:       20,
            siFaktor:       0.621,
            intUnit:        "mmol/l"
        },
        {            
            id:             "mcv",
            name:           "MCV",
            loinc:          0,
            value:          null,
            refMin:         78.0,
            refMax:         94.0,
            unit:           "fl",
            validMin:       40.0,
            validMax:       150            
        },
        {            
            id:             "crp",
            name:           "CRP",
            loinc:          0,
            value:          null,
            refMin:         0.0,
            refMax:         5.0,
            unit:           "mg/l",
            validMin:       0,
            validMax:       600
        },
        {            
            id:             "ferritine",
            name:           "Ferritine",
            loinc:          0,
            value:          null,
            refMin:         {
                                female: 10,
                                male:   30
                            },
            refMax:         {
                                female: 200,
                                male:   300
                            },
            unit:           "ng/ml",
            validMin:       0,
            validMax:       2000,
            siFaktor:       0.474,
            siUnit:         "pmol/l"
        },
        {            
            id:             "sTFR",
            name:           "sol Transf Recep",
            loinc:          0,
            value:          null,
            refMin:         0.83,
            refMax:         1.76,
            unit:           "mg/dl",
            validMin:       0,
            validMax:       25
        },
        {            
            id:             "reticulocytepc",
            name:           "Reticulocyte",
            loinc:          0,
            value:          null,
            refMin:         7.0,
            refMax:         15.0,
            unit:           "%o",
            validMin:       0,
            validMax:       80
        },
        {            
            id:             "reticulocytehb",
            name:           "Reticuloyte Hb",
            loinc:          0,
            value:          null,
            refMin:         28,
            refMax:         35,
            unit:           "pg",
            validMin:       0,
            validMax:       60
        },
        {
            id:             "hematokrit",
            name:           "Hematokrit",
            loinc:          0,
            value:          null,
            refMin:         {
                                female: 37,
                                male:   43
                            },
            refMax:         {
                                female: 45,
                                male:   49
                            },
            unit:           "%",
            validMin:       0,
            validMax:       65
        },
        {
            id:             "vitb12",
            name:           "Vitamine B12",
            loinc:          0,
            value:          null,
            refMin:         310,
            refMax:         1100,
            unit:           "pg/ml",
            validMin:       0,
            validMax:       6600,
            siFaktor:       0.738,
            siUnit:         "pmol/l"
        },
        {
            id:             "folicAcid",
            name:           "Folic Acid",
            loinc:          0,
            value:          null,
            refMin:         2.0,
            refMax:         10.0,
            unit:           "ng/ml",
            validMin:       0,
            validMax:       150
        }

    ]

}