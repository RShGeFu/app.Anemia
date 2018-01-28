/**
 * Copyright bei G. Füchsl - 2018
 */

/**
 * Funktion für die Internationalisierung der App als Closure einmalig (nur) hier definiert
 * Übersetzungsliste
 */
var getTranslationList = (function() {

    /* Definiere die Übersetzungsliste */

    var labels = {
        name:       "Translation - Labels",
        version:    "0.0.1",
        languages:  [ "de", "en" ],
        labels:     [
                        // --- Navigation-Bar
                        { id: "lang-flag",  attr: "src",    de: "images/german.png", en: "images/english.png"},
                        { id: "lab1",       attr: "",       de: "Name", en: "Lastname" },
                        { id: "lab2",       attr: "",       de: "Vorname", en: "Firstname" },
                        { id: "lab3",       attr: "",       de: "Geburtsdatum", en: "Birthday" },
                        { id: "lab3a",      attr: "",       de: "Geschlecht", en: "Sex" },
                        { id: "lab4",       attr: "",       de: "Fallnummer", en: "Encounter-ID" },
                        { id: "lab5",       attr: "",       de: "Diagnosen", en: "Diagnoses" },
                        { id: "lab6",       attr: "",       de: "Einstellungen", en: "Settings" },
                        { id: "lab6",       attr: "href",   de: "images/german.png", en: "images/english.png"},
                        { id: "lab7",       attr: "",       de: "Patientendaten neu laden", en: "Reload patient data" },                        
                        { id: "lab7a",      attr: "",       de: "Keine Diagnosen verfügbar", en: "No diagnosis available" },
                        // --- Modaldialog
                        { id: "modaltitle", attr: "",       de: "Bitte beachten", en: "Please note" },
                        { id: "modalmessage",attr: "",      de: "Die Patientendaten werden neu geladen", en: "The patient data are reloaded" },
                        // --- Patientenkarte
                        { id: "patient",    attr: "",       de: "Klinische Daten", en: "Clinical Data" },
                        { id: "weight",     attr: "",       de: "Gewicht", en: "Weight" },
                        { id: "height",     attr: "",       de: "Grösse", en: "Height" },
                        // --- Laborkarte
                        { id: "labor",      attr: "",       de: "Labordaten", en: "Laboratory Data" },
                        { id: "hemoglobin", attr: "",       de: "Hämoglobin", en: "Hemoglobin" },
                        { id: "mcv",        attr: "",       de: "MCV", en: "MCV" },
                        { id: "crp",        attr: "",       de: "CRP", en: "CRP" },
                        { id: "ferritine",  attr: "",       de: "Ferritin", en: "Ferritine" },
                        { id: "sTFR",       attr: "",       de: "Lösl. Transf-Rezeptor", en: "Sol. Transf-Receptor" },
                        { id: "reticulocytepc", attr: "",   de: "Retikulozyten", en: "Reticulocytes" },
                        { id: "reticulocytehb", attr: "",   de: "Retikulozyten Hb", en: "Reticulocyte Hb" },
                        { id: "hematokrit", attr: "",       de: "Hämatokrit", en: "Hematokrit" },
                        // --- Diagnosenkarte
                        { id: "diagnosis-1",attr: "",       de: "Diagnose", en: "Diagnosis" },
                        { id: "diag-0",     attr: "",       de: "Keine Diagnosestellung möglich", en: "No Diagnosis possible" },                        
                        // --- Karte für Empfehlungen
                        { id: "recommends", attr: "",       de: "Empfohlene Maßnahmen", en: "Recommended Activities" },
                        { id: "recomm-0",   attr: "",       de: "BB, MCV, CRP, Ferritin, Hämatokrit, Retikulozyten, Retikulozyten-Hb, lösl. Transferrinrezeptor bestimmen", 
                                                            en: "Determine BC, MCV, Ferritine, CRP, Hematokrit, Reticuloytes, Reticulocyte-Hb, sol. Transferrine-Receptor" },
                        // --- Karte für die Berechnungen
                        { id: "calculation",attr: "",       de: "Berechnete Werte", en: "Calculated Values" },
                        // --- Karte für den Thomas-Plot
                        { id: "thplot",     attr: "",       de: "Eisen-Plot nach Thomas", en: "Iron-Plot / Thomas" }
                    ]        
    }

    /* Validiere die ÜBersetzungsliste - s. Validierungsfunktion
        1. id/attr: keine doppelte Vergabe
        2. languages: in jedem Array-Item muß die angegebene Sprache vorhanden sein
        3. 'Sprache': für jede id muß in allen angegebenen Sprachen ein Text/Übersetzung stehen
        -> Wichtig für längere Übersetzungstabellen, damit keine Fehler bei der Neuvergabe von Labels entstehen
    */    
    
    return function() {
        return labels;
    }

})();

/**
 * Funktion für die Internationalisierung der App
 * Übersetzungsliste
 */
function getTranslationList_deprecated() {
    
    /* Definiere die Übersetzungsliste */
    
    let labels = {
        name:       "Translation - Labels",
        version:    "0.0.1",
        languages:  [ "de", "en" ],
        labels:     [
                        { id: "lang-flag",  attr: "src",    de: "images/german.png", en: "images/english.png"},
                        { id: "lab1",       attr: "",       de: "Name", en: "Lastname" },
                        { id: "lab2",       attr: "",       de: "Vorname", en: "Firstname" },
                        { id: "lab3",       attr: "",       de: "Geburtsdatum", en: "Birthday" },
                        { id: "lab3a",      attr: "",       de: "Geschlecht", en: "Sex" },
                        { id: "lab4",       attr: "",       de: "Fallnummer", en: "Encounter-ID" },
                        { id: "lab5",       attr: "",       de: "Diagnosen", en: "Diagnoses" },
                        { id: "lab6",       attr: "",       de: "Einstellungen", en: "Settings" },
                        { id: "lab7",       attr: "",       de: "Patientendaten neu laden", en: "Reload patient data" },
                        { id: "patient",    attr: "",       de: "Patient", en: "Patient" },
                        { id: "weight",     attr: "",       de: "Gewicht", en: "Weight" },
                        { id: "height",     attr: "",       de: "Grösse", en: "Height" },
                        { id: "labor",      attr: "",       de: "Labor", en: "Laboratory" },
                        { id: "hemoglobin", attr: "",       de: "Hämoglobin", en: "Hemoglobin" },
                        { id: "mcv",        attr: "",       de: "MCV", en: "MCV" },
                        { id: "crp",        attr: "",       de: "CRP", en: "CRP" },
                        { id: "ferritine",  attr: "",       de: "Ferritin", en: "Ferritine" },
                        { id: "sTFR",       attr: "",       de: "Lösl. Tf R", en: "sol Tf R" },
                        { id: "reticulocytepc", attr: "",   de: "Retikuloz.", en: "Reticuloc." },
                        { id: "reticulocytehb", attr: "",   de: "Reti Hb", en: "Reti Hb" }
                    ]        
    }

    /* Validiere die ÜBersetzungsliste - s. Validierungsfunktion
        1. id/attr: keine doppelte Vergabe
        2. languages: in jedem Array-Item muß die angegebene Sprache vorhanden sein
        3. 'Sprache': für jede id muß in allen angegebenen Sprachen ein Text/Übersetzung stehen
        -> Wichtig für längere Übersetzungstabellen, damit keine Fehler bei der Neuvergabe von Labels entstehen
    */

    return labels;
}

/**
 * Funktion für die Internationalisierung der App
 * Validierung für die Übersetzungsliste
 */
function validateTranslationList(list) {

    var i = 0, ts;

    /* Nur wenn 'list' ein Item 'name' enthält, das auch 'Labels' heißt, d.h. nur wenn tatsächlich eine 
    Übersetzungsliste vorliegt ...*/
    if (list.name === "Translation - Labels") {        
                
        /* 1. id/attr: keine doppelte Vergabe */
        var s = [];
        for(i = 0; i < list.labels.length; i++) {
            s.push(list.labels[i].id + list.labels[i].attr);
        }
        for(i = 0; i < list.labels.length; i++) {
            ts = s[i];
            if (s.filter(function(toTest) {
                                return toTest == ts;
                            }).length > 1) {
                return false;
            }
        }

        /* 2. languages: in jedem Array-Item müssen die angegebene Sprachen vorhanden sein */
        s = [];
        for(i = 0; i < list.languages.length; i++) {
            var language = list.languages[i];
            for(j = 0; j < list.labels.length; j++) {
                var toTest = list.labels[j][language];                
                if (toTest == null) {
                    return false;
                } else {
                    s.push(toTest); // Für den nächsten Test 3 den Inhalt merken
                }
            }            
        }

        /* 3. 'Sprache': für jede id muß in allen angegebenen Sprachen ein Text/Übersetzung stehen
            s als Array wird unter Punkt 2 befüllt */
        if (s.filter(function(toTest) {
                            return toTest.length == 0;
                    }).length > 0) {
            return false;
        }

        /** Wenn hier angekommen: Kein Fehler in der Liste -> alles o.k. */
        return true;

    } else {

        return false;

    }
        
}

/**
 * Funktion für die Internationalisierung der App
 * Labels ins UI schreiben - Default: 'de' / Deutsch
 */
function translateLabels(lang = 'de') {
    /* Übersetzungstabelle initialisieren */
    let labelList = getTranslationList();    

    /* Übersetzungstabelle validieren */
    if (validateTranslationList(labelList)) {
        
        /* Labels entsprechend der eingestellten Sprache setzen */
        $('#lang-flag').data('actual-lang', lang);                      // An die Flagge Daten hängen: die aktuelle Sprache
        let list = labelList.labels;
        for(i in list) {
            if (list[i].attr.length > 0) {                              // Attribut setzen
                $("#"+list[i].id).attr(list[i].attr, list[i][lang]);
            } else {                                                    // Inhalt setzen
                $("#"+list[i].id).html(list[i][lang]);
            }
        }

    /* Fehlermeldung, wenn die Validierung der Übersetzungstabelle fehlschlägt */
    } else {

        window.alert('Labelliste fehlerhaft');

    }
}

/**
 * Funktion für die Internationalisierung der App
 * Bei Click auf einen Button oder Link die nächste Sprache der Liste auswählen und setzen
 */
function setLanguage() {
    
    // Aktuell eingestelle Sprache nachschauen
    var list = getTranslationList(),
        actualLanguage = $('#lang-flag').data('actual-lang'),
        
        // Nächste Sprache der Liste einstellen
        newIndex = list.languages.indexOf(actualLanguage) + 1;
    
    // Wenn die Liste aus ist, wieder bei der ersten Sprache der Liste beginnen
    if (newIndex > list.languages.length) {
        newIndex = 0;
    }
    
    // Sprache einstellen und übersetzen
    actualLanguage = list.languages[newIndex];
    translateLabels(actualLanguage);
}

/**
 * Sprache bei App-Start einstellten
 */
$(document).ready(function() {
    
    // Standardsprache wählen
    var language = "en";    
    
    // Wenn der Browser eine zur Übersetzungliste passende Spracheinstellung hat, dann wähle diese
    if (getTranslationList().languages.indexOf(navigator.language) != -1) {
        language = navigator.language;
    }
    
    // Übersetze
    translateLabels(language);    
});