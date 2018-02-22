/**
 * Copyright bei G. Füchsl - 2018
 */
 
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
        classOfInput = "";
    
    /* Validierung der Patientendaten */
    
    /* Wenn der Datenset vom Typ 'Key-Value' ist, dann ...*/
    if (dataset.type == "key-val") {
        
        /* Überschrift erstellen ... */        
        str = "<div class=\"card-body\"><h4 class=\"card-title\"><span id=\"" + dataset.id + "\">" + dataset.name + "<span></h4><table class=\"table table-hover\"><tbody>";
        
        for(i = 0; i < dataset.kval.length; i++) {
            
            /* ZENTRAL: Hier werden die Datenstrukturen für die Datenübergabe zum Decision-Finding festgelegt
               Input-Feld verwenden und Laborwert in das Input-Feld schreiben 
               Input-Feld mit ID und Klasse versehen, damit die Werte für das Decision-Finding standardisiert ausgelesen werden können             
            */            
            decision.setItem(dataset.kval[i]['id'], dataset.kval[i]['value'], null);            
            
            /* Built der Kartenzeile */
            idOfInput = "ds_" + dataset.kval[i]['id'];
            classOfInput = "ds_values";
            str = str + "<tr><th scope=\"row\"><span id=\"" + dataset.kval[i]['id'] + "\">" + dataset.kval[i]['name'] + "</span></th><td><span class=\"badge badge-info\">" + dataset.kval[i]['value'] + "</span></td><td><small><input id=\"" + idOfInput + "\" class=\"" + classOfInput + "\" size=\"2\" type=\"text\" value=\"" + dataset.kval[i]['value'] + "\"></input></small></td><td><small>" + dataset.kval[i]['unit'] + "</small></td></tr>";                        
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

function isValide(dataset) {
    
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
        classOfInput = "";

    /* Validierung der Labordaten */
    
    /* Wenn der Datenset vom Typ 'Key-Value-Ref' ist, dann ...*/
    if (dataset.type == "key-val-ref") {

        /* Überschrift erstellen */        
        str = "<div class=\"card-body\"><h4 class=\"card-title\"><span id=\"" + dataset.id + "\">" + dataset.name + "<span></h4><table class=\"table table-hover\"><tbody>";
        
        /* Zeile für Zeile aus den übergebenen Daten zuammenführen */
        for(i = 0; i < dataset.kval.length; i++) {            
            str = str + "<tr><th scope=\"row\"><span id=\"" + dataset.kval[i]['id'] + "\">" + dataset.kval[i]['name'] + "</span>";

            /* Referenzbreich beachten und angeben */
            inNormRange = testNormalAndValidRange(dataset.kval[i]['value'], dataset.kval[i]['refMin'], dataset.kval[i]['refMax'], dataset.kval[i]['validMin'], dataset.kval[i]['validMax']);            
            hstr = "<span class=\"badge badge-" + inNormRange.color + "\">" + inNormRange.status + "</span>";            
            
            /* ZENTRAL: Hier werden die Datenstrukturen für die Datenübergabe zum Decision-Finding festgelegt
               Input-Feld verwenden und Laborwert in das Input-Feld schreiben 
               Input-Feld mit ID und Klasse versehen, damit die Werte für das Decision-Finding standardisiert ausgelesen werden können 
               Status relativ zum Referenzbereich an das Inputfeld hängen
            */
            decision.setItem(dataset.kval[i]['id'], dataset.kval[i]['value'], inNormRange.status);
            
            idOfInput = dataset.kval[i]['id'];
            classOfInput = "ds_values";
            str = str + "<td>" + hstr + "</td><td><span class=\"badge badge-info\">" + dataset.kval[i]['value'] + "</span></td></th><td><b><i><small><input id=\"" + idOfInput + "\" class=\"" + classOfInput + "\" size=\"2\" type=\"text\" value=\"" + dataset.kval[i]['value'] + "\"></input></small></i></b></td>";            
            /* Anhängen der Lage relativ zum Referenzbereich noch notwendig */
            
            /* Einheit und Referenzbereich angeben */            
            str = str + "<td><small>" + dataset.kval[i]['unit'] + "</small></td>";
            str = str + "<td><small><span id=\"" + idOfInput + "_refMin\">" + dataset.kval[i]['refMin'] + "</span></small></td>";
            str = str + "<td><small>-</small></td>";
            str = str + "<td><small><span id=\"" + idOfInput + "_refMax\">" + dataset.kval[i]['refMax'] + "</span></small></td></tr>";                                

        }
        
        /* Abschluss für die Card */
        str = str + "</tbody></table></div></div>";
    }

    return str;

}

/**
 * Funktion zur Zusammenstellung aller Patientendaten, die für die Visualisierung und Berechnung erforderlich sind
 * Aufruf am Anfang und bei Betätigen des 'Reload'-Buttons
 */
function composeCards() {
    
    if (arguments.length == 2) {

        var patient = arguments[0],
            observations = arguments[1];
        
        /* Administrative Patientendaten als NavBar*/
        var dataset = getPatientDemographics(patient);
        createPatientDemographics(dataset);
        
        /* Patientendatenkarte */
        dataset = getPatientClinicalObservations(observations);    
        var htmlString = createPatientCard(dataset);       
        $("#patient-card").html(htmlString);

        /* Laborkarte */    
        dataset = getPatientLaboratoryObservations(observations);    
        htmlString = createLabCard(dataset);
        $("#laboratory-card").html(htmlString);        

        /* Beschriftung nach eingestellter Sprache */
        actualLanguage = $('#lang-flag').data('actual-lang');
        translateLabels(actualLanguage);       

    } else {
        alert(Object.getOwnPropertyNames(arguments[1]));
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