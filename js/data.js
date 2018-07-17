/**
 * Copyright bei G. Füchsl - 2018
 */

"use strict";

/**
 * Closure für die gesammelten Observations eines Patient - inhaltlich und zeitlich geordnet für eine weitere Verwendung sowie als Liste 
 */
var observationSet = (function() {

    var obs = [],
        list = [],
        pat = null;

    return {
        // Observations löschen
        clear:      function() { obs = []; },
        // Observations anfügen
        add:        function(n, o) {                                         
                        obs[n] = [];
                        obs[n].push(o);                                        
                    },
        // Observations auslesen und liefern
        get:        function(n) {
                        if (typeof n === 'number') {
                            if (n >= 0 && n < obs.length) {
                                return obs[n]; 
                            }
                        } else if (typeof n === 'string') {
                            return obs[n];
                        }
                        return null;
                    },
        // Liste von Observations festlegen
        addList:    function(l) {
                        this.list = l;
                    },
        // Liste der Observations abfragen
        getList:    function() {
                        return this.list;
                    },
        // Paitenten merken
        addPatient: function(p) {
                        this.pat = p;                        
                    },
        // Patienten liefern
        getPatient: function() {
                        return this.pat;
                    },
        // Patienten pseudonymisieren
        hidePatient:function() {
                        // Wenn ein Patient definiert ist ...
                        if (this.pat) {
                            
                            // ... sein Name vorhanden ist ...                            
                            if (this.pat.name) {
                                // ... dann die Initialen definieren ...
                                var pg = this.pat.name[0].given.join ? this.pat.name[0].given.join(" ") : this.pat.name[0].given,
                                    pf = this.pat.name[0].family.join ? this.pat.name[0].family.join(" ") : this.pat.name[0].family;
                                // ... in die Resource schreiben und ...
                                this.pat.name[0].family = pf ? pf.substring(0, 1) + "." : "";
                                this.pat.name[0].given = pg ? pg.substring(0, 1) + "." : ""; 
                                // ... etwaige Textkennungen mit Namen löschen und ...
                                if (this.pat.name[0].text) {
                                    this.pat.name[0].text = "";   
                                }
                            }

                            // ... das Geburtsdatum verändern ...
                            if (this.pat.birthDate) {
                                this.pat.birthDate = "1900-01-01";
                            }
                            
                            // ... und wenn ein Narrativ der Resource vorhanden ist, hier die Initialen des Patienten einfügen
                            if (this.pat.text) { 
                                this.pat.text.div = "<div xmlns='http://www.w3.org/1999/xhtml'>" + pf.substring(0, 1) + "." + pg.substring(0, 1) + "." + "</div>";
                            }
                        }                        
                    },
        // Observations, außer denjenigen der Konfiguration, löschen
        rejectObservations: function(accept) {
                        /**
                         * accept kann sein:
                         * 1. Array mit Strings, die LOINCs enthalten
                         * 2. Array mit Objekten, die einen LOINC enthalten bzw. thematisch dazu passend weitere LOINCs in einem eigenen Array,
                         *      d.h. Objekte aus der Configuraton
                         */

                        var accepted = [];      // Liste der akzeptierten LOINCs

                        // Akzeptierte LOINCs zusammenstellen aus 'accept' - entweder ein Array von Strings oder Objekten, s.o.
                        for(var i = 0; i < accept.length; i++) {                            
                            if ('loinc' in accept[i]) {
                                accepted.push(accept[i].loinc);                            
                                if ('acceptedLOINC' in accept[i]) {
                                    for(var j = 0; j < accept[i].acceptedLOINC.length; j++) {
                                        accepted.push(accept[i].acceptedLOINC[j]);                                    
                                    }   
                                }
                            } else {
                                if (typeof accept[i] === 'string') {
                                    accepted.push(accept[i]);
                                }
                            }         
                        }

                        // 'obs' enthält bereits nur die Daten, die in der Configuration definiert sind ...
                        // 'list' ist zu bereinigen
                        for(var i = 0; i < this.list.length; i++) {
                            var pos = accepted.findIndex(j => j === this.list[i].code.coding[0].code);
                            if (pos == -1) {
                                this.list.splice(i, 1);
                                i -= 1;                 // Nach dem Entfernen eines Elements Zähler um eine Position zurücksetzen, 
                                                        // um auf dem nachgerutschten Element ggf. das Splicing wieder beginnen
                            }
                        }

                        // Visualisierung des Ergebnisses - aktuell ausgeschaltet
                        // Ein Möglichkeit wäre das Ein-/Ausschalten über URL-Parameter zu steuern ...
                        if (false) {
                            var count = 0;
                            console.log(this.list);
                            for(var i = 0; i < this.list.length; i++) {
                                var pos = accepted.findIndex(j => j === this.list[i].code.coding[0].code);
                                console.log(pos);
                                if (pos > -1) {
                                    count += 1;
                                }
                            }
                            console.log(count);
                        }

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
            var patient = arguments[0], pg, pf;

            // Unterschied von DSTU2 zu STU3 ...
            if (patient.name) {
                pg = patient.name[0].given.join ? patient.name[0].given.join(" ") : patient.name[0].given;
                pf = patient.name[0].family.join ? patient.name[0].family.join(" ") : patient.name[0].family;
            }
            
            dataSet = {

                type: "key-val",
                id:   "person",
                name: "Person",
                lang: "en",
                test: false,

                kval: [ 
                        { id: "perfirstname",   val: patient.name ?         pg : "-/-" },
                        { id: "perlastname",    val: patient.name ?         pf : "-/-" },
                        { id: "perbirthday",    val: patient.birthDate ?    patient.birthDate.toString()    : "-/-" },
                        { id: "permf",          val: patient.gender ?       patient.gender.toString()       : "-/-" },
                        { id: "perencid",       val: patient.id ?           patient.id.toString()           : "-/-" },
                        { id: "perdiagnose",    val: null }
                    ]
            }

            observationSet.addPatient(patient);
            
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
    
    var dataSet = { };

    /* Wenn Argumente übergeben werden ... */
    if (arguments.length == 1) {
        
        // dann sind es vermutlich Observations... (je nach Abfrage: FHIR.client oder $ajax.GET!!)
        var observations = arguments[0];
        var weightObs = [],
            heightObs = [],
            extract = [];

        // ... wenn es aber ein Bundle ist, dann ziehe die Observations heraus...
        if (observations.resourceType === "Bundle") {            

            // Sind schon mal Observations gesammelt worden?
            if (observationSet.getList() != null) {

                observations = observationSet.getList();
                
            } else {
                
                if ('link' in observations) {
                    let nextPages = observations.link;
                    // Aus dem Link-Array die nächste Seite suchen (nicht zwingend in link[1] ...)
                    let i, pos = nextPages.findIndex(i => i.relation === 'self');
                    // Hole alle restlichen Observations vom Server und hänge sie an ...
                    if (pos > -1) {                    
                        getAllRemainingObservationsFromTheServer(nextPages[pos].url, extract, 0);
                        observations = extract;
                    }
                }

            }

        }
        
        // ... gehe sie durch ...
        for(var i = 0; i < observations.length; i++) {            
            // ... wenn ja...            
            if (observations[i].resourceType === "Observation") {                    
                // ... dann schaue nach, ob es sich um LOINCs und den LOINC-Code 'Körpergewicht' (zwei Codes!) handelt ...
                // (Ein anderes Code-System wird nicht akzeptiert)
                if (observations[i].code.coding[0].system === 'http://loinc.org' && observations[i].code.coding[0].code === '3141-9') {
                    // ... dann merke Dir die Observation in einem eigenen Array.                    
                    weightObs.push(observations[i]);                    
                }
                if (observations[i].code.coding[0].system === 'http://loinc.org' && observations[i].code.coding[0].code === '29463-7') {
                    // ... dann merke Dir die Observation in einem eigenen Array.                    
                    weightObs.push(observations[i]);                    
                }
                // Verfahre genauso mit der Körpergröße!
                if (observations[i].code.coding[0].system === 'http://loinc.org' && observations[i].code.coding[0].code === '8302-2') {                                        
                    heightObs.push(observations[i]);                    
                }
            }
        }

        // Sortiere die Arrays - zeitlich am besten mit 'effectiveDateTime', in zweiter Linie mit 'meta.lastUpdate' ...
        weightObs.sort(function(a, b) {
            var d1 = new Date(a.effectiveDateTime === 'undefined' ? a.meta.lastUpdated : a.effectiveDateTime),
                d2 = new Date(b.effectiveDateTime === 'undefined' ? b.meta.lastUpdated : b.effectiveDateTime);
            return d2.valueOf() - d1.valueOf();
        });
        
        heightObs.sort(function(a, b) {
            var d1 = new Date(a.effectiveDateTime === 'undefined' ? a.meta.lastUpdated : a.effectiveDateTime),
                d2 = new Date(b.effectiveDateTime === 'undefined' ? b.meta.lastUpdated : b.effectiveDateTime);
            return d2.valueOf() - d1.valueOf();
        });
        
        // Füge die Arrays den Patientenbeboachtungsdaten hinzu
        observationSet.add('weight', weightObs);
        observationSet.add('height', heightObs);
        
        var weightRounded = weightObs[0] != null ? Math.round(weightObs[0].valueQuantity.value * 10) / 10 : 0;
        var heightRounded = heightObs[0] != null ? Math.round(heightObs[0].valueQuantity.value * 10) / 10 : 0;
        
        // Setze das Dataset zusammen - und zwar nehme für Größe und Gewicht den jeweils neuesten Wert der Observations           
        dataSet = {

            type: "key-val",
            id:   "patient",
            name: "Patient",
            lang: "en",
            kval: [ 
                    {   id:     "weight",
                        name:   "Weight",
                        value:  weightRounded,
                        unit:   weightObs[0] != null ? weightObs[0].valueQuantity.unit : ""
                    },
                    {   id:     "height", 
                        name:   "Height", 
                        value:  heightRounded,
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
        
        var pos, posRef;
        /* Durchlaufe die Daten und ... */        
        for(var i in dataset.kval) {
            // Suche 
            pos = content.indexOf(dataset.kval[i]['id']);
            posRef = configuration.defaultReference.findIndex(j => j.id === content[pos]);            
            
            /* ... streiche die vorhandenen IDs aus dem Prüf-Array*/
            content.splice(pos, pos+1);
            
            /* ... falls in einem Datenpaar kein Wert steht, ergänze einen Dummy und passe das dazugehörige Dataset an */
            if (dataset.kval[i]['value'] === "" || dataset.kval[i]['value'] == null) {
                dataset.kval[i]['value'] = "0";
            }

            /* Falls der Referenzbereich fehlt ... */
            if (dataset.kval[i]['refMin'] === "" || dataset.kval[i]['refMin'] == null) {
                dataset.kval[i]['refMin'] = typeof configuration.defaultReference[posRef].refMin === 'object' ? configuration.defaultReference[posRef].refMin[dataset['gender']] : configuration.defaultReference[posRef].refMin;
            }
            
            if (dataset.kval[i]['refMax'] === "" || dataset.kval[i]['refMax'] == null) {
                dataset.kval[i]['refMax'] = typeof configuration.defaultReference[posRef].refMax === 'object' ? configuration.defaultReference[posRef].refMax[dataset['gender']] : configuration.defaultReference[posRef].refMax;
            }

            /* Falls die Einheit fehlt ... */
            if (dataset.kval[i]['unit'] === "" || dataset.kval[i]['unit'] == null) {
                dataset.kval[i]['unit'] = configuration.defaultReference[posRef].unit;
            }

            /* Falls der Name fehlt ... */
            if (dataset.kval[i]['name'] === "" || dataset.kval[i]['name'] == null) {
                dataset.kval[i]['name'] = configuration.defaultReference[posRef].name;
            }

            /* Falls der Validitätsbereich fehlt ... */
            /* ... setze den maximalen Validitätsbereich auf 2 x den maximalen Referenzbereich */
            if (dataset.kval[i]['validMax'] === "" || dataset.kval[i]['validMax'] == null) {
                dataset.kval[i]['validMax'] = configuration.defaultReference[posRef]['validMax'];
            }

            /* ... setze den minimalen Validitätsbereich auf 0 */
            if (dataset.kval[i]['validMin'] === "" || dataset.kval[i]['validMin'] == null) {
                dataset.kval[i]['validMin'] = configuration.defaultReference[posRef]['validMin'];
            }

        }
        
        /* Ergänze die fehlenden IDs mit einem Dummy-Wert */
        for(var i = 0; i < content.length; i++) {
            var posRef = configuration.defaultReference.findIndex(j => j.id === content[i]);                                  
            dataset.kval.push( {    
                                id:         configuration.defaultReference[posRef].id,
                                name:       configuration.defaultReference[posRef].name,
                                loinc:      configuration.defaultReference[posRef].loinc,
                                value:      '0',
                                refMin:     typeof configuration.defaultReference[posRef].refMin === 'object' ? configuration.defaultReference[posRef].refMin[dataset['gender']] : configuration.defaultReference[posRef].refMin,
                                refMax:     typeof configuration.defaultReference[posRef].refMax === 'object' ? configuration.defaultReference[posRef].refMax[dataset['gender']] : configuration.defaultReference[posRef].refMax,
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
 * Funktion für die komplette Datenakquise aller Pages vom Server bei einem Request
 * @param {*} requestedUrl
 * @param {*} items 
 * @param {*} count
 */
function getAllRemainingObservationsFromTheServer(requestedUrl, items, count) {            
        
        $.ajax({
                    url:    requestedUrl,   
                    async:  false,                      // Nicht schön, aber sonst vom Gesamtablauf her nicht gut lösbar      
                    type:   "GET",
                    dataType: "json",
                    headers: {
                            "Authorization": "Bearer " + accessToken.get()
                    } 
                }).done(function(result) {
                    
                    var nextPages, pos_n, pos_s;                
                
                    // Observations extrahieren
                    if (result.resourceType === 'Bundle') {
                        for(let i = 0; i < result.entry.length; i++) {
                            items.push(result.entry[i].resource);
                        }
                    }
                    observationSet.addList(items); // Es kommt die aktuelle Liste in die ObservationSet                    
                    
                    // Wenn eine weitere Datenseite auf dem Server liegt ...
                    if ('link' in result) {               
                        nextPages = result.link;                    
                        pos_n = nextPages.findIndex(i => i.relation === 'next');                                                                                                
                        if (pos_n > -1) {
                            // Einen weiteren Request durchführen und die Daten anhängen ...
                            getAllRemainingObservationsFromTheServer(nextPages[pos_n].url, items, count+1);
                        } else {
                        }
                    }

                });

}

/**
 * Die (Hilfs-)Funktion liefert die Basisstruktur für die native Datenstruktur, die an den Entscheidungsalgorithmus und die Kartenvisualisierung weiter-
 * gegeben wird
 */
function getDataSetBasis() {
    return {         
        type: "key-val-ref",
        id:   "labor",
        name: "Labor",
        lang: "en",
        kval: [],
        gender: "female"
    }
}

/**
 * Funktion für die Lieferung von Labordaten eines Patienten
 */
function getPatientLaboratoryObservations() {
    
    // Grundstruktur des Datasets für die Funktionsrückgabe festlegen
    var dataSet = getDataSetBasis();

    /* Wenn Argumente an die Funktion übergeben werden ... */
    if (arguments.length == 2) {
         
        // ... dann sind es vermutlich Observations und Patientendaten... (je nach Abfrage: FHIR.client oder $ajax.GET!!)
        var observations = arguments[0],
            patient = arguments[1],
            labValues = [],
            extract = [];
        
        // ... gleich das Patientengeschlecht merken, sofern vorhanden, ansonsten wie bei den Testdaten 'weiblich' eintragen ...
        dataSet.gender = patient.gender != "" && typeof patient.gender != 'undefined' ? patient.gender : "female";

        // ... lege für die einzelnen, in der 'configuration' angelegten Observations (je nach LOINC) je ein Merkfeld an ...        
        for(var i = 0; i < configuration.defaultReference.length; i++) {
            labValues[configuration.defaultReference[i].loinc] = [];
        }        
        
        // ... wenn es sich um ein übergebenes Bundle handelt, dann ziehe die Observations heraus...
        if (observations.resourceType === "Bundle") {

            // Sind schon mal Observations gesammelt worden?
            if (observationSet.getList() != null) {

                observations = observationSet.getList();

            } else {

                if ('link' in observations) {
                    let nextPages = observations.link;
                    // Aus dem Link-Array die nächste Seite suchen (nicht zwingend in link[1] ...)
                    let i, pos = nextPages.findIndex(i => i.relation === 'self');
                    // Hole alle restlichen Observations vom Server und hänge sie an ...
                    if (pos > -1) {                    
                        getAllRemainingObservationsFromTheServer(nextPages[pos].url, extract, 0);
                        observations = extract;                        
                    }
                }

            }

        } else {
            
            observationSet.addList(observations);
            
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

                    // Hier findet ein Mapping statt - wenn eine Observation gefunden wird, die in 'acceptedLOINC' der
                    // Konfiguration aufgeführt ist, könnte diese in das Array 'labValues' zusätzlich geschoben werden!
                    // In der Datenvalidierung später muss dies ggf. berücksichtigt werden
                    
                    // Derzeit sind die Observations partiell doppelt vorhanden, da oben isoliert ein einzelner LOINC-Code abgefragt wird
                    // und hier das Array 'acceptedLOINC' durchgegangen wird, das den Code nochmals enthält....
                    if (observations[i].code.coding[0].system === 'http://loinc.org' && 
                        configuration.defaultReference[j].acceptedLOINC.find(
                                                                        // Anonyme Funktion zur Entscheidung
                                                                        function(toTest) {
                                                                            return toTest == observations[i].code.coding[0].code;
                                                                        })) {                        
                        labValues[configuration.defaultReference[j].loinc].push(observations[i]);                        
                    }
                }
            }
        }

        // Mapping für die Hämoglobin-Konzentration (mit LOINC-Code 718-7) zeigen ...
        // ...damit Versuch semantische Interoperabilität herzustellen.
        var codes = "";
        for(var i = 0; i < labValues['718-7'].length; i++) {
            codes += labValues['7-18-7'][i].code.coding[0].code + "\n";
        }
        alert(codes === "" ? "Keine LOINC-Codes für Hämoglobin-Konzentration enthalten ..." : "Enthaltene LOINC-Codes für Hämoglobin-Konzentration: \n" + codes);

        // ... dann ...
        for(var i = 0; i < configuration.defaultReference.length; i++) {
            
            // ... sortiere sie ...        
            labValues[configuration.defaultReference[i].loinc].sort(function(a, b) {
                // Wähle als Sortierung am besten 'effectiveDateTime', in zweiter Linie 'meta.lastUpdated'...
                var d1 = new Date(a.effectiveDateTime === 'undefined' ? a.meta.lastUpdated : a.effectiveDateTime),
                    d2 = new Date(b.effectiveDateTime === 'undefined' ? b.meta.lastUpdated : b.effectiveDateTime);
                return d2.valueOf() - d1.valueOf();
            });
            
            // ... füge das Array den Patientenbeboachtungsdaten hinzu
            observationSet.add(configuration.defaultReference[i].id, labValues[configuration.defaultReference[i].loinc]);
            
            // ... und füge an das Dataset den neuesten Wert ein, wenn tatsächlich Werte abgefragt werden konnten
            if (labValues[configuration.defaultReference[i].loinc].length > 0) {                
                
                // Aufpassen: als erstes nach den Referenzwerten vom Patienten schauen: 
                // sind sie vorhanden, dann nimm sie, ansonsten nimm geschlechtsbezogen diejenigen aus der configuration                    
                var r1 = 0, r2 = 0;                
                if (typeof labValues[configuration.defaultReference[i].loinc][0].referenceRange === 'undefined') {
                    r1 = patient.gender === 'male' ? configuration.defaultReference[i].refMin.male : configuration.defaultReference[i].refMin.female;
                } else {
                    r1 = labValues[configuration.defaultReference[i].loinc][0].referenceRange[0].low.value;
                }
                
                if (typeof labValues[configuration.defaultReference[i].loinc][0].referenceRange === 'undefined') {
                    r2 = patient.gender === 'male' ? configuration.defaultReference[i].refMax.male : configuration.defaultReference[i].refMax.female;
                } else {
                    r2 = labValues[configuration.defaultReference[i].loinc][0].referenceRange[0].high.value;
                }

                // Eigentliche Daten zusammenstellen und anhängen             
                var labParam = {
                    // aus der Konfiguration Daten übernehmen
                    id:         configuration.defaultReference[i].id,     
                    loinc:      configuration.defaultReference[i].loinc,
                    name:       configuration.defaultReference[i].name,

                    // Patientendaten
                    value:      labValues[configuration.defaultReference[i].loinc][0].valueQuantity.value,
                    refMin:     r1,
                    refMax:     r2,
                    unit:       labValues[configuration.defaultReference[i].loinc][0].valueQuantity.unit,
                    
                    // aus der Konfiguration Daten übernehmen
                    validMin:   configuration.defaultReference[i].validMin,
                    validMax:   configuration.defaultReference[i].validMax,                    
                }
                dataSet.kval.push(labParam);
            }

        }                 
        
        /* Testdatenset - bleibt für Testzwecke zur sofortigen Aktivierung im Code als Kommentierung enthalten

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

        } */
    
    } else {
        
        /* ansonsten liefere: Allgemeine Testdatensatz - wird übergeben falls keine Parameter an die Funktion übergeben werden
            
            Medizinische Kommunikations-Realität der Abkürzungen mit impliziten Wissensergänzungen - ein kleines Szenario:
            Der Arzt 1 fragt den Arzt 2: 'Wie schätzt Du die Anämie bei Patient X ein? Der Hb-Wert ist bei 13...
            
            So ist der Testdatensatz aufgebaut...
            Die Validierung muß dann alle benötigten Werte und Wertebereiche, die die Kollegen implizit wissen, ergänzen.
            Zwar kommen bei der FHIR-Serverabfrage viele Daten incl. Referenzbereich und Einheit an, eine Daten-Validierung muß
            jedoch dennoch stattfinden, um die Funktionalität der App weitgehendst sicherzustellen!
        */
        dataSet.kval = [
                {            
                    id:             "hemoglobin",                    
                    value:          13.0,                    
                },
                {            
                    id:             "mcv",                    
                    value:          90.0,
                },
                {            
                    id:             "crp",                    
                    value:          3.5,
                },
                {            
                    id:             "ferritine",                    
                    value:          25.0,
                },
                {            
                    id:             "sTFR",                    
                    value:          3.0,
                },
                {            
                    id:             "reticulocytepc",
                    value:          8,
                },
                {            
                    id:             "reticulocytehb",
                    value:          28.0,
                },
                {
                    id:             "hematokrit",
                    value:          40,
                }
    
            ]

    }
    
    return validatePatientLaboratoryObservations(dataSet);
}
