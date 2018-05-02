/**
 * Copyright bei G. Füchsl - 2018
 */

/** SVG-Elemente für die Buttons - Download von FontAwesome */
var chart = "<svg width=\"20\" height=\"16\" viewBox=\"0 0 512 512\"><path d=\"M500 400c6.6 0 12 5.4 12 12v24c0 6.6-5.4 12-12 12H12c-6.6 0-12-5.4-12-12V76c0-6.6 5.4-12 12-12h24c6.6 0 12 5.4 12 12v324h452zm-356-60v-72c0-6.6-5.4-12-12-12h-24c-6.6 0-12 5.4-12 12v72c0 6.6 5.4 12 12 12h24c6.6 0 12-5.4 12-12zm96 0V140c0-6.6-5.4-12-12-12h-24c-6.6 0-12 5.4-12 12v200c0 6.6 5.4 12 12 12h24c6.6 0 12-5.4 12-12zm96 0V204c0-6.6-5.4-12-12-12h-24c-6.6 0-12 5.4-12 12v136c0 6.6 5.4 12 12 12h24c6.6 0 12-5.4 12-12zm96 0V108c0-6.6-5.4-12-12-12h-24c-6.6 0-12 5.4-12 12v232c0 6.6 5.4 12 12 12h24c6.6 0 12-5.4 12-12z\"/></svg>",
    cart  = "<svg width=\"20\" height=\"16\" viewbox=\"0 0 576 512\"><path d=\"M504.717 320H211.572l6.545 32h268.418c15.401 0 26.816 14.301 23.403 29.319l-5.517 24.276C523.112 414.668 536 433.828 536 456c0 31.202-25.519 56.444-56.824 55.994-29.823-.429-54.35-24.631-55.155-54.447-.44-16.287 6.085-31.049 16.803-41.548H231.176C241.553 426.165 248 440.326 248 456c0 31.813-26.528 57.431-58.67 55.938-28.54-1.325-51.751-24.385-53.251-52.917-1.158-22.034 10.436-41.455 28.051-51.586L93.883 64H24C10.745 64 0 53.255 0 40V24C0 10.745 10.745 0 24 0h102.529c11.401 0 21.228 8.021 23.513 19.19L159.208 64H551.99c15.401 0 26.816 14.301 23.403 29.319l-47.273 208C525.637 312.246 515.923 320 504.717 320zM403.029 192H360v-60c0-6.627-5.373-12-12-12h-24c-6.627 0-12 5.373-12 12v60h-43.029c-10.691 0-16.045 12.926-8.485 20.485l67.029 67.029c4.686 4.686 12.284 4.686 16.971 0l67.029-67.029c7.559-7.559 2.205-20.485-8.486-20.485z\"/></svg>";
 
/**
 * Funktion für das Einsetzen/Visualisieren der Patientendaten in die Navbar
 * @param {*} dataset 
 */
function createPatientDemographics(dataset) {

    var i, j, str;

    /* Validierung der demographischen Patientendaten */

    if (dataset.type == "key-val") {
        
        for(i = 0; i < dataset.kval.length; i++) {                                    
            
            // Wenn die ein Item des Datensets ein Array ist, dann ... (betrifft die Diagnosenliste, 
            // potentiell für andere Datenrubriken benutzbar)
            if (Array.isArray(dataset.kval[i]['val'])) {                
                str = "";
                for(j = 0; j < dataset.kval[i]['val'].length; j++) {
                    str = str + "<a class=\"dropdown-item\" href=\"#\">" + dataset.kval[i]['val'][j] + "</a>";
                }
                $('#'+dataset.kval[i]['id']).html(str);
            
                /* andernfalls setze die realen Werte ein und betone sie farblich! */
            } else {
                $('#'+dataset.kval[i]['id']).html(dataset.kval[i]['val']);
                $('#'+dataset.kval[i]['id']).attr('style', 'color:#FFFFFF;');
            }

        }

    }

}

/**
 * Funktion für die Erstellung von Tabelleneinträgen zur Visualisierung der erhobenen Patientenwerte
 * @param {*} dataSet 
 */
function createPatientCard(dataset) { 
    let str = "",
        idOfInput = "",
        classOfInput = "",
        disab = "";
    
    /* Validierung der Patientendaten */
    
    /* Wenn der Datenset vom Typ 'Key-Value' ist, dann ...*/
    if (dataset.type == "key-val") {
        
        /* Überschrift erstellen ... */        
        str = "<div class=\"card-body\"><h4 class=\"card-title\"><span id=\"" + dataset.id + "\">" + dataset.name + "<span></h4><table class=\"table table-hover table-sm\"><tbody>";
        
        for(i = 0; i < dataset.kval.length; i++) {
            
            /* ZENTRAL: Hier werden die Datenstrukturen für die Datenübergabe zum Decision-Finding festgelegt
               Input-Feld verwenden und Laborwert in das Input-Feld schreiben 
               Input-Feld mit ID und Klasse versehen, damit die Werte für das Decision-Finding standardisiert ausgelesen werden können             
            */            
            decision.setItem(dataset.kval[i]['id'], dataset.kval[i]['value'], null);            
            
            /* Built der Kartenzeile */
            idOfInput = dataset.kval[i]['id'];
            classOfInput = "ds_values_gf";
            disab = dataset.kval[i]['value'] != 0 ? "disabled" : "";
            str = str + "<tr><th scope=\"row\"></th><td><span id=\"" + dataset.kval[i]['id'] + "\">" + dataset.kval[i]['name'] + "</span><td><span class=\"badge badge-info\">" + dataset.kval[i]['value'] + "</span></td><td><small><input id=\"" + idOfInput + "\" class=\"" + classOfInput + "\" size=\"2\" type=\"text\" value=\"" + dataset.kval[i]['value'] + "\"></input></small></td><td><small>" + dataset.kval[i]['unit'] + "</small></td>";
            str = str + "<td><div class=\"btn-group btn-group-sm\" role=\"group\" aria-label=\"Basic example\">";
            str = str + "<button id =\"" + dataset.kval[i]['id'] + "\" type=\"button\" class=\"btn btn-outline-primary ds_chart_gf\">" + chart + "</button>";
            str = str + "<button id =\"" + dataset.kval[i]['id'] + "\" type=\"button\" class=\"btn btn-outline-primary ds_request_gf\" " + disab + ">" + cart + "</button></div></td></tr>";
                        
        }

        /* Abschluss für die Card */
        str = str + "</tbody></table></div></div>";
    }
        
    return str;

}

/**
 * (Hilfs-)Funktion für den Test eines Laborwertes, ob dieser im angegebenen Normalbereich liegt
 * @param {*} value
 * @param {*} refMin 
 * @param {*} refMax
 */
function testNormalAndValidRange(value, refMin, refMax, validMin, validMax) {

    /* Auch wirklich vom Typ Number */
    refMin = Number(refMin);
    refMax = Number(refMax);
    validMin = Number(validMin);
    validMax = Number(validMax);

    /* Zunächst ist alles ok! */
    var retVal = { status: 'ok', color: 'success' };
    
    /* Wenn der Wert keine Zahl ist, dann sind die Werte nicht validiert! */    
    if (isNaN(value) || isNaN(refMin) || isNaN(refMin)) {
        
        retVal = { status: 'nv nan', color: 'primary'};
        
    /* Wenn der Wert außerhalb des Validitätsbereichs liegt, dann sind die Werte nicht validiert! */    
    } else if (value < validMin || value > validMax) {
        
        retVal = { status: 'nv nvr', color: 'secondary'};
        
    } else {
        
        /* Wert liegt unter dem Referenzbereich */
        if (value < refMin) {
            retVal = { status: 'low', color: 'danger' };
        }
    
        /* Wert liegt über dem Referenzbereich */
        if (value > refMax) {
            retVal = { status: 'high', color: 'danger' };
        }

    }
    
    return retVal;
}

/**
 * Funktion für die Erstellung von Tabelleneinträgen zur Visualisierung der erhobenen Laborwerte
 * @param {*} dataSet 
 */
function createLabCard(dataset) {
    let str = "",
        hstr = "",
        inNormRange = { },
        idOfInput = "",
        classOfInput = "",
        disab = "";

    /* Validierung der Labordaten */
    
    /* Wenn der Datenset vom Typ 'Key-Value-Ref' ist, dann ...*/
    if (dataset.type == "key-val-ref") {

          /* Überschrift erstellen */        
        str = "<div class=\"card-body\"><h4 class=\"card-title\"><span id=\"" + dataset.id + "\">" + dataset.name + "<span></h4><table class=\"table table-hover table-sm\"><tbody>";
        
        /* Zeile für Zeile aus den übergebenen Daten zuammenführen */
        for(i = 0; i < dataset.kval.length; i++) {            
            idOfInput = dataset.kval[i]['id'];
            classOfInput = "ds_values_gf";

            str = str + "<tr><th scope=\"row\"></th>";
            str = str + "<td><span id=\"" + dataset.kval[i]['id'] + "\">" + dataset.kval[i]['name'] + "</span></td>";

            /* Referenzbreich beachten und angeben */
            inNormRange = testNormalAndValidRange(dataset.kval[i]['value'], dataset.kval[i]['refMin'], dataset.kval[i]['refMax'], dataset.kval[i]['validMin'], dataset.kval[i]['validMax']);            
            hstr = "<span id=\"" + idOfInput + "_b\" class=\"badge badge-" + inNormRange.color + "\">" + inNormRange.status + "</span>";            
            
            /* ZENTRAL: Hier werden die Datenstrukturen für die Datenübergabe zum Decision-Finding festgelegt
               Input-Feld verwenden und Laborwert in das Input-Feld schreiben 
               Input-Feld mit ID und Klasse versehen, damit die Werte für das Decision-Finding standardisiert ausgelesen werden können 
               Status relativ zum Referenzbereich an das Inputfeld hängen
            */
            decision.setItem(dataset.kval[i]['id'], dataset.kval[i]['value'], inNormRange.status);
            
            str = str + "<td>" + hstr + "</td><td><span class=\"badge badge-info\">" + dataset.kval[i]['value'] + "</span></td><td><b><i><small><input id=\"" + idOfInput + "\" class=\"" + classOfInput + "\" size=\"2\" type=\"text\" value=\"" + dataset.kval[i]['value'] + "\"></input></small></i></b></td>";            
            
            /* Einheit und Referenzbereich angeben */            
            str = str + "<td><small>" + dataset.kval[i]['unit'] + "</small></td>";
            str = str + "<td><small><span id=\"" + idOfInput + "_refMin\">" + dataset.kval[i]['refMin'] + "</span></small></td>";
            str = str + "<td><small>-</small></td>";
            str = str + "<td><small><span id=\"" + idOfInput + "_refMax\">" + dataset.kval[i]['refMax'] + "</span></small></td>";                                

            /* Buttongroup für Graphische Darstellung und FHIR-Anforderung dieses Laborparameters */
            disab = inNormRange.status.substring(0, 2) === "nv" ? "" : "disabled";            
            str = str + "<td><div class=\"btn-group btn-group-sm\" role=\"group\" aria-label=\"Basic example\">";
            str = str + "<button id =\"" + dataset.kval[i]['id'] + "\" type=\"button\" class=\"btn btn-outline-primary ds_chart_gf\">" +  chart + "</button>";
            str = str + "<button id =\"" + dataset.kval[i]['id'] + "\" type=\"button\" class=\"btn btn-outline-primary ds_request_gf\" " + disab + ">" + cart + "</button></div></td></tr>";

        }
        
        /* Abschluss für die Card */
        str = str + "</tbody></table></div></div>";
    }

    return str;

}

/**
 * Zwei Hilfsfunktionen, um der EU-DSGVO gerecht zu werden
 * 1. Zunächst werden alle Observations abgefragt, da die Requests verschiedene Ansatzpunkte haben und bei der Funktion composeCards()
 *    zusammenlaufen. Hier werden nicht benötigte Observations entfernt.
 * 2. Personenbezogene Daten werden pseudonymisiert - Nutzung der Funktion im Objekt 'observationSet'
 */
function rejectUnnecessaryObservations() {    
    observationSet.rejectObservations(configuration.defaultReference);
}

function hidePersonalData() {
    observationSet.hidePatient();    
}

/**
 * Funktion zur Zusammenstellung aller Patientendaten, die für die Visualisierung und Berechnung erforderlich sind
 * Aufruf am Anfang und bei Betätigen des 'Reload'-Buttons
 */
function composeCards() {
    
    // Nur wenn Patientendaten und Observations übergeben werden, dann ...
    if (arguments.length == 2) {
        
        var patient = arguments[0],         // Zur besseren Lesbarkeit des Codes ...
            observations = arguments[1];
            
        /* Administrative Patientendaten als NavBar */
        var dataset = getPatientDemographics(patient);
        createPatientDemographics(dataset);
        
        /* Patientendatenkarte */
        dataset = getPatientClinicalObservations(observations);        
        var htmlString = createPatientCard(dataset);       
        $("#patient-card").html(htmlString);        

        /* Laborkarte */  
        dataset = getPatientLaboratoryObservations(observations, patient);    
        htmlString = createLabCard(dataset);
        $("#laboratory-card").html(htmlString);        

        /* Beschriftung nach eingestellter Sprache */
        actualLanguage = $('#lang-flag').data('actual-lang');
        translateLabels(actualLanguage);

        rejectUnnecessaryObservations();

        hidePersonalData();

    } else {
        
        // ... ansonsten werden die Funktionen ohne Parameter aufgerufen und liefern Testdatensätze zurück, mit denen
        // der User 'spielen' kann.
        
        /* Administrative Patientendaten als NavBar*/
        var dataset = getPatientDemographics();
        createPatientDemographics(dataset);

        /* Patientendatenkarte */
        dataset = getPatientClinicalObservations();    
        var htmlString = createPatientCard(dataset);       
        $("#patient-card").html(htmlString);

        /* Laborkarte */    
        dataset = getPatientLaboratoryObservations();    
        htmlString = createLabCard(dataset);
        $("#laboratory-card").html(htmlString);

        /* Beschriftung nach eingestellter Sprache */
        actualLanguage = $('#lang-flag').data('actual-lang');
        translateLabels(actualLanguage);       

    }


}