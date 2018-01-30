/**
 * Copyright bei G. Füchsl - 2018
 */
 
function createDiagnosisCard(diag) {
    var s = "<div class=\"card-body\"><h4 class=\"card-title\"><span id=\"diagnosis-1\"></span></h4>";
    for(var i = 0; i < diag.length; i++) {
        s = s + "<hr><h5 class=\"card-text\"><span id=" + diag[i]['id'] + "><span></h5>";
    }
    s = s + "<hr></div></div>";
    return s;
}

function createRecommendsCard(rec) {
    var s = "<div class=\"card-body\"><h4 class=\"card-title\"><span id=\"recommend-1\"></span></h4>";
    for(var i = 0; i < rec.length; i++) {
        s = s + "<hr><h5 class=\"card-text\"><span id=" + rec[i]['id'] + "><span></h5>";
    }
    s = s + "<hr></div></div>";
    return s;
}

function createCalcValuesCard() {

}

function createIronPlotCard() {

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