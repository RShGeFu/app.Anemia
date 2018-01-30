/**
 * Copyright bei G. Füchsl - 2018
 */
 
function createDiagnosisCard() {
    
}

function createRecommendsCard() {

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
    
    if (decision.result) {
        resData = decision.result().diagnoses[0].de + " - " + decision.result().recommends[0].de;
    } else {
        resData = "Kein Zugriff";
    }
    alert("Ergebnis: " + resData);

    composeResultCards();
});