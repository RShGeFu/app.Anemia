/**
 * Copyright bei G. Füchsl - 2018
 */

"use strict";

/**
 * Hilfsfunktion - Mit dieser Funktion wird ein assoziatives Array aus den Such-Parametern der URL gemacht
 * @param {*} querystring 
 */
function getKeyValueList(querystring) {

    if (querystring == '') return;

    var valueString = querystring.slice(1);
    var pairs = valueString.split("&");
    var pair, name, value, retArr = new Object();
    
    for (var i = 0; i < pairs.length; i++) {
        
        pair = pairs[i].split("=");
        
        name = pair[0];
        value = pair[1];
        
        name = unescape(name).replace("+", " ");
        value = unescape(value).replace("+", " ");        
        
        retArr[name] = value;

    }    

    return retArr;

}

/**
 * Closure für die Konfiguration der Serveranbindung und Validierung der URL-Parameter
 * Liefert abhängig von den URL-Parametern unterschiedliche Antworten bzw. unterschiedliche Vorgehensweisen, um letztlich
 * an die Patientendaten vom Server abzurufen
 */
var getPatientContext = (function() {

    var configData = {
        serverBase:             "testBaseConfig",
        location:               null,        
        requiredPersonalData:   [ "patLastName", "patFirstName", "patBirthday" ],
        requiredEncounter:      "patEncID"        
    }
    
    return function(params) {

            /* Parameter des Aufrufs speichern, ggf. bei fehlenden Parametern die zuvor gespeicherten Parameter ermitteln und zurückgeben */
            if (params) {
                configData.location = params;
            } else if (params == null) {
                params = configData.location;
            }

            /* Definition der URL-Parameter-Listen und Abfragekriterien */
            var v, vl,
                personalDataComplete = true;
            
            /* Test, ob URL-Parameter vorhanden sind */
            if (params) {
                v = getKeyValueList(params);
                vl = Object.keys(v);
            } else {
                v = [];
                vl = [];
            }

            /* Validierung der URL-Parameter Name, Vorname und Geburtsdatum - diese müssen vorhanden und entsprechend benannt sein, wenn die Parameter unter config
               für die Patientenabfrage benutzt werden sollen */
            for(var i = 0; i < configData.requiredPersonalData.length; i++) {
                if (vl.indexOf(configData.requiredPersonalData[i]) == -1) {
                    personalDataComplete = false;
                    break;
                }
            }
       
            /* Unterschiedliche Antworten, je nach URL-Parameter */
            if (vl.indexOf(configData.requiredEncounter) > -1) {        // Fallnummer - FHIR-Abfrage

                return "With encounterID: " + v[configData.requiredEncounter];

            } else if (personalDataComplete) {                          // Name, Vorname, Geburtsdatum - FHIR-Abfrage

                return "With Name, FirstName, Birthday: " + v[configData.requiredPersonalData[1]];

            } else {                                                    // Stand alone, wenn keine entsprechenden Daten geliefert werden
                
                return function() {
                    return "Stand Alone";
                }

            } 
            
        
    }

})();

/**
 * Built der Konfigurationsseite
 */

/**
 * Einhängen des Aufrufkontexts nach Laden der App
 */
$(document).ready(function() {
    
    var cf = getPatientContext(location.search);
    
});