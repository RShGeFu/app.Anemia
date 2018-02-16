/**
 * Copyright bei G. Füchsl - 2018
 */

"use strict";
var patientName = "Gerhard"; // globale Testvariable

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
 * Hilfsfunktion erleichtert das Parsing von URL-Parametern
 * Quelle: http://docs.smarthealthit.org/tutorials/authorization/
 * @param {*} querystring 
 */
function getUrlParameter(sParam)
    {
        var sPageURL = window.location.search.substring(1);
        var sURLVariables = sPageURL.split('&');
        for (var i = 0; i < sURLVariables.length; i++) 
        {
            var sParameterName = sURLVariables[i].split('=');
            if (sParameterName[0] == sParam) {
                var res = sParameterName[1].replace(/\+/g, '%20');
                return decodeURIComponent(res);
            }
        }
    }

/**
 * Hilfsfunktion, um den Patientennamen aus der Patienten-Resource zu extrahieren
 */
function getPatientName (pt) {
    if (pt.name) {
      var names = pt.name.map(function(name) {
        return name.given.join(" ") + " " + name.family.join(" ");
      });
      return names.join(" / ")
    } else {
      return "anonymous";
    }
}

/**
 * Closure, um die Anbindung an einen FHIR-Server herzustellen
 * Abhängig von den Aufruf-Parametern können verschiedene Arten von FHIR-Servern angesprochen werden
 */
var getPatientContext = (function() {

    var configData = {        
        // Testserver
        serverTestBase:         "TEST - Server",
        serverTestBaseURL:      "http://hapi.fhir.org/baseDstu2",                                   // Funktioniert!
        serverTestBaseURL3:     "https://fhir-open-api-dstu2.smarthealthit.org",                    // Funktioniert (noch) nicht
        serverTestBaseURL4:     "https://sb-fhir-dstu2.smarthealthit.org/api/smartdstu2/data",      // Funktioniert jetzt! Nach Anpassung des Scopes
        
        // Medico-Server
        serverBase:             "Medico - Server",
        serverBaseURL:          "",

        // FÜr URL-Parameter
        location:               null,
        
        // Erforderliche URL-Parameter für den Kontext-Entscheid
        requiredPersonalData:   [ "patLastName", "patFirstName", "patBirthday" ],
        requiredEncounter:      "patEncID",
        requiredUseTestServer:  "fhirTestServer",
        requiredUseServer:      "MedicoServer"
    };

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

            // Test-Server FHIR mit Patienten-ID...
            if (vl.indexOf(configData.requiredUseTestServer) > -1 && vl.indexOf(configData.requiredEncounter) > -1) {        
                
                if (v[configData.requiredUseTestServer] == 'true') {
                    
                    return function() {
                    
                        alert(configData.serverTestBase + " (FHIR): " + configData.serverTestBaseURL);
                    
                        // Client initialisieren
                        var smart = FHIR.client({
                                serviceUrl:     configData.serverTestBaseURL,
                                patientId:      v[configData.requiredEncounter]                 
                            });
                    
                        // Daten abrufen - zunächst den Namen eines Patienten
                        smart.patient.read().then(function(p) {                                                            
                                composeCards();       
                                composeResultCards();                        
                                alert(getPatientName(p));
                            }).fail(function(e) {
                                alert("Patient not found!");
                            });

                    }                                     

                } else {

                    alert("FHIR-Testserver not used!");
                    return null;

                }

            // FHIR-Echt-Server mit Fallnummer
            } else if (vl.indexOf(configData.requiredUseServer) > -1 && vl.indexOf(configData.requiredEncounter) > -1) {  
                
                if (v[configData.requiredUseServer] == 'true') {
                    
                    return function() {
                        composeCards();        
                        composeResultCards();                        
                        return "With encounterID: " + v[configData.requiredEncounter];
                    }

                } else {

                    alert("Medico - Server not used!");
                    return null;

                }
            
            // FHIR-Echt-Server mit Name, Vorname, Geburtsdatum
            } else if (vl.indexOf(configData.requiredUseServer) > -1 && personalDataComplete) {

                if (v[configData.requiredUseServer] == 'true') {

                    return function() {
                        composeCards();        
                        composeResultCards();                        
                        return "With Name, FirstName, Birthday: " + v[configData.requiredPersonalData[1]];
                    }

                } else {

                    alert("Medico - Server not used!");
                    return null;
                    
                }

            // Stand alone, wenn keine entsprechenden Daten geliefert werden
            } else {                                                    
                    
                // Bei Aufruf der App im Kontext Sandbox von SmartHealthIT.org
                return function() {
                                        
                    // get the URL parameters received from the authorization server
                    var state = getUrlParameter("state");  // session key
                    var code = getUrlParameter("code");    // authorization code
    
                    // load the app parameters stored in the session
    
                    if (sessionStorage[state]) {
        
                        var params = JSON.parse(sessionStorage[state]);  // load app session
    
                        var tokenUri = params.tokenUri;
                        var clientId = params.clientId;
                        var secret = params.secret;
                        var serviceUri = params.serviceUri;
                        var redirectUri = params.redirectUri;
    
                        // Prep the token exchange call parameters
                        var data = {
                        code: code,
                        grant_type: 'authorization_code',
                        redirect_uri: redirectUri
                        };
                        var options;
                        if (!secret) {
                            data['client_id'] = clientId;
                        }
                        options = {
                            url: tokenUri,
                            type: 'POST',
                            data: data
                        };
                        if (secret) {
                            options['headers'] = {'Authorization': 'Basic ' + btoa(clientId + ':' + secret)};
                        }
    
                        // obtain authorization token from the authorization service using the authorization code
                        $.ajax(options).done(function(res){
        
                            // should get back the access token and the patient ID
                            var accessToken = res.access_token;
                            var patientId = res.patient;
                
                            // and now we can use these to construct standard FHIR
                            // REST calls to obtain patient resources with the
                            // SMART on FHIR-specific authorization header...
                            // Let's, for example, grab the patient resource and
                            // print the patient name on the screen
                            var url = serviceUri + "/Patient/" + patientId;
                            $.ajax({
                                url: url,
                                type: "GET",
                                dataType: "json",
                                headers: {
                                    "Authorization": "Bearer " + accessToken
                                },
                            }).done(function(pt){
                                composeCards();        
                                composeResultCards();                        
                                patientName = pt.name[0].given.join(" ") +" "+ pt.name[0].family.join(" ");
                                alert(patientName);
                            });
                        }).fail(function() { 
                            alert("Huch!"); 
                        });

                    } else {

                        alert("No authorizsation - App starts only with test data...");
                        return null;

                    }

                }
            } 
                    
    }

})();
