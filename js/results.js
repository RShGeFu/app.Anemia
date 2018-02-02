/**
 * Copyright bei G. Füchsl - 2018
 */

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
    s = s + "<tr><th scope=\"row\"><span id=\"calc-2\"></span></th><td>" + mathRes[2] + "</td><td><small>?</small></td></tr>";
    s = s + "<tr><th scope=\"row\"><span id=\"calc-6\"></span></th><td>" + mathRes[3] + "</td><td><small>kg/cm^2</small></td></tr>";
    s = s + "</tbody></table></div></div>";
    return s;
}

function createIronPlotCard() {
    var s = "<div class=\"card-body\"><h4 class=\"card-title\"><span id=\"thplot\"></span></h4><table class=\"table table-hover\"><tbody>";
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
    htmlString = createIronPlotCard(resData.maths);
    $("#ironplot-card").html(htmlString);

    /* Beschriftung nach eingestellter Sprache */
    actualLanguage = $('#lang-flag').data('actual-lang');
    translateLabels(actualLanguage);           
}

/**
 * Ergebniskarten bei App-Start zusammenstellen und visualisieren
 */
$(document).ready(function() {
 
    composeResultCards();

});