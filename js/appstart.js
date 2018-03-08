/**
 * Copyright bei G. Füchsl - 2018
 */

"use strict";

/**
 * Nach Laden der App:
 * 1. Patientenkontext erstellen
 * 2. Den Reload-Button funktional machen
 * 3. Die Visualisierung des UI durchführen
 */

$(document).ready(function() {
    
    /* Patientenkontext herstellen, je nach URL-Parameter */    
    var pC = getPatientContext(location.search);    
    
    /* Revisualisierung des Fensterinhalts bei Resizing des Fensters, insbesondere der Grafikdarstellung */        
    $(window).resize(function() {
        composeResultCards();
    });
                
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