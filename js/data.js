/**
 * Copyright bei G. Füchsl - 2018
 */

"use strict";

/**
 * Funktion für die Validierung von demographischen Patientendaten
 */
function validatePatientDemographics(dataset) {

    /* Folgende IDs müssen belegt sein */
    var content = [ "perfirstname", "perlastname", "perbirthday", "permf", "perencid" ];
    
    /* Nur falls das Dataset vom Typ und von der ID her passt, dann ... */
    if (dataset.type == 'key-val' && dataset.id == 'person') {
        
        /* Durchlaufe die Daten und ... */
        for(var i in dataset.kval) {
            var pos = content.indexOf(dataset.kval[i]['id']);
            
            /* ... streiche die vorhandenen IDs aus dem Prüf-Array*/
            content.splice(pos, pos+1);

            /* ... falls in einem Datenpaar kein Wert steht, ergänze einen Dummy */
            if (dataset.kval[i]['val'] == "") {
                dataset.kval[i]['val'] = "-/-";
            }
        }

        /* Ergänze die fehlenden IDs mit einem Dummy-Wert */
        for(var i = 0; i < content.length; i++) {            
            dataset.kval.push( { id: content[i], val: '-/-' } );
        }        

        return dataset;
    }

    return null;

}

/**
 * Funktion für die Lieferung von demographischen Patientendaten
 */
function getPatientDemographics() {

    // Wenn Parameter übergeben werden, dann ...
    if (arguments.length == 1) {
        
        // ... wenn der erste Parameter eine Ressource 'Patient', dann...
        if (arguments[0].resourceType.toString() === "Patient") {
            
            // ... daraus den demographischen Datensatz zusammenstellen
            var patient = arguments[0];
            
            var dataSet = {

                type: "key-val",
                id:   "person",
                name: "Person",
                lang: "en",
                test: false,

                kval: [ 
                        { id: "perfirstname",   val: patient.name ?         patient.name[0].given.join(" ") : "-/-" },
                        { id: "perlastname",    val: patient.name ?         patient.name[0].family.join(" "): "-/-" },
                        { id: "perbirthday",    val: patient.birthDate ?    patient.birthDate.toString()    : "-/-" },
                        { id: "permf",          val: patient.gender ?       patient.gender.toString()       : "-/-" },
                        { id: "perencid",       val: patient.id ?           patient.id.toString()           : "-/-" },
                        { id: "perdiagnose",    val: null }
                    ]
            }
            
        }

    // ... ansonsten Testdatensatz zusammenstellen
    } else {
        
        var dataSet = {

            type: "key-val",
            id:   "person",
            name: "Person",
            lang: "en",
            test: true,

            kval: [ 
                    { id: "perfirstname", val: "Test app" },
                    { id: "perlastname", val: "Test Anemia" },
                    { id: "perbirthday", val: "1900-01-01" },
                    { id: "permf", val: "female" },
                    { id: "perencid", val: "000000000" },
                    { id: "perdiagnose", val: [ "Pneumonia", "Lungembolism"] }
                  ]
            
        }
            
    }
            
    return validatePatientDemographics(dataSet);

}

/**
 * Funktion für die Validierung von klinischen Patientendaten
 */
function validatePatientClinicalObservations(dataset) {

    /* Folgende IDs müssen belegt sein */
    var content = [ "weight", "height" ];
    
    /* Nur falls das Dataset vom Typ und von der ID her passt, dann ... */
    if (dataset.type == 'key-val' && dataset.id == 'patient') {
        
        /* Durchlaufe die Daten und ... */
        for(var i in dataset.kval) {
            var pos = content.indexOf(dataset.kval[i]['id']);
            
            /* ... streiche die vorhandenen IDs aus dem Prüf-Array*/
            content.splice(pos, pos+1);

            /* ... falls in einem Datenpaar kein Wert steht, ergänze einen Dummy */
            if (dataset.kval[i]['value'] == "") {
                dataset.kval[i]['value'] = "0";
                dataset.kval[i]['unit'] = "-/-";
            }
        }

        /* Ergänze die fehlenden IDs mit einem Dummy-Wert */
        for(var i = 0; i < content.length; i++) {            
            dataset.kval.push( { id: content[i], name: content[i], value: '0', unit: "-/-" } );
        }        

        return dataset;
    }

    return null;

}
/**
 * Funktion für die Lieferung von klinischen Patientendaten
 */
 function getPatientClinicalObservations() {
    
    /* Hier die FHIR-Server-Abfrage - jetzt Testwerte */    

    let dataSet = {

        type: "key-val",
        id:   "patient",
        name: "Patient",
        lang: "en",
        kval: [ 
                { id: "weight", name: "Weight", value: 79.0, unit: "kg" },
                { id: "height", name: "Height", value: 175,  unit: "cm" },                           
              ]
        
    }

    return validatePatientClinicalObservations(dataSet);
    
}

/**
 * Funktion für die Validierung von Labordaten eines Patienten
 */
function validatePatientLaboratoryObservations(dataset) {

    /* Folgende IDs müssen belegt sein */
    var content = [ "hemoglobin", "mcv", "crp", "ferritine", "sTFR", "reticulocytepc", "reticulocytehb", "hematokrit" ];
    
    /* Nur falls das Dataset vom Typ und von der ID her passt, dann ... */
    if (dataset.type == 'key-val-ref' && dataset.id == 'labor') {
        
        /* Durchlaufe die Daten und ... */
        for(var i in dataset.kval) {
            var pos = content.indexOf(dataset.kval[i]['id']);
            
            /* ... streiche die vorhandenen IDs aus dem Prüf-Array*/
            content.splice(pos, pos+1);

            /* ... falls in einem Datenpaar kein Wert steht, ergänze einen Dummy und passe das dazugehörige Dataset an */
            if (dataset.kval[i]['value'] === "" || dataset.kval[i]['value'] == null) {
                dataset.kval[i]['value'] = "0";
                dataset.kval[i]['refMin'] = "-/-";
                dataset.kval[i]['refMax'] = "-/-";
                dataset.kval[i]['unit'] = "-/-";
                dataset.kval[i]['validMin'] = "0";
                dataset.kval[i]['validMax'] = "0";
            }

            /* Falls der Referenzbereich fehlt ... */
            if (dataset.kval[i]['refMin'] === "" || dataset.kval[i]['refMin'] == null) {
                dataset.kval[i]['value'] = "0";
                dataset.kval[i]['refMin'] = "-/-";
                dataset.kval[i]['refMax'] = "-/-";
                dataset.kval[i]['unit'] = "-/-";
                dataset.kval[i]['validMin'] = "0";
                dataset.kval[i]['validMax'] = "0";
            }
            
            if (dataset.kval[i]['refMax'] === "" || dataset.kval[i]['refMax'] == null) {
                dataset.kval[i]['value'] = "0";
                dataset.kval[i]['refMin'] = "-/-";
                dataset.kval[i]['refMax'] = "-/-";
                dataset.kval[i]['unit'] = "-/-";
                dataset.kval[i]['validMin'] = "0";
                dataset.kval[i]['validMax'] = "0";
            }

            /* Falls der Validitätsbereich fehlt ... */
            /* ... setze den maximalen Validitätsbereich auf 2 x den maximalen Referenzbereich */
            if (dataset.kval[i]['validMin'] === "" || dataset.kval[i]['validMin'] == null) {
                dataset.kval[i]['validMax'] = 2 * dataset.kval[i]['refMax'];
            }

            /* ... setze den minimalen Validitätsbereich auf 0 */
            if (dataset.kval[i]['validMax'] === "" || dataset.kval[i]['validMax'] == null) {
                dataset.kval[i]['validMin'] = 0;
            }

        }

        /* Ergänze die fehlenden IDs mit einem Dummy-Wert */
        for(var i = 0; i < content.length; i++) {            
            dataset.kval.push( { id: content[i], name: content[i], value: '0', refMin: "-/-", refMax: "-/-", unit: "-/-", validMin: '0', validMax: '0' } );
        }        

        return dataset;
    }

    return null;

}

/**
 * Funktion für die Lieferung von Labordaten eines Patienten
 */
function getPatientLaboratoryObservations() {
    
    /* Hier die FHIR-Server-Abfrage - jetzt Testwerte */    
    var pContext = "test"; //getPatientContext();
    
    /* Testdatensets */    
    if (typeof pContext === "function") {
    
    var dataSet = {

        type: "key-val-ref",
        id:   "labor",
        name: "Labor",
        lang: "en",
        kval: [
            {            
                id:             "hemoglobin",
                name:           "Hemoglobin",
                loinc:          0,
                value:          7.5,
                refMin:         12.0,
                refMax:         14.0,
                unit:           "g/dl",
                validMin:       2.5,
                validMax:       20
            },
            {            
                id:             "mcv",
                name:           "MCV",
                loinc:          0,
                value:          78.0,
                refMin:         86.0,
                refMax:         96.0,
                unit:           "fl",
                validMin:       40.0,
                validMax:       150
            },
            {            
                id:             "crp",
                name:           "CRP",
                loinc:          0,
                value:          3.5,
                refMin:         0.0,
                refMax:         5.0,
                unit:           "g/dl",
                validMin:       0,
                validMax:       600
            },
            {            
                id:             "ferritine",
                name:           "Ferritine",
                loinc:          0,
                value:          20,
                refMin:         3.0,
                refMax:         300.0,
                unit:           "µg/dl",
                validMin:       0,
                validMax:       2000
            },
            {            
                id:             "sTFR",
                name:           "sol Transf Recep",
                loinc:          0,
                value:          3.0,
                refMin:         2.0,
                refMax:         5.0,
                unit:           "µg/dl",
                validMin:       0,
                validMax:       50
            },
            {            
                id:             "reticulocytepc",
                name:           "Reticulocyte",
                loinc:          0,
                value:          3.0,
                refMin:         2.0,
                refMax:         5.0,
                unit:           "%",
                validMin:       0,
                validMax:       50
            },
            {            
                id:             "reticulocytehb",
                name:           "Reticuloyte Hb",
                loinc:          0,
                value:          28,
                refMin:         26,
                refMax:         30,
                unit:           "pg",
                validMin:       0,
                validMax:       60
            },
            {
                id:             "hematokrit",
                name:           "Hematokrit",
                loinc:          0,
                value:          40,
                refMin:         35,
                refMax:         45,
                unit:           "%",
                validMin:       0,
                validMax:       65
            }

        ]

    } 
    
    } else {
        
        var dataSet = {

            type: "key-val-ref",
            id:   "labor",
            name: "Labor",
            lang: "en",
            kval: [
                {            
                    id:             "hemoglobin",
                    name:           "Hemoglobin",
                    loinc:          0,
                    value:          13,
                    refMin:         12.0,
                    refMax:         14.0,
                    unit:           "g/dl",
                    validMin:       2.5,
                    validMax:       20
                },
                {            
                    id:             "mcv",
                    name:           "MCV",
                    loinc:          0,
                    value:          91.0,
                    refMin:         86.0,
                    refMax:         96.0,
                    unit:           "fl",
                    validMin:       40.0,
                    validMax:       150
                },
                {            
                    id:             "crp",
                    name:           "CRP",
                    loinc:          0,
                    value:          3.5,
                    refMin:         0.0,
                    refMax:         5.0,
                    unit:           "g/dl",
                    validMin:       0,
                    validMax:       600
                },
                {            
                    id:             "ferritine",
                    name:           "Ferritine",
                    loinc:          0,
                    value:          2,
                    refMin:         3.0,
                    refMax:         300.0,
                    unit:           "µg/dl",
                    validMin:       0,
                    validMax:       2000
                },
                {            
                    id:             "sTFR",
                    name:           "sol Transf Recep",
                    loinc:          0,
                    value:          8.0,
                    refMin:         2.0,
                    refMax:         5.0,
                    unit:           "µg/dl",
                    validMin:       0,
                    validMax:       50
                },
                {            
                    id:             "reticulocytepc",
                    name:           "Reticulocyte",
                    loinc:          0,
                    value:          1.0,
                    refMin:         2.0,
                    refMax:         5.0,
                    unit:           "%",
                    validMin:       0,
                    validMax:       50
                },
                {            
                    id:             "reticulocytehb",
                    name:           "Reticuloyte Hb",
                    loinc:          0,
                    value:          6.0,
                    refMin:         2.0,
                    refMax:         5.0,
                    unit:           "pg",
                    validMin:       0,
                    validMax:       15
                }   
    
            ]
    
        } 

    }
    
    return validatePatientLaboratoryObservations(dataSet);
}
