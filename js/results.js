/**
 * Copyright bei G. Füchsl - 2018
 */

"use strict";

/**
 * Funktion für die Erstellung des HTML-Strings der Diagnosenkarte
 * @param {*} diag 
 */
 function createDiagnosisCard(diag) {
    var s = "<div class=\"card-body\"><h4 class=\"card-title\"><span id=\"diagnosis-1\"></span></h4>";
    for(var i = 0; i < diag.length; i++) {
        s = s + "<h5 class=\"card-text alert alert-danger\" role=\"alert\"><span id=" + diag[i]['id'] + "><span></h5>";
    }
    s = s + "</div></div>";
    return s;
}

/**
 * Funktion für die Erstellung des HTML-Strings der Empfehlungskarte
 * @param {*} rec
 */
function createRecommendsCard(rec) {
    var s = "<div class=\"card-body\"><h4 class=\"card-title\"><span id=\"recommend-1\"></span></h4>";
    for(var i = 0; i < rec.length; i++) {
        s = s + "<h5 class=\"card-text alert alert-warning\" role=\"alert\"><span id=" + rec[i]['id'] + "><span></h5>";
    }
    s = s + "</div></div>";
    return s;
}

function createCalcValuesCard(mathRes) {
    var s = "<div class=\"card-body\"><h4 class=\"card-title\"><span id=\"calculation\"></span></h4><table class=\"table table-hover\"><tbody>";
    s = s + "<tr><th scope=\"row\"><span id=\"calc-0\"></span> (<span id=\"calc-3\"></span> " + mathRes[0].target1() + " g/dl)</th><td>" + mathRes[0]['target1Iron'] + "</td><td><small>mg</small></td></tr>";
    s = s + "<tr><th scope=\"row\"><span id=\"calc-4\"></span> (<span id=\"calc-5\"></span> " + mathRes[0].target2() + " g/dl)</th><td>" + mathRes[0]['target2Iron'] + "</td><td><small>mg</small></td></tr>";
    s = s + "<tr><th scope=\"row\"><span id=\"calc-1\"></span></th><td>" + mathRes[1] + "</td><td><small>-/-</small></td></tr>";
    s = s + "<tr><th scope=\"row\"><span id=\"calc-2\"></span></th><td>" + mathRes[2] + "</td><td><small>-/-</small></td></tr>";
    s = s + "<tr><th scope=\"row\"><span id=\"calc-6\"></span></th><td>" + mathRes[3] + "</td><td><small>kg/m^2</small></td></tr>";
    s = s + "</tbody></table></div></div>";
    return s;
}

function createIronPlotCard(res, width) {    
    var s = "<div id=\"ironplot-card-body\" class=\"card-body\"><h4 class=\"card-title\"><span id=\"thplot\"></span></h4><table class=\"table table-hover\"><tbody>";
    s = s + "<canvas id=\"graphics\" width=\"" + width + " \" height=\"300\" style=\"border:1px solid #00FF00;\">Keine Unterstützung für Canvas</canvas>"
    return s;
}

function composeResultCards() {

    /* Clinical Decision ausführen und Ergebnisstruktur speichern */    
    var resData = decision.result(),
    
    /* Diagnosenkarte */
        htmlString = createDiagnosisCard(resData.diagnoses);
    $("#diagnosis-card").html(htmlString);    
    
    /* Empfehlungskarte */
    htmlString = createRecommendsCard(resData.recommends);
    $("#recommends-card").html(htmlString);    

    /* Karte für die Berechnungsergebnisse*/
    htmlString = createCalcValuesCard(resData.maths);
    $("#calcvalue-card").html(htmlString);

    /* Thomas-Plot-Karte */    
    htmlString = createIronPlotCard(resData.maths, $("#ironplot-card-body").width());
    $("#ironplot-card").html(htmlString);

    // Thomas-Plot durchführen
    // Noch CRP-Normal oder Nicht einbauen!!  
    var ctx = document.getElementById('graphics').getContext('2d');
    var scatterChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Margins - x: TfR-F-Index y: Reti-Hb',                
                data: [ {
                            x: 0,
                            y: 0,                            
                        }, {
                            x: 0,
                            y: configuration.averageRetiHb
                        }, {
                            x: 0,
                            y: configuration.averageRetiHb * 2
                        }, {
                            x: resData.maths[4] * 2,
                            y: 0
                        }, {
                            x: resData.maths[4] * 2,
                            y: configuration.averageRetiHb
                        }, {
                            x: resData.maths[4] * 2,
                            y: configuration.averageRetiHb * 2
                        }, {
                            x: resData.maths[4],
                            y: 0
                        }, {
                            x: resData.maths[4],
                            y: configuration.averageRetiHb
                        }, {
                            x: resData.maths[4],
                            y: configuration.averageRetiHb * 2
                        }],                        
            },
            {
                label: 'Patient',
                data: [ {
                            x: resData.maths[2],
                            y: resData.maths[3]
                        }],
                backgroundColor:        '#FF0000',
                pointRadius:            7,
                pointHoverRadius:       10,
                pointHoverBorderColor:  '#0000FF',
                pointHitRadius:         3
            }]
        },
        options: {
            scales: {
                xAxes: [{
                    type: 'linear',
                    position: 'bottom'
                }]
            },
            legend: {
                display: true,
                position: 'top'
            }            
        }
    });

    /* Beschriftung nach eingestellter Sprache */
    actualLanguage = $('#lang-flag').data('actual-lang');
    translateLabels(actualLanguage);           
}

/**
 * Ergebniskarten bei App-Start zusammenstellen und visualisieren
 */
$(document).ready(function() {

    /* Revisualisierung des Fensterinhalts bei Resizing des Fensters, insbesondere der Grafikdarstellung */
    $(window).resize(function() {
        composeResultCards();
    });

    /* Visualisierung an den Reload-Button hängen */
    $("#lab7").click(function () {         
        composeResultCards();
    });            
 
    /* Ergebnisse zusammenstellen und bei App-Start visualisieren */
    composeResultCards();

});