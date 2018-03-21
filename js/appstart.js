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
            console.log("app - start: click - lab8");
            if (observationSet) {
                observationFactory.addValidation(observationSet.getList());
                //observationFactory.getValidation(observationSet.getList());
            }
            //console.log("[0]: " + JSON.stringify(observationSet.getList() ? observationSet.getList()[0] : "Keine Liste ...."));
            observationFactory.createObservs(configuration);
            observationFactory.replaceSubstObservs(observationSet.getList());
            console.log(observationFactory.getObservs());
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