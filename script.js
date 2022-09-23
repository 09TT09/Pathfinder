/* Variables globales */
var buttonState = 0; // Etat des boutons "Point de départ" et "Point d'arrivé"
var selectedCells = [null, null, null, null]; // cellule de départ, cellule d'arrivé, ancienne cellule de départ, ancienne cellule d'arrivé
var statsButtonState = false;
var cellsNavigation = [];
var dimension;
var cellsColorDisplayDelay = 5;

/* Ecouteurs d'événements */
document.getElementById("gridCreate").addEventListener("click", functionResetVariables);
document.getElementById("startPoint").addEventListener("click", functionStartPoint);
document.getElementById("endPoint").addEventListener("click", functionEndPoint);
document.getElementById("findPath").addEventListener("click", functionfindPathCheckError);
document.getElementById("closeError").addEventListener("click", functionCloseWindowError);
document.getElementById("showStats").addEventListener("click", functionShowStats);

/* Ferme la fenêtre d'erreur */
function functionCloseWindowError(){
    document.getElementById("hiddenContainer").style.display = "none";
    document.getElementById("alertBox").style.display = "none";
}

/* Affiche ou masque les statistiques (distance entre le point d'arrivé et de départ)*/
function functionShowStats(){
    let buttonStats = document.getElementById("showStats");
    let cellsNumber = dimension * dimension;
    let displayType;
    if (statsButtonState === false){
        displayType = "block";
        buttonStats.style.backgroundColor = "magenta";
    }
    else {
        displayType = "none";
        buttonStats.style.removeProperty("background-color");
    }
    for(let show = 0; show < cellsNumber; show++){
        document.getElementsByClassName("cell_stats")[show].style.display = displayType;
    }
    statsButtonState = !statsButtonState;
}

/* Réinitialise les variables globales */
function functionResetVariables(){
    selectedCells = [null, null, null, null];
    cellsNavigation = [];
    dimension;
    functionGridVerification();
}

/* Vérification de la surface de la grille avant création */
function functionGridVerification(){
    let valueGridArea = Math.trunc(document.getElementById("gridArea").value);
    if (valueGridArea > 0){
        functionGridCreate(valueGridArea);
    }
    else {
        document.getElementById("hiddenContainer").style.display = "flex";
        document.getElementById("alertBox").style.display = "flex";
        document.getElementById("contentError").innerHTML = "La surface de la grille ne peut pas être égale ou inférieure à 0";
    }
}

/* Création de la grille */
function functionGridCreate(valueGridArea){
    let cellDisplayType
    statsButtonState === true ? cellDisplayType = "cell_stats_display_block" : cellDisplayType = "cell_stats_display_none";

    dimension = parseInt(document.getElementById("gridArea").value);
    document.getElementById("content").innerHTML = "";
    document.getElementById("content").insertAdjacentHTML("beforeend", `<table class="grid"><tbody id="tablebody"></tbody></table>`);
    /* insertion lignes et cellules */
    for(let lines = 0; lines < valueGridArea; lines++){
        document.getElementById("tablebody").insertAdjacentHTML("beforeend", `<tr id="line-${lines + 1}"></tr>`)
        for(let cells = 0; cells < valueGridArea; cells++){
            let cellId = (cells + (lines * valueGridArea)) + 1;
            document.getElementById(`line-${lines + 1}`).insertAdjacentHTML("beforeend", `
                <td class="allCells" id="cell-${cellId}">
                    <div class="cell_stats ${cellDisplayType}">
                        <div class="cell_stats_top" id="mergeStartEndPoints-${cellId}"></div>
                        <div class="cell_stats_bottom">
                            <div class="cell_stats_left" id="startPointDistance-${cellId}"></div>
                            <div class="cell_stats_right" id="endPointDistance-${cellId}"></div>
                        </div>
                    </div>
                </td>
            `)
        }
    }

    functionGenerateNewHeaderButtons()
}

/* Affiche les buttons "Point de départ" et "Point d'arrivé" */
function functionGenerateNewHeaderButtons(){
    document.getElementById("headerHiddenButtons").style.display="block";
    functionActivateCellsEventsListeners()
}

/* Active les écouteurs d'événements sur les cellules */
function functionActivateCellsEventsListeners(){
    document.querySelectorAll('.allCells').forEach(cells => {
        cells.addEventListener('click', event => {
            const cellColor = ["crimson", "lime"];
            selectedCells[buttonState - 1] = cells.id;

            if (selectedCells[buttonState + 1] != null){
                document.getElementById(selectedCells[buttonState + 1]).style.removeProperty("background-color");
            }

            // cellule de départ === ancienne cellule d'arrivé
            if (selectedCells[0] === selectedCells[3] && selectedCells[3] != null){
                selectedCells[1] = null;
                selectedCells[3] = null;
            }
            // cellule d'arrivé === ancienne cellule de départ
            else if (selectedCells[1] === selectedCells[2] && selectedCells[2] != null){
                selectedCells[0] = null;
                selectedCells[2] = null;
            }
            
            if (buttonState != 0){
                document.getElementById(cells.id).style.backgroundColor = cellColor[buttonState - 1];
                selectedCells[buttonState + 1] = cells.id;
            }
        })
    })
} 

/* Activation bouton "Point de départ" */
function functionStartPoint(){
    document.getElementById("startPoint").style.cssText = "background-color:crimson;color:white";
    document.getElementById("endPoint").style.removeProperty("background-color");
    buttonState = 1;
}

/* Activation bouton "Point d'arrivé" */
function functionEndPoint(){
    document.getElementById("startPoint").style.removeProperty("background-color");
    document.getElementById("startPoint").style.removeProperty("color");
    document.getElementById("endPoint").style.backgroundColor = "lime";
    buttonState = 2;
}

function functionfindPathCheckError(){
    if (selectedCells[0] === null || selectedCells[1] === null){
        document.getElementById("hiddenContainer").style.display = "flex";
        document.getElementById("alertBox").style.display = "flex";
        errorMessage = document.getElementById("contentError");
        selectedCells[0] === null ? errorMessage.innerHTML = "Vous n'avez pas défini de point de départ" : errorMessage.innerHTML = "Vous n'avez pas défini de point d'arrivé";
    }
    else {
        let startPointId = parseInt(selectedCells[0].split('-')[1]);
        let endPointId = parseInt(selectedCells[1].split('-')[1]);
        cellsNavigation.push(endPointId, startPointId);
        let endPointFound = false;
        let search = 1;
        functionfindPath(endPointFound, search);
    }
}





























let insertValueDistanceStartPoint = 1;
let insertValutDisatnceEndPoint = 0;
let x = 4;
let y = 1;
let adapt = true;

function functionfindPath(endPointFound, search){
    let verification = true;
    let endPointLine = (cellsNavigation[0] / dimension) + 1;

    if (endPointFound === false){
        setTimeout(function(){
            let actualPoint = parseInt(cellsNavigation[search]);
            let checkErrorLine = document.getElementById(`cell-${actualPoint}`).parentElement.id;
            let searchAreaValue = [
                (actualPoint - dimension), // haut
                (actualPoint + 1), // droite
                (actualPoint + dimension), // bas
                (actualPoint - 1) // gauche
            ];


            for (let searchArea = 0; searchArea < 4; searchArea++){
                let actualLine;
                if (document.getElementById(`cell-${searchAreaValue[searchArea]}`)){
                    actualLine = document.getElementById(`cell-${searchAreaValue[searchArea]}`).parentElement.id;
                }

                if (searchArea === 1 || searchArea === 3){
                    if (checkErrorLine != actualLine){
                        verification = false;
                    }
                }

                if (search === 2 & adapt === true){
                    insertValueDistanceStartPoint++;
                    adapt = false;
                }
                if (search - 2 === x * y){  // formule (4*1 -> 6*2 -> 8*3) -> (x+2 * y+1)
                    insertValueDistanceStartPoint++;
                    x = x + 2;
                    y++;
                }
        
                if (cellsNavigation.indexOf(searchAreaValue[searchArea]) != -1 || actualLine === undefined){
                    if (cellsNavigation[0] === searchAreaValue[searchArea]){ endPointFound = true; }
                }
                else {
                    if (verification === true){
                        let lineCount;
                        let ColumnCount;
                        let endPointDistance;
                        let startPointLine = (searchAreaValue[searchArea] / dimension) + 1;
                        let startPointLineTrunc = parseInt(Math.trunc(startPointLine));
                        let endPointLineTrunc = parseInt(Math.trunc(endPointLine));
                        
                        if (startPointLineTrunc > endPointLineTrunc){ lineCount = startPointLineTrunc - endPointLineTrunc; }
                        else{ lineCount = endPointLineTrunc - startPointLineTrunc; }

                        if (cellsNavigation[0] % dimension > searchAreaValue[searchArea] % dimension){ ColumnCount = (cellsNavigation[0] % dimension) - (searchAreaValue[searchArea] % dimension); }
                        else { ColumnCount = (searchAreaValue[searchArea] % dimension) - (cellsNavigation[0] % dimension); }
                        let insertValueDistanceEndPoint = (lineCount + ColumnCount) * 2; // fois 2 = priorisation du point d'arrivé par rapport au point de départ

                        cellsNavigation.push(parseInt(searchAreaValue[searchArea]));
                        document.getElementById(`cell-${searchAreaValue[searchArea]}`).style.backgroundColor = "#bd00ff";
                        document.getElementById(`startPointDistance-${searchAreaValue[searchArea]}`).innerHTML = insertValueDistanceStartPoint;
                        document.getElementById(`endPointDistance-${searchAreaValue[searchArea]}`).innerHTML = insertValueDistanceEndPoint;
                        document.getElementById(`mergeStartEndPoints-${searchAreaValue[searchArea]}`).innerHTML = insertValueDistanceStartPoint + insertValueDistanceEndPoint;
                    }
                }          
            }
            if (endPointFound != true){
                search++;
                functionfindPath(endPointFound, search);
            } else {
                //functionCalculateDistanceEndPoint();
            }
        }, cellsColorDisplayDelay);
    }
}

/*
function functionCalculateDistanceEndPoint(){
    let startPointId = parseInt(selectedCells[0].split('-')[1]);
    let endPointId = parseInt(selectedCells[1].split('-')[1]);
    cellsNavigation.push(endPointId, startPointId);
    let startPointLine = (cellsNavigation[1] / dimension) + 1;
    let endPointLine = (cellsNavigation[0] / dimension) + 1;

    let checkPointLine = document.getElementById(`cell-${endPointId}`).parentElement.id;

    while(Math.trunc(startPointLine) != Math.trunc(endPointLine)){
        if(Math.trunc(startPointLine) > Math.trunc(endPointLine)){ startPointLine = startPointLine - 1; }
        else{ startPointLine = startPointLine + 1; }
    }
}*/