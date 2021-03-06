/**
 * Copyright bei G. Füchsl - 2018
 */

"use strict";

/**
 * Object accessToken als Closure: Minimale Verwaltung des Access-Tokens für den Serverzugriff. Der Access-Token wird nicht nur beim ersten Zugriff,
 * sondern ggf. auch für weitere Abfragen während des App-Starts gebraucht (v.a. bei Bundles)
 */
var accessToken = (function () {
    
    // beinhaltet gekapselt den Token
    var accToken = "";
    
    // Getter und Setter definieren und zur Verfügung stellen
    return {    
        
        get: function() {
            var d = new Date();
            console.log("Lesend: Zugriff auf Access-Token - " + d.toLocaleDateString() + " um " + d.toLocaleTimeString());
            return this.accToken;
        },

        set: function(aT) {
            var d = new Date();
            console.log("Schreibend: Zugriff auf Access-Token - " + d.toLocaleDateString() + " um " + d.toLocaleTimeString());
            this.accToken = aT;
        }

    }

})();

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
 * Callback-Funktion für die Reaktion auf User-Eingaben, nachdem die Patientendaten geladen sind und vom
 * User zu weiteren diagnostischen Zwecken modifiziert werden können
 */
function reactToUserInput() {
            
    /* Referenzbereich abgreifen */    
    var posRef = configuration.defaultReference.findIndex(j => j.id === this.id), 
        vMin = 0,       // Default-Werte, die verwendet werden, wenn eine id in der configuration nicht gefunden werden (in der Applikation v.a. Größe/Gewicht)...
        vMax = 260;     // - " -

    if (posRef != -1) { // Die Default-Werte werden ersetzt, wenn eine id in der configuration gefunden sind ...
        vMin = configuration.defaultReference[posRef].validMin;
        vMax = configuration.defaultReference[posRef].validMax;
    }

    var tnr = testNormalAndValidRange(  Number(this.value), 
                                        Number($("#" + this.id + "_refMin").html()),            // Umgehen der Abfrage des Patientengeschlechts aus configuration
                                        Number($("#" + this.id + "_refMax").html()), 
                                        Number(vMin), 
                                        Number(vMax)
                                    );
    
    /* Entscheidungskriterium setzen */    
    decision.setItem(this.id, this.value, tnr.status == 'nv nan' || tnr.status == 'nv nvr' ? null : tnr.status);            
    
    /* Kartenfarbe auf 'verändert' setzen */
    $(".results").css({
                        "background-color": "#ffbfbf",
                        "transition": "0.5s all ease-in-out"
    });
    $("#" + this.id + "_b").html(tnr.status);
    $("#" + this.id + "_b").attr("class", "badge badge-" + tnr.color);
    /* Farbe des veränderten Input-Feldes auf Rot setzen */
    $(this).css({
        "background-color": "#ffbfbf",
        "transition": "0.5s all ease-in-out"
    });
    
    /* Neu entscheiden */
    composeResultCards();
}

/**
 * Hilfsfunktion completeServiceUri(): mit dieser Funktion wird ein String für die AJAX-Anfrage an den FHIR-Server geliefert, die die eigentliche
 * URL noch weiter ergänzt. Damit könnte eine Variabilität in den Abfrageparametern ermöglicht werden
 */
function completeServiceUri() {
    // Denkbar: Bereits hier Angabe von Search-Parameters (z.B. LOINCs), um nur bestimmte Observations zu bekommen (Datensparsamkeit/Privacy by design),
    // Bei Versuch mit '/Observation?code=http://loinc.org|718-7&_count=50&subject:Patient=': KEINE Serverantwort
    // Bei Versuch mit '/Observation?code=718-7&_count=50&subject:Patient=': Server liefert nur die Observations mit Hämoglobin;
    
    // Loincs, die gefunden werden sollen, zusammenstellen: Configuration durchwandern
    var searchLoincs = "";  //Suchstring
    for(var i = 0; i < configuration.defaultReference.length; i++)   {
        // Delimiter einfügen
        if (searchLoincs.length > 0) {
            searchLoincs += "|";
        }

        // LOINC anfügen
        if ('loinc' in configuration.defaultReference[i]) {
            searchLoincs += configuration.defaultReference[i].loinc;
            
            // Evtl. weitere LOINCs nicht vergessen und in derselben Weise anfügen
            if ('acceptedLOINC' in configuration.defaultReference[i]) {
                for(var j = 0; j < configuration.defaultReference[i].acceptedLOINC.length; j++) {                    
                    if (searchLoincs.length > 0) {
                        searchLoincs += "|";
                    }
                    searchLoincs += configuration.defaultReference[i].acceptedLOINC[j];
                }
            }
        }        
    }
    
    var clinicalLoincs = "3141-9|29463-7|8302-2"; // LOINCS für Gewicht und Größe
    searchLoincs += "|" + clinicalLoincs;

    // Allerdings: /Observation?code=" + searchLoincs + "&_count=50&subject:Patient=" scheitert: Server liefert Fehler - Cross-Origin-Abfrage nicht gestattet

    return "/Observation?_count=50&subject:Patient=";
}

/**
 * Closure, um die Anbindung an einen FHIR-Server herzustellen
 * Abhängig von den Aufruf-Parametern können verschiedene Arten von FHIR-Servern angesprochen werden
 */
var getPatientContext = (function() {

    var configData = {        
        // Testserver
        serverTestBase:         "TEST - Server",
        serverTestBaseURL:      [ "http://hapi.fhir.org/baseDstu2", "http://hapi.fhir.org/baseDstu3" ],  // Funktionieren beide!
        
        // KIS-Server
        serverBase:             "KIS - Server",
        serverBaseURL:          "",

        // FÜr URL-Parameter
        location:               null,
        
        // Erforderliche URL-Parameter für den Kontext-Entscheid
        requiredPersonalData:   [ "patLastName", "patFirstName", "patBirthday" ],
        requiredEncounter:      "patEncID",
        requiredUseTestServer:  "fhirTestServer",
        requiredUseForSmart:    "smart",
        requiredUseServer:      "KISServer"
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
            // Hier Test: Benutzung des als Open-Source verfügbaren FHIR-Clients
            if (vl.indexOf(configData.requiredUseTestServer) > -1 && vl.indexOf(configData.requiredEncounter) > -1) {        
                
                if (v[configData.requiredUseTestServer] > -1 && v[configData.requiredUseTestServer] < configData.serverTestBaseURL.length) {
                    
                    return function() {

                        var server = configData.serverTestBase,
                            serverURL = configData.serverTestBaseURL[v[configData.requiredUseTestServer]];
                        
                        alert(server + " (FHIR): " + serverURL);
                    
                        // Client initialisieren
                        var smart = FHIR.client({
                                serviceUrl:     serverURL,
                                patientId:      v[configData.requiredEncounter]                 
                            });
                        
                        // Daten abrufen - zunächst den Namen eines Patienten
                        smart.patient.read().then(function(pt) {                    
                                    
                                smart.patient.api.fetchAll( { type: "Observation" } ).then(function(results) {
                                
                                    // Patientendaten und Ergebnisse zusammenstellen und visualisieren                                       
                                    composeCards(pt, results);                                   
                                    composeResultCards();

                                    /* Feldänderungen, d.h. User-Eingaben wahrnehmen */
                                    $(".ds_values_gf").change(reactToUserInput);                                                                                       
                                    $(".ds_chart_gf").click(function() {
                                        drawLabValGraphs(this.id);
                                    });                                                                                    
                                    $(".ds_request_gf").click(function() {
                                        let pos = configuration.defaultReference.findIndex(i => i.id === this.id);
                                        alert("Simulation - Anforderung wird erstellt für: " + configuration.defaultReference[pos].name);
                                        $(this).attr('disabled', true);
                                    });                                    
                                        
                                }).fail(function(e) {
                                    alert("No observation found!");                                    
                                });

                            }).fail(function(e) {
                                alert(e + " - Patient not found! Starting with test data ...");
                                composeCards();                                                                       
                                composeResultCards();

                                /* Feldänderungen, d.h. User-Eingaben wahrnehmen */
                                $(".ds_values_gf").change(reactToUserInput);                                                                                
                            });

                        return "FHIR-Testserver used ...";
                    }

                } else {
                    
                    return "FHIR-Testserver not used!";

                }

            // Test-Server SmartOnFHIR - SmartHealthIT.org...
            // Direkter Start ohne Authentifizierung!!
            // Hier Test: Benutzung des als Open-Source verfügbaren FHIR-Clients                
            } else if (vl.indexOf("code") > -1 && vl.indexOf("state") > -1) {
                
                return function() {
                
                    FHIR.oauth2.ready(function(smart){

                        alert("Get patient ...");
                        
                        smart.patient.read().then(function(pt) {                    
                                    
                            alert("Get observations ...");

                            smart.patient.api.fetchAll( { type: "Observation" } ).then(function(results) {
                            
                                // Patientendaten und Ergebnisse zusammenstellen und visualisieren                                       
                                composeCards(pt, results);                                   
                                composeResultCards();

                                /* Feldänderungen, d.h. User-Eingaben wahrnehmen */
                                $(".ds_values_gf").change(reactToUserInput);                                                                                       
                                $(".ds_chart_gf").click(function() {
                                    drawLabValGraphs(this.id);
                                });                                                                                    
                                $(".ds_request_gf").click(function() {
                                    let pos = configuration.defaultReference.findIndex(i => i.id === this.id);
                                    alert("Simulation - Anforderung wird erstellt für: " + configuration.defaultReference[pos].name);
                                    $(this).attr('disabled', true);
                                });                                    
                                $("#lab7").hide(); // Verstecken des Reload-Buttons, da nur mit entsprechender Authorisierung ein Reload möglich ist    

                            }).fail(function(e) {
                                alert("No observation found!");                                    
                            });

                        }).fail(function(e) {
                            alert(e + " - Patient not found! Starting with test data ...");
                            composeCards();                                                                       
                            composeResultCards();

                            /* Feldänderungen, d.h. User-Eingaben wahrnehmen */
                            $(".ds_values_gf").change(reactToUserInput);                                                                                
                        });
                        // So - hier noch wie oben die Daten abfragen ...

                    });

                    return "SmartHealthIT - App Launcher successfully used!"
                }

            }

//***************************************************************************************************************************************** */

            // hier: z.B. Kontext für FHIR-Echt-Server mit Fallnummer mit den Parametern
            // [serverBaseURL]?KISServer=true&patEncID=xxx
            else if (vl.indexOf(configData.requiredUseServer) > -1 && vl.indexOf(configData.requiredEncounter) > -1) {  
                
                // Müsste noch implementiert werden ....
                if (v[configData.requiredUseServer] == 'true') {
                    
                    return function() {

                        return "KIS System used ... sorry, not implemented";
                    }

                } else {
                    
                    return "KIS System not accessible";

                }            

//***************************************************************************************************************************************** */

            // Start der App möglichst mit Daten, die in der Sandbox von SmarthealthIT verfügbar sind
            } else {                                                    

                /******************************************************************************************************************
                 * Alter Aufruf: Mit Umstellung des Zugangs zum Testserver von SmartHealthIT.org ist keine Authentifizierung über *
                 * launch.html und des folgenden Scripts mehr notwendig ...                                                       *
                 ******************************************************************************************************************/

                // Bei Aufruf der App nur im Kontext der 'alten' Sandbox von SmartHealthIT.org - Start über Authentifizierung!!
                //                                                                               ----------------------------!!
                
                // Copyright - SmartHealthIT.org - hier Übernahme des größten Teils aus dem Tutorial
                // Eine Anpassung erfolgte nur bei der konkreten Abfrage der Patienten- und Observation-Resourcen

                // get the URL parameters received from the authorization server
                var state = getUrlParameter("state");  // session key                                    
                
                if (sessionStorage[state]) {

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
                                accessToken.set(res.access_token);                                
                                var patientId = res.patient;
                                
                                // and now it really starts:
                                // we can use these to construct standard FHIR
                                // REST calls to obtain patient resources with the
                                // SMART on FHIR-specific authorization header...
                                // Let's, for example, grab the patient resource and
                                // his or observerations and feed algorithms ...
                                var url = serviceUri + "/Patient/" + patientId;
                                
                                $.ajax({
                                    url: url,
                                    type: "GET",
                                    dataType: "json",
                                    headers: {
                                        "Authorization": "Bearer " + accessToken.get()
                                    },
                                }).done(function(pt){
                                    
                                    var url = serviceUri + completeServiceUri() + pt.id;
                                    
                                    var obs = $.ajax({
                                            url: url,
                                            type: "GET",
                                            dataType: "json",
                                            headers: {
                                                "Authorization": "Bearer " + accessToken.get()
                                            },
                                    }).done(function(results) {
                                        
                                        // Patientendaten und Ergebnisse zusammenstellen und visualisieren                                        
                                        composeCards(pt, results);                                           
                                        composeResultCards();     
                                        
                                        /* Feldänderungen, d.h. User-Eingaben wahrnehmen */
                                        $(".ds_values_gf").change(reactToUserInput);
                                        $(".ds_chart_gf").click(function() {                                                                                       
                                            drawLabValGraphs(this.id);
                                        });                                                                                    
                                        $(".ds_request_gf").click(function() {
                                            let pos = configuration.defaultReference.findIndex(i => i.id === this.id);
                                            alert("Simulation - Anforderung wird erstellt für: " + configuration.defaultReference[pos].name);
                                            $(this).attr('disabled', true);
                                        });
                                        $("#lab7").hide(); // Verstecken des Reload-Buttons, da nur mit entsprechender Authorisierung ein Reload möglich ist
                                        
                                    }).fail(function(e) {
                                        alert("No observation found! " + JSON.stringify(e));
                                    }); 
                                    

                                    /** Testbereich...
                                     *  1. Patient und Observations als XML -> abfragbar, potentiell Umwandlung erforderlich
                                     *  2. Metadata, d.h. Conformance -> abfragbar
                                     *  3. Definierte ValueSets: observations-codes, days-of-week, ldlcholesterol-codes -> jeweils kein Ergebnis 
                                     **/
                                    var url2 = serviceUri + "/Observation?code=718-7";
                                    var obs2 = $.ajax({
                                            url: url2,
                                            type: "GET",
                                            dataType: "json",
                                            headers: {
                                                "Authorization": "Bearer " + accessToken.get()
                                            },
                                    }).done(function(results) {
                                        console.log(results);  // Nur Anzeige ... 
                                        // XML2JSON-Parsing ....
                                    });

                                    
                                }).fail(function(e) {
                                    alert("Patient not found!");
                                });
                            }).fail(function(e) { 
                                alert("No server access ..."); 
                            });
                            
                            return "SmartHealthIT - Sandbox successfully used ...";

                        } else {

                            return "SmartHealthIT - Sandbox not used ...";

                        }

                    }
                
                // Stand alone, wenn keine entsprechenden Daten geliefert werden
                } else {
                    
                    return "No authorizsation - App starts only with test data...";

                }

            } 
                    
    }

})();
