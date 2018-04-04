/**
 * Copyright bei G. Füchsl - 2018
 */

"use strict";

$(document).ready(function() {
    
    /* Patientenkontext herstellen, je nach URL-Parameter */    
    var pC = getPatientContext(location.search);    
    
    /* Revisualisierung des Fensterinhalts bei Resizing des Fensters, insbesondere der Grafikdarstellung */        
    $(window).resize(function() {
        composeResultCards();
    });
        
    /**
     *  Test-Code: Button, mit dem die Kapselung von (Business-)Logik in der FHIR-Struktur implementiert wird
     */
    if (true) {
        $("#lab8").click(function() {            
            
            var obv = [],
                pCard = $("#laboratory-card").html(),
                classSelForUserReact = 'ds_values_gf2';

            // Observations gefunden ...
            if (observationSet) {

                // Verarbeiten von nativen Observations
                observationFactory.init(observationSet.getList(), observationSet.getPatient(), configuration, classSelForUserReact);
                
                // Ergebnis als Dataset für den Entscheidungsprozess
                var dataSet = observationFactory.resultNativeDataset();
                console.log(validatePatientLaboratoryObservations(dataSet));

                // Ergebnis als Array von weiterverwendbaren Observations
                obv = observationFactory.resultProcessedObservations();
                console.log(obv);
            }
            
            // Darstellung als Patientenkarte ...            
            var card = cardFactory();   
            card.init({
                patient:        observationSet.getPatient(),
                config:         configuration,
                content:        obv,
                title:          'Laboratory Data',
                background:     '#f4efa6',
                reactOn:        classSelForUserReact
            });
            //card.init("Test");
            card.display("laboratory-card");            

            console.log("app - end: click - lab8");

        });        
    } else {
        $("#lab8").hide();
    }

    /* Wenn ein Patientenkontext hergestellt werden konnte */
    if (typeof pC == 'function') {        
        /* Patientenkontext ausführen */
        alert(pC());        
     
        /* Patienten- und Ergebniskarten an den Reload-Button hängen */    
        $("#lab7").click(function () {                                        
            $(".results").css( {
                "background-color": "rgb(200, 240, 210)",
                "transition": "0.5s all ease-in-out"
            });             
            window.location.reload(true);
        });

    } else {
        /* Das UI zusammenstellen mit Testdaten zusammenstellen */        
        alert(pC);

        composeCards();
        composeResultCards(); 

        /* Reload-Button disablen */    
        $("#lab7").attr("disabled", "true");

        /* Feldänderungen, d.h. User-Eingaben wahrnehmen und dann die Anzeige von Graph und Request disablen*/
        $(".ds_values_gf").change(reactToUserInput);
        $(".ds_chart_gf").attr("disabled", "true");                                                            
        $(".ds_request_gf").attr("disabled", "true");                                                             
        
    }
    
});