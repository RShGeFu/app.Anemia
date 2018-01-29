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

/**
 * Ergebniskarten bei App-Start zusammenstellen und visualisieren
 */
$(document).ready(function() {

    var decData;    

    /* Stelle die Datenstruktur für die Entscheidung zusammen */
    if (decision.result) {
        decData = decision.result().diagnoses[0].de + " - " + decision.result().recommends[0].de;
    } else {
        decData = "Kein Zugriff";
    }
    alert("Ergebnis: " + decData);
});