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
    
    /* Wenn ein Patientenkontext hergestellt werden konnte */
    if (typeof pC == 'function') {
        
        /* Patientenkontext ausführen */
        alert(pC());        
        /* Patienten- und Ergebniskarten an den Reload-Button hängen */    
        $("#lab7").click(function () {        
                pC();
            });

        /* Revisualisierung des Fensterinhalts bei Resizing des Fensters, insbesondere der Grafikdarstellung */        
        $(window).resize(function() {
                composeResultCards();
            });
                    
    } else {
        /* Das UI zusammenstellen mit Testdaten zusammenstellen */
        composeCards();
        composeResultCards(); 
    }
    
});