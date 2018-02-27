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
        
        /* Reaktion auf Werte-Änderungen durch den User an die Input-Elemente einhängen */        
        $(".ds_values").change(function() {
            
            /* Referenzbereich abgreifen */        
            var tnr = testNormalAndValidRange(  this.value, 
                                                $("#" + this.id + "_refMin").html(), 
                                                $("#" + this.id + "_refMax").html(), 
                                                0, 
                                                $("#" + this.id + "_refMax").html() * 10 );

            /* Entscheidungskriterium setzen */            
            decision.setItem(this.id, this.value, tnr.status == 'nv nan' || tnr.status == 'nv nvr' ? null : tnr.status);            
            
            /* Kartenfarbe auf 'verändert' setzen */
            $(".results").css({
                                "background-color": "#ffbfbf",
                                "transition": "0.5s all ease-in-out"
            });
            /* Farbe des veränderten Input-Feldes auf Rot setzen */
            $(this).css({
                "background-color": "#ffbfbf",
                "transition": "0.5s all ease-in-out"
            });
                
            /* Neu entscheiden */
            composeResultCards();            
        });
        
        /* Patienten- und Ergebniskarten an den Reload-Button hängen */    
        $("#lab7").click(function () {                                        
            $(".results").css( {
                "background-color": "rgb(200, 240, 210)",
                "transition": "0.5s all ease-in-out"
            });             
            window.location.reload(true);
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