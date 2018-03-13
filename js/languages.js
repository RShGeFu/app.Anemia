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
                        { id: "lab4",       attr: "",       de: "ID", en: "ID" },
                        { id: "lab5",       attr: "",       de: "Diagnosen", en: "Diagnoses" },
                        { id: "lab6",       attr: "",       de: "Einstellungen", en: "Settings" },
                        { id: "lab6",       attr: "href",   de: "images/german.png", en: "images/english.png"},
                        { id: "lab7",       attr: "",       de: "Patientendaten neu laden", en: "Reload patient data" },                        
                        { id: "lab7a",      attr: "",       de: "Keine Diagnosen verfügbar", en: "No diagnosis available" },
                        { id: "lab8",       attr: "",       de: "test-d", en: "test-e" },
                        
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
                        { id: "vitb12",     attr: "",       de: "Vitamin B12", en: "Vitamine B12" },
                        { id: "folicAcid",  attr: "",       de: "Folsäure", en: "Folic Acid" },
                        
                        // --- Diagnosenkarte
                        { id: "diagnosis-1",attr: "",       de: "Diagnose", en: "Diagnosis" },
                        { id: "diag-0",     attr: "",       de: "Keine Diagnosestellung möglich", en: "No Diagnosis possible" },
                        { id: "diag-1",     attr: "",       de: "Keine Anämie", en: "No Anemia" },                        
                        { id: "diag-2",     attr: "",       de: "Anämie (indeterminiert)", en: "Anemia (indeterminated)" },
                        { id: "diag-3",     attr: "",       de: "Anämie (nicht-mikrozytär)", en: "Anemia (non-microcytic)" },
                        { id: "diag-4",     attr: "",       de: "Mikrozytäre Anämie", en: "Microcytic Anemia" },
                        { id: "diag-6",     attr: "",       de: "Eisenmangelanämie", en: "Microcytic Anemia on Iron deficiency" },
                        { id: "diag-7",     attr: "",       de: "Mikrozytäre Anämie bei V.a. Thalassämie", en: "Microcytic Anemia in Suspicion of Thalassemia" },
                        { id: "diag-8",     attr: "",       de: "Anämie (nicht-mikrozytär) - Eisenmangel unwahrscheinlich / V.a. hypoplastische/infiltrative/dyserythropoietische Störung", 
                                                            en: "Anemia (non-microcytic) - Iron deficiency improbable / Suspicion on hypoplastic/infiltrative/dyserythropoietic Disorder" },
                        { id: "diag-9",     attr: "",       de: "AOD - Anämie bei chronischer Erkrankung", en: "AOD - Anemia of Chronic Disorder" },
                        { id: "diag-10",    attr: "",       de: "Gemischte Anämie - Anämie bei chronischer Erkrankung und Eisenmangel", 
                                                            en: "Mixed AOD - Anemia of Chronic Disorder and Iron Deficiency" },
                        { id: "diag-12",    attr: "",       de: "V.a. Hämolyse/Akute Blutung", en: "Suspicion on Hemolysis or acute Bleeding" },
                        { id: "diag-13",    attr: "",       de: "Makrozytäre Anämie bei VitB12-Mangel", en: "Macrocytic Anemia, Vit B12 Deficiency" },
                        { id: "diag-14",    attr: "",       de: "Makrozytäre Anämie bei Folsäure-Mangel", en: "Macrocytic Anemia, Folic acid Deficiency" },
                        { id: "diag-15",    attr: "",       de: "Makrozytäre Anämie", en: "Macrocytic Anemia" },

                        // --- Karte für Empfehlungen
                        { id: "recommend-1",attr: "",       de: "Empfohlene Maßnahmen", en: "Recommended Activities" },
                        { id: "recom-0",    attr: "",       de: "BB, MCV, CRP, Ferritin, Hämatokrit, Retikulozyten, Retikulozyten-Hb, lösl. Transferrinrezeptor bestimmen", 
                                                            en: "Determine BC, MCV, Ferritine, CRP, Hematokrit, Reticuloytes, Reticulocyte-Hb, sol. Transferrine-Receptor" },
                        { id: "recom-1",    attr: "",       de: "Beschwerdebezogene Diagnostik einleiten", en: "Examination related to Symptoms recommended" },
                        { id: "recom-2",    attr: "",       de: "MCV bestimmen", en: "Determine MCV" },
                        { id: "recom-3",    attr: "",       de: "Hämatokrit bestimmen", en: "Determine Hematokrit" },
                        { id: "recom-4",    attr: "",       de: "Ferritin bestimmen", en: "Determine Ferritine" },
                        { id: "recom-5",    attr: "",       de: "CRP bestimmen", en: "Determine CRP" },
                        { id: "recom-6",    attr: "",       de: "Eisensubstitution", en: "Substitution of Iron" },
                        { id: "recom-7",    attr: "",       de: "Hb-Elektrophorese empfohlen", en: "Hb-Electrophoresis recommended" },
                        { id: "recom-8",    attr: "",       de: "Spezifische Diagnostik (Leber, Niere), Knochenmarkszytologie empfohlen", 
                                                            en: "Specific Diagnostics (Liver, Kidney), Cytology of Bone Marrow recommended" },
                        { id: "recom-9",    attr: "",       de: "Infekt-/Tumordiagnostik empfohlen", en: "Diagnostics for Infectious or Tumorous Diseases recommended" },
                        { id: "recom-10",   attr: "",       de: "Infekt-/Tumordiagnostik und Eisensubstitution empfohlen", 
                                                            en: "Diagnostics for Infectious or Tumorous Diseases and Iron Substitution recommended" },
                        { id: "recom-11",   attr: "",       de: "Löslichen Transferrin-Rezeptor bestimmen", en: "Determine Soluble Transferrine Receptor" },
                        { id: "recom-12",   attr: "",       de: "LDH, Haptoglobin, Coombs-Test bestimmen, Gastro-/Coloskopie", en: "Determine LDH, Haptoglobin, Coombs-Test, Perform Gastroscopy/Colonoscopy" },
                        { id: "recom-13",   attr: "",       de: "Vit B12 - Substitution", en: "Substitution of Vitamine B12" },
                        { id: "recom-14",   attr: "",       de: "Folsäure - Substitution", en: "Substitution of Folic acid" },
                        { id: "recom-15",   attr: "",       de: "Vitamin B12 bestimmen", en: "Determine Vitamine B12" },
                        { id: "recom-16",   attr: "",       de: "Folsäure bestimmen", en: "Determine Folic acid" },

                        // --- Karte für die Berechnungen
                        { id: "calculation",attr: "",       de: "Berechnete Werte", en: "Calculated Values" },
                        { id: "calc-0",     attr: "",       de: "Eisenbedarf", en: "Iron Needs" },
                        { id: "calc-1",     attr: "",       de: "Retikulozyten-Produktions-Index", en: "Reticulocytes-Production-Index" },
                        { id: "calc-2",     attr: "",       de: "TfRezeptor-Ferritin-Index", en: "TfReceptor-Ferritine-Index" },
                        { id: "calc-3",     attr: "",       de: "Ziel", en: "Target" },
                        { id: "calc-4",     attr: "",       de: "Eisenbedarf", en: "Iron Needs" },                        
                        { id: "calc-5",     attr: "",       de: "Ziel", en: "Target" },
                        { id: "calc-6",     attr: "",       de: "BMI", en: "BMI" },

                        // --- Karte für den Thomas-Plot
                        { id: "thplot",     attr: "",       de: "Eisen-Plot nach Thomas", en: "Iron-Plot / Thomas" },
                        { id: "thplotI",    attr: "",       de: "Quadrant I - Speichereisen gefüllt, kein Funktionseisenverlust", en: "Quadrante I - Iron reserve full, no loss of functional iron" },
                        { id: "thplotII",   attr: "",       de: "Quadrant II - Verminderte Speichereisenreserve, kein Funktionseisenmangel", en: "Quadrante II - Iron reserve low, no loss of functional iron" },
                        { id: "thplotIII",  attr: "",       de: "Quadrant III - Kein Speichereisen; Funktionseisenverlust ", en: "Quadrante III - No iron reserve; loss of functional iron" },
                        { id: "thplotIV",   attr: "",       de: "Quadrant IV - Speichereisen gefüllt, aber Funktionseisenverlust", en: "Quadrante IV - Iron reserve full, but loss of functional iron" },

                        // --- Karte für den Laborverlauf
                        { id: "graphs-00",   attr: "",      de: "Kein Parameter für Verlauf gewählt", en: "No Parameter for history selected" },
                        { id: "graphs-01",   attr: "",      de: "Werteverlauf", en: "Parameter history" }
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
    var labelList = getTranslationList();    

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
        // Sondersituation: für den Wertverlauf auf der Laborverlaufskarte den gemerkten Parameter richtig anzeigen...
        if ($('#lang-flag').data('labhist')) {                        
            let pos1 = labelList.labels.findIndex(i => i.id == 'graphs-01');            
            let pos2 = labelList.labels.findIndex(i => i.id == $("#lang-flag").data('labhist'));       
            let showParameter = labelList.labels[pos1][lang] + ": " + labelList.labels[pos2][lang];
            $("#graphs-00").html(showParameter);    
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