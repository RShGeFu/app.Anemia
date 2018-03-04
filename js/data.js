/**
 * Copyright bei G. Füchsl - 2018
 */

"use strict";

/**
 * Closure für die gesammelten Observations eines Patient - inhaltlich und zeitlich geordnet für eine weitere Verwendung
 */
var observationSet = (function() {

    var obs = [];

    return {        
        clear:  function() { obs = []; },
        add:    function(o) { obs.push(o); },
        get:    function(n) { 
                    if (n >= 0 && n < obs.length) {
                        return obs[n]; 
                    }
                    return null;
                }
    }

})();

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
    
    var dataSet = { };    
    
    // Wenn Parameter übergeben werden, dann ...
    if (arguments.length == 1) { 
        
        // ... wenn der erste Parameter eine Ressource 'Patient', dann...
        if (arguments[0].resourceType.toString() === "Patient") {
            
            // ... daraus den demographischen Datensatz zusammenstellen
            var patient = arguments[0];
            
            dataSet = {

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
    
    } else {
        
        // ansonsten liefere: Allgemeiner Testdatensatz - wird übergeben falls keine Parameter an die Funktion übergeben werden
        dataSet = {

            type: "key-val",
            id:   "person",
            name: "Person",
            lang: "en",
            test: true,

            kval: [ 
                    { id: "perfirstname", val: "Test app" },
                    { id: "perlastname", val: "Test Anemia" },
                    { id: "perbirthday", val: "1900-01-01" },
                    { id: "permf", val: "male" },
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
    
    var dataSet = { };

    /* Wenn Argumente übergeben werden ... */
    if (arguments.length == 1) {
        
        // dann sind es vermutlich Observations... (je nach Abfrage: FHIR.client oder $ajax.GET!!)
        var observations = arguments[0];
        var weightObs = [],
            heightObs = [];

        // ... wenn es aber ein Bundle ist, dann ziehe die Observations heraus...
        if (observations.resourceType === "Bundle") {
            let extract = [];
            for(var i = 0; i < observations.entry.length; i++) {
                extract.push(observations.entry[i].resource);
            }            
            observations = extract;
        }
        
        // ... gehe sie durch ...
        for(var i = 0; i < observations.length; i++) {            
            // ... wenn ja...            
            if (observations[i].resourceType === "Observation") {                    
                // ... dann schaue nach, ob es sich um LOINCs und den LOINC-Code 'Körpergewicht' handelt ...
                // (Ein anderes Code-System wird nicht akzeptiert)
                if (observations[i].code.coding[0].system === 'http://loinc.org' && observations[i].code.coding[0].code === '3141-9') {
                    // ... dann merke Dir die Observation in einem eigenen Array.                    
                    weightObs.push(observations[i]);                    
                }
                // Verfahre genauso mit der Körpergröße!
                if (observations[i].code.coding[0].system === 'http://loinc.org' && observations[i].code.coding[0].code === '8302-2') {                                        
                    heightObs.push(observations[i]);                    
                }
            }
        }

        // Sortiere die Arrays
        weightObs.sort(function(a, b) {
            var d1 = new Date(a.effectiveDateTime),
                d2 = new Date(b.effectiveDateTime);
            return d2.valueOf() - d1.valueOf();
        });
        
        heightObs.sort(function(a, b) {
            var d1 = new Date(a.effectiveDateTime),
                d2 = new Date(b.effectiveDateTime);
            return d2.valueOf() - d1.valueOf();
        });
        
        // Füge die Arrays den Patientenbeboachtungsdaten hinzu
        observationSet.add(weightObs);
        observationSet.add(heightObs);
        
        // Setze das Dataset zusammen - und zwar nehme für Größe und Gewicht den jeweils neuesten Wert der Observations           
        dataSet = {

            type: "key-val",
            id:   "patient",
            name: "Patient",
            lang: "en",
            kval: [ 
                    {   id:     "weight",
                        name:   "Weight",
                        value:  weightObs[0] != null ? weightObs[0].valueQuantity.value : 0, 
                        unit:   weightObs[0] != null ? weightObs[0].valueQuantity.unit : ""
                    },
                    {   id:     "height", 
                        name:   "Height", 
                        value:  heightObs[0] != null ? heightObs[0].valueQuantity.value : 0,
                        unit:   heightObs[0] != null ? heightObs[0].valueQuantity.unit : ""
                    }
                ]
            }        

    } else {    
        
        // ansonsten liefere: Allgemeiner Testdatensatz - wird übergeben falls keine Parameter an die Funktion übergeben werden
        dataSet = {

            type: "key-val",
            id:   "patient",
            name: "Patient",
            lang: "en",
            kval: [ 
                    { id: "weight", name: "Weight", value: 75, unit: "kg (test)" },
                    { id: "height", name: "Height", value: 175, unit: "cm (test)" },                           
                ]
        } 
        
    }

    return validatePatientClinicalObservations(dataSet);
    
}

/**
 * Funktion für die Validierung von Labordaten eines Patienten
 */
function validatePatientLaboratoryObservations(dataset) {

    /* Folgende IDs im Dataset müssen belegt sein */    
    var content = [];    
    for(var i = 0; i < configuration.defaultReference.length; i++) {        
        if (configuration.defaultReference[i].required) {            
            content.push(configuration.defaultReference[i]['id']);     // Suchen und Übernehmen der Pflichtparameter aus der Konfiguration            
        }
    }
    
    /* Nur falls das Dataset vom Typ und von der ID her passt, dann ... */
    if (dataset.type == 'key-val-ref' && dataset.id == 'labor') {
        
        /* Durchlaufe die Daten und ... */
        for(var i in dataset.kval) {
            var pos = content.indexOf(dataset.kval[i]['id']),
                posRef = configuration.defaultReference.findIndex(j => j.id === content[pos]);            
            
            /* ... streiche die vorhandenen IDs aus dem Prüf-Array*/
            content.splice(pos, pos+1);
            
            /* ... falls in einem Datenpaar kein Wert steht, ergänze einen Dummy und passe das dazugehörige Dataset an */
            if (dataset.kval[i]['value'] === "" || dataset.kval[i]['value'] == null) {
                dataset.kval[i]['value'] = "0";
                dataset.kval[i]['refMin'] = typeof configuration.defaultReference[posRef] === 'object' ? configuration.defaultReference[posRef].refMin.male : configuration.defaultReference[posRef].refMin;
                dataset.kval[i]['refMax'] = typeof configuration.defaultReference[posRef] === 'object' ? configuration.defaultReference[posRef].refMax.male : configuration.defaultReference[posRef].refMax;
                dataset.kval[i]['unit'] = configuration.defaultReference[posRef].unit;
                dataset.kval[i]['validMin'] = configuration.defaultReference[posRef].validMin;
                dataset.kval[i]['validMax'] = configuration.defaultReference[posRef].validMax;
            }

            /* Falls der Referenzbereich fehlt ... */
            if (dataset.kval[i]['refMin'] === "" || dataset.kval[i]['refMin'] == null) {
                dataset.kval[i]['value'] = "0";
                dataset.kval[i]['refMin'] = typeof configuration.defaultReference[posRef] === 'object' ? configuration.defaultReference[posRef].refMin.male : configuration.defaultReference[posRef].refMin;
                dataset.kval[i]['refMax'] = typeof configuration.defaultReference[posRef] === 'object' ? configuration.defaultReference[posRef].refMax.male : configuration.defaultReference[posRef].refMax;
                dataset.kval[i]['unit'] = configuration.defaultReference[posRef].unit;
                dataset.kval[i]['validMin'] = configuration.defaultReference[posRef].validMin;
                dataset.kval[i]['validMax'] = configuration.defaultReference[posRef].validMax;
            }
            
            if (dataset.kval[i]['refMax'] === "" || dataset.kval[i]['refMax'] == null) {
                dataset.kval[i]['value'] = "0";
                dataset.kval[i]['refMin'] = typeof configuration.defaultReference[posRef] === 'object' ? configuration.defaultReference[posRef].refMin.male : configuration.defaultReference[posRef].refMin;
                dataset.kval[i]['refMax'] = typeof configuration.defaultReference[posRef] === 'object' ? configuration.defaultReference[posRef].refMax.male : configuration.defaultReference[posRef].refMax;
                dataset.kval[i]['unit'] = configuration.defaultReference[posRef].unit;
                dataset.kval[i]['validMin'] = configuration.defaultReference[posRef].validMin;
                dataset.kval[i]['validMax'] = configuration.defaultReference[posRef].validMax;
            }

            /* Falls der Validitätsbereich fehlt ... */
            /* ... setze den maximalen Validitätsbereich auf 2 x den maximalen Referenzbereich */
            if (dataset.kval[i]['validMax'] === "" || dataset.kval[i]['validMax'] == null) {
                dataset.kval[i]['validMax'] = 2 * dataset.kval[i]['refMax'];
            }

            /* ... setze den minimalen Validitätsbereich auf 0 */
            if (dataset.kval[i]['validMin'] === "" || dataset.kval[i]['validMin'] == null) {
                dataset.kval[i]['validMin'] = 0;
            }

        }
        
        /* Ergänze die fehlenden IDs mit einem Dummy-Wert */
        for(var i = 0; i < content.length; i++) {
            var posRef = configuration.defaultReference.findIndex(j => j.id === content[pos]);                      
            dataset.kval.push( {    
                                id:         configuration.defaultReference[posRef].id,
                                name:       configuration.defaultReference[posRef].name,
                                value:      '0', 
                                refMin:     typeof configuration.defaultReference[posRef] === 'object' ? configuration.defaultReference[posRef].refMin.male : configuration.defaultReference[posRef].refMin,
                                refMax:     typeof configuration.defaultReference[posRef] === 'object' ? configuration.defaultReference[posRef].refMax.male : configuration.defaultReference[posRef].refMax,
                                unit:       configuration.defaultReference[posRef].unit,
                                validMin:   configuration.defaultReference[posRef].validMin,
                                validMax:   configuration.defaultReference[posRef].validMax
                            } );
        }        

        return dataset;
    }

    return null;

}

/**
 * Funktion für die Lieferung von Labordaten eines Patienten
 */
function getPatientLaboratoryObservations() {
    
    var dataSet = { };

    /* Wenn Argumente übergeben werden ... */
    if (arguments.length == 1) {
         
        // dann sind es vermutlich Observations... (je nach Abfrage: FHIR.client oder $ajax.GET!!)
        var observations = arguments[0],
            labValues = [];
        // ... lege für die einzelnen, in der 'configuration' angelegten Observations (je nach LOINC) je ein Merkfeld an ...
        for(var i = 0; i < configuration.defaultReference.length; i++) {
            labValues[configuration.defaultReference[i].loinc] = [];
        }        
        
        // ... wenn es sich um ein übergebenes Bundle handelt, dann ziehe die Observations heraus...
        if (observations.resourceType === "Bundle") {
            let extract = [];
            for(var i = 0; i < observations.entry.length; i++) {
                extract.push(observations.entry[i].resource);
            }            
            observations = extract;
        } 
        
        // ... gehe dann die Observations durch ...
        for(var i = 0; i < observations.length; i++) {            
            // ... wenn es tatsächlich eine Observation ist (nochmals eine Datenvalidierung!)...            
            if (observations[i].resourceType === "Observation") {      
                // ... dann schaue nach, ob es sich um LOINCs und den LOINC-Code des in der Konfiguration festgelegt Laborwertes handelt ...
                // (Ein anderes Code-System wird nicht akzeptiert)                
                for(var j = 0; j < configuration.defaultReference.length; j++) {                    
                    if (observations[i].code.coding[0].system === 'http://loinc.org' && observations[i].code.coding[0].code === configuration.defaultReference[j].loinc) {                        
                        // ... dann merke Dir die Observation in dem eigens angelegten Array
                        labValues[configuration.defaultReference[j].loinc].push(observations[i]);                        
                    }
                }
            }
        }
        
        for(var i = 0; i < configuration.defaultReference.length; i++) {
            // ... sortiere sie ...        
            labValues[configuration.defaultReference[i].loinc].sort(function(a, b) {
                var d1 = new Date(a.meta.lastUpdated),
                    d2 = new Date(b.meta.lastUpdated);
                return d2.valueOf() - d1.valueOf();
            });
            // ... und füge das Array den Patientenbeboachtungsdaten hinzu
            observationSet.add(labValues[configuration.defaultReference[i].loinc]);
        }            
        
        /* Noch Testdatensets - muß noch an die Observations angepasst werden!! */    
        dataSet = {

            type: "key-val-ref",
            id:   "labor",
            name: "Labor",
            lang: "en",
            kval: [
                {            
                    id:             "hemoglobin",
                    name:           "Hemoglobin",                    
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
        
        // ansonsten liefere: Allgemeine Testdatensatz - wird übergeben falls keine Parameter an die Funktion übergeben werden  
        dataSet = {

            type: "key-val-ref",
            id:   "labor",
            name: "Labor",
            lang: "en",
            kval: [
                {            
                    id:             "hemoglobin",
                    name:           "Hemoglobin",                    
                    value:          13.0,
                    refMin:         12.0,
                    refMax:         14.0,
                    unit:           "g/dl",
                    validMin:       2.5,
                    validMax:       20
                },
                {            
                    id:             "mcv",
                    name:           "MCV",
                    value:          90.0,
                    refMin:         86.0,
                    refMax:         96.0,
                    unit:           "fl",
                    validMin:       40.0,
                    validMax:       150.0
                },
                {            
                    id:             "crp",
                    name:           "CRP",
                    value:          3.5,
                    refMin:         0.001,
                    refMax:         5.0,
                    unit:           "g/dl",
                    validMin:       0.001,
                    validMax:       600
                },
                {            
                    id:             "ferritine",
                    name:           "Ferritine",
                    value:          20.0,
                    refMin:         3.0,
                    refMax:         300.0,
                    unit:           "µg/dl",
                    validMin:       0.001,
                    validMax:       7000.0
                },
                {            
                    id:             "sTFR",
                    name:           "sol Transf Recep",
                    value:          3.0,
                    refMin:         2.0,
                    refMax:         5.0,
                    unit:           "µg/dl",
                    validMin:       0.001,
                    validMax:       25.0
                },
                {            
                    id:             "reticulocytepc",
                    name:           "Reticulocyte",
                    value:          3.0,
                    refMin:         2.0,
                    refMax:         5.0,
                    unit:           "%",
                    validMin:       0.001,
                    validMax:       20.0
                },
                {            
                    id:             "reticulocytehb",
                    name:           "Reticuloyte Hb",
                    value:          28.0,
                    refMin:         26.0,
                    refMax:         30.0,
                    unit:           "pg",
                    validMin:       1,
                    validMax:       60.0
                },
                {
                    id:             "hematokrit",
                    name:           "Hematokrit",
                    value:          36,
                    refMin:         35,
                    refMax:         45,
                    unit:           "%",
                    validMin:       0.001,
                    validMax:       65
                }
    
            ]
    
        } 

    }
    
    return validatePatientLaboratoryObservations(dataSet);
}
