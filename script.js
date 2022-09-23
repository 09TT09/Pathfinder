/*_____ STOCKAGE DE DONNEES _____*/

/* Initialisation des constantes globales */
const IDGridArea = document.getElementById("gridArea");
const IDHiddenContainer = document.getElementById("hiddenContainer");
const IDAlertBox = document.getElementById("alertBox");
const IDContentError = document.getElementById("contentError")
const IDGridCreate = document.getElementById("gridCreate");
const IDStartPoint = document.getElementById("startPoint");
const IDEndPoint = document.getElementById("endPoint");
const IDFindPath = document.getElementById("findPath");
const IDCloseError = document.getElementById("closeError");
const IDShowStats = document.getElementById("showStats");
const IDContent = document.getElementById("content");
const IDHeaderHiddenButtons = document.getElementById("headerHiddenButtons");
const IDParams = document.getElementById('params');
const IDExitParams = document.getElementById('exitparams');
const IDDivParams = document.getElementById('divparams');
const IDMsConfig = document.getElementById('msConfig');
const IDAutoPath = document.getElementById('autoPath');
const IDSurfaceHeight = document.getElementById('surfaceHeight');
const IDSurfaceWidth = document.getElementById('surfaceWidth');
const IDSurface = document.getElementById('surface');

/* Initialisation des variables globales */
let GLOBALStatsButtonState = true; // Affichage des statistiques sur les cellules
let GLOBALSelectedCells = [null, null, null, null]; // cellule de depart, cellule d'arrivee, ancienne cellule de depart, ancienne cellule d'arrivee
let GLOBALButtonState = 0; // Etat des boutons "Point de depart" et "Point d'arrive"
let GLOBALCellsDeclared = []; // Cellule de depart et d'arrivee confirmees
let GLOBALDelayAnimCells = 5; // Animations des cellules
let GLOBALAutoPath = true; // Chemin Automatique lors que le point de depart et d'arrive sont places
let GLOBALMaxSurface = 20; // Surface Maximun du tableau (GLOBALMaxSurface ^ 2)
let GLOBALCellsChecked = []; // Cellules dont la zone alentoure a ete verifie
let GLOBALCellsBrowsed = []; // Cellules qui ont ete percu dans la zone

/*_____ ECOUTEURS D'EVENEMENTS _____*/

/* Initialisation des ecouteurs d'evenements */
IDGridCreate.addEventListener("click", functionGridVerification);
IDStartPoint.addEventListener("click", functionStartPoint);
IDEndPoint.addEventListener("click", functionEndPoint);
IDFindPath.addEventListener("click", functionfindPathCheckError);
IDCloseError.addEventListener("click", functionCloseWindowError);
IDShowStats.addEventListener("click", functionShowStats);
IDParams.addEventListener("click", functionShowParams);
IDExitParams.addEventListener("click", functionExitParams);
IDAutoPath.addEventListener("change", functionAutoPath);
IDSurfaceHeight.addEventListener("keyup", functionSurfaceUpdate);

/*_____ FONCTIONS INITIALES _____*/

/* Ouverture de la fenetre de parametres */
function functionShowParams(){
    IDDivParams.style.display = "block";
}

/* Fermeture de la fenetre de parametres */
function functionExitParams(){
    IDDivParams.style.display = "none";
}

/* Cheminement automatique lorsque le point d'arrive et de depart sont places */
function functionAutoPath(){
    GLOBALAutoPath = !GLOBALAutoPath;
}

/* */
function functionSurfaceUpdate(){
    IDSurfaceWidth.innerHTML = IDSurfaceHeight.value;
    IDGridArea.max = IDSurfaceHeight.value;
    GLOBALMaxSurface = IDSurfaceHeight.value;
    IDSurface.innerHTML = IDSurfaceHeight.value * IDSurfaceHeight.value;
}

/* Fermeture de la fenetre d'erreur */
function functionCloseWindowError() {
    IDHiddenContainer.style.display = "none";
    IDAlertBox.style.display = "none";
}

function functionShowStats(){
    const gridCellsNumber = parseInt(Math.pow(Math.trunc(IDGridArea.value), 2));
    let displayType;

    if (GLOBALStatsButtonState === false) {
        displayType = "block";
        IDShowStats.style.removeProperty("background-color");
    }
    
    else {
        displayType = "none";
        IDShowStats.style.backgroundColor = "white";
    }

    for(let showCellStat = 0; showCellStat < gridCellsNumber; showCellStat++){
        const cellStat = document.getElementsByClassName("cell_stats")[showCellStat];
        cellStat.style.display = displayType;
    }

    GLOBALStatsButtonState = !GLOBALStatsButtonState;
}

/*_____ PROCESSUS DE CREATION DE LA GRILLE _____*/

/* Verification de la surface de la grille avant creation */
function functionGridVerification() {
    GLOBALSelectedCells = [null, null, null, null];

    const valueGridArea = parseInt(Math.trunc(IDGridArea.value));

    if (valueGridArea > 0  && valueGridArea <= GLOBALMaxSurface) functionGridCreate(valueGridArea);
    else {
        IDHiddenContainer.style.display = "flex";
        IDAlertBox.style.display = "flex";
        if (valueGridArea <= 0) IDContentError.innerHTML = "La surface de la grille ne peut pas être inférieure ou égale à 0";
        else if (valueGridArea > GLOBALMaxSurface) IDContentError.innerHTML = `La surface de la grille ne peut pas être supérieur à ${GLOBALMaxSurface}`;
    }
}

/* Creation de la grille */
function functionGridCreate(valueGridArea){
    const insertGridBase = `<table class="grid"><tbody id="tableBody"></tbody></table>`;
    let cellDisplayType;

    GLOBALStatsButtonState === true 
        ? cellDisplayType = "cell_stats_display_block"
        : cellDisplayType = "cell_stats_display_none";

    IDContent.innerHTML = "";
    IDContent.insertAdjacentHTML( "beforeend" , insertGridBase );
    const tableBody = document.getElementById("tableBody");

    /* insertion lignes et cellules */
    for (let lines = 0; lines < valueGridArea; lines++) {
        const insertGridLine = `<tr id="line-${lines + 1}"></tr>`;
        tableBody.insertAdjacentHTML( "beforeend" , insertGridLine )

        for (let cells = 0; cells < valueGridArea; cells++) {
            const IDLine = document.getElementById(`line-${lines + 1}`);
            const cellId = `cell-${(cells + 1)};${lines + 1}`; // Coordonnees de la cellule : (axe abscisses - axe ordonnees)
            const insertGridCell = `
                <td class="allCells" id="${cellId}">
                    <div class="cell_stats ${cellDisplayType}">
                        <div class="cell_stats_top" id="mergeStartEndPoints-${cellId}"></div>
                        <div class="cell_stats_bottom">
                            <div class="cell_stats_left" id="startPointDistance-${cellId}"></div>
                            <div class="cell_stats_right" id="endPointDistance-${cellId}"></div>
                        </div>
                    </div>
                </td>
            `;

            IDLine.insertAdjacentHTML( "beforeend" , insertGridCell );
        }
    }

    functionGenerateNewHeaderButtons()
}

/*_____ GESTION BOUTON DE DEPART ET D'ARRIVE _____*/

/* Affiche les buttons "Point de depart" et "Point d'arrive" */
function functionGenerateNewHeaderButtons(){
    IDHeaderHiddenButtons.style.display = "block";
    functionActivateCellsEventsListeners()
}

/* Activation bouton "Point de depart" */
function functionStartPoint(){
    IDStartPoint.style.cssText = "background-color:crimson;color:white";
    IDEndPoint.style.removeProperty("background-color");
    GLOBALButtonState = 1;
}

/* Activation bouton "Point d'arrive" */
function functionEndPoint(){
    IDStartPoint.style.removeProperty("background-color");
    IDStartPoint.style.removeProperty("color");
    IDEndPoint.style.backgroundColor = "lime";
    GLOBALButtonState = 2;
}

/*_____ ACTIVATIONS DES ECOUTEURS D'EVENEMENTS SUR LES CELLULES  _____*/

/* Active les ecouteurs d'evenements sur les cellules */
function functionActivateCellsEventsListeners(){
    const QSAAllCells = document.querySelectorAll('.allCells');

    QSAAllCells.forEach( singleCell => { // Pour chaque cellule du tableau
        singleCell.addEventListener('click', event => {
            const clickedCell = document.getElementById(singleCell.id);

            GLOBALCellsDeclared = [];
            GLOBALCellsChecked = [];
            GLOBALCellsBrowsed = [];
            bestPointArray = [];
            arrayValue = [null, ''];

            for (let i = 0; i < document.getElementsByClassName('allCells').length; i++) {
                if (
                    GLOBALSelectedCells[0] != document.getElementsByClassName('allCells')[i].id &&
                    GLOBALSelectedCells[1] != document.getElementsByClassName('allCells')[i].id
                ) {
                    document.getElementsByClassName('allCells')[i].style.removeProperty("background-color");
                }
                document.getElementsByClassName('cell_stats_top')[i].innerHTML = "";
                document.getElementsByClassName('cell_stats_left')[i].innerHTML = "";
                document.getElementsByClassName('cell_stats_right')[i].innerHTML = "";
            }

            if (GLOBALButtonState === 1) {
                if (GLOBALSelectedCells[0] != null) {
                    GLOBALSelectedCells[2] = GLOBALSelectedCells[0]; // la nouvelle cellule de depart devient la vieille la cellule
                    const oldStartCell = document.getElementById(GLOBALSelectedCells[2]);
                    oldStartCell.style.removeProperty("background-color");
                }
                clickedCell.style.backgroundColor = "crimson";
                GLOBALSelectedCells[0] = singleCell.id;
            }

            if (GLOBALButtonState === 2) {
                if (GLOBALSelectedCells[1] != null) {
                    GLOBALSelectedCells[3] = GLOBALSelectedCells[1]; // la nouvelle cellule de d'arrivee devient la vieille la cellule
                    const oldEndCell = document.getElementById(GLOBALSelectedCells[3]);
                    oldEndCell.style.removeProperty("background-color");
                }
                clickedCell.style.backgroundColor = "lime";
                GLOBALSelectedCells[1] = singleCell.id;
            }

            if (GLOBALAutoPath === true && GLOBALSelectedCells[0] != null && GLOBALSelectedCells[1] != null) {
                functionfindPathCheckError();
            }
        })
    })
}

/* Verification des erreurs lors du lancement du pathfinder */
function functionfindPathCheckError(){

    if (GLOBALSelectedCells[0] === null || GLOBALSelectedCells[1] === null){
        IDHiddenContainer.style.display = "flex";
        IDAlertBox.style.display = "flex";
        GLOBALSelectedCells[0] === null
            ? IDContentError.innerHTML = "Vous n'avez pas défini de point de départ"
            : IDContentError.innerHTML = "Vous n'avez pas défini de point d'arrivé";
    }

    if (GLOBALSelectedCells[0] != null && GLOBALSelectedCells[1] != null) {
        const startPointCoords = GLOBALSelectedCells[0].split('-')[1];
        const endPointCoords = GLOBALSelectedCells[1].split('-')[1];
    
        GLOBALCellsDeclared.push(startPointCoords, endPointCoords);
        let endPointFound = false;
        let GLOBALCellsCheckedNavigation = 0;
        GLOBALDelayAnimCells = IDMsConfig.value;
        functionfindPath(endPointFound, GLOBALCellsCheckedNavigation);
    }
}














let bestPointArray = [];
let arrayValue = [null, ''];

/* Indentification d'un chemin potentiel entre le point de depart et d'arrive */
function functionfindPath(endPointFound, GLOBALCellsCheckedNavigation){
    setTimeout(function(){
   
    // Si le point de depart n'existe pas dans le tableau
    if (GLOBALCellsChecked.indexOf(GLOBALCellsDeclared[0]) === -1) {
        GLOBALCellsChecked.push(GLOBALCellsDeclared[0]);
        GLOBALCellsBrowsed.push(GLOBALCellsDeclared[0]);
    }
    else GLOBALCellsChecked.push(GLOBALCellsBrowsed[GLOBALCellsCheckedNavigation]);

    const actualPointCoordsArray = GLOBALCellsChecked[GLOBALCellsCheckedNavigation].split(';').map(value => parseInt(value));
    const startPointCoordsArray = GLOBALCellsDeclared[0].split(';').map(value => parseInt(value));
    const endPointCoordsArray = GLOBALCellsDeclared[1].split(';').map(value => parseInt(value));

    let searchAreaValues = [ // Zone de recherche autour du point cible (carre)
        `${(actualPointCoordsArray[0] - 1)};${actualPointCoordsArray[1]}`,
        `${(actualPointCoordsArray[0] + 1)};${actualPointCoordsArray[1]}`,
        `${actualPointCoordsArray[0]};${(actualPointCoordsArray[1] - 1)}`,
        `${actualPointCoordsArray[0]};${(actualPointCoordsArray[1] + 1)}`,
        `${(actualPointCoordsArray[0] + 1)};${(actualPointCoordsArray[1] + 1)}`,
        `${(actualPointCoordsArray[0] - 1)};${(actualPointCoordsArray[1] - 1)}`,
        `${(actualPointCoordsArray[0] + 1)};${(actualPointCoordsArray[1] - 1)}`,
        `${(actualPointCoordsArray[0] - 1)};${(actualPointCoordsArray[1] + 1)}`
    ];

    // Si le point d'arrive n'est pas trouve
    if(endPointFound === false) {
        let dataPointArray = [];
        // Analyse la zone autour du point cible
        for (let searchArea = 0; searchArea < 8; searchArea++) {
            const cellSearchId = searchAreaValues[searchArea];
            const cellSearch = document.getElementById(`cell-${cellSearchId}`);
            const cellDataStartPoint = document.getElementById(`startPointDistance-cell-${cellSearchId}`);
            const cellDataEndPoint = document.getElementById(`endPointDistance-cell-${cellSearchId}`);
            const cellDataMerged = document.getElementById(`mergeStartEndPoints-cell-${cellSearchId}`);

            // Si l'id existe
            if (cellSearch) {
                // Si le point de la zone de recherche n'est pas dans le tableau
                if (GLOBALCellsBrowsed.indexOf(cellSearchId) === -1) {
                    if (GLOBALCellsDeclared[1] != cellSearchId) {
                        cellSearch.style.backgroundColor = "#bd00ff";
                    }
                    GLOBALCellsBrowsed.push(cellSearchId);
                }
      
                // Si les coordonnees du point des abscisse et des ordonnees de la cellule cible sont differents du point de depart
                //if (actualPointCoordsArray[0] != startPointCoordsArray[0] && actualPointCoordsArray[1] != startPointCoordsArray[1]) {
                    const actualCellSearchIdSplited = cellSearchId.split(';').map(value => parseInt(value));
                    let calcXStart;
                    let calcYStart;
                    let calcXEnd;
                    let calcYEnd;
                    let distanceStartPoint;
                    let distanceEndPoint;

                    if (actualCellSearchIdSplited[0] > startPointCoordsArray[0]) calcXStart = actualCellSearchIdSplited[0] - startPointCoordsArray[0];
                    else calcXStart = startPointCoordsArray[0] - actualCellSearchIdSplited[0];

                    if (actualCellSearchIdSplited[1] > startPointCoordsArray[1]) calcYStart = actualCellSearchIdSplited[1] - startPointCoordsArray[1];
                    else calcYStart = startPointCoordsArray[1] - actualCellSearchIdSplited[1];

                    if (actualCellSearchIdSplited[0] > endPointCoordsArray[0]) calcXEnd = actualCellSearchIdSplited[0] - endPointCoordsArray[0];
                    else calcXEnd = endPointCoordsArray[0] - actualCellSearchIdSplited[0];

                    if (actualCellSearchIdSplited[1] > endPointCoordsArray[1]) calcYEnd = actualCellSearchIdSplited[1] - endPointCoordsArray[1];
                    else calcYEnd = endPointCoordsArray[1] - actualCellSearchIdSplited[1];

                    /*
                    if (actualPointCoordsArray[0] > startPointCoordsArray[0]) calcXStart = actualPointCoordsArray[0] - startPointCoordsArray[0];
                    else calcXStart = startPointCoordsArray[0] - actualPointCoordsArray[0];

                    if (actualPointCoordsArray[1] > startPointCoordsArray[1]) calcYStart = actualPointCoordsArray[1] - startPointCoordsArray[1];
                    else calcYStart = startPointCoordsArray[1] - actualPointCoordsArray[1];

                    if (actualPointCoordsArray[0] > endPointCoordsArray[0]) calcXEnd = actualPointCoordsArray[0] - endPointCoordsArray[0];
                    else calcXEnd = endPointCoordsArray[0] - actualPointCoordsArray[0];

                    if (actualPointCoordsArray[1] > endPointCoordsArray[1]) calcYEnd = actualPointCoordsArray[1] - endPointCoordsArray[1];
                    else calcYEnd = endPointCoordsArray[1] - actualPointCoordsArray[1];
                    */    

                    distanceStartPoint = calcXStart + calcYStart;
                    distanceEndPoint = (calcXEnd + calcYEnd) * 2; // * 2 => se rapprocher du point d'arrive a un impact plus fort que s'eloigner du point de depart

                    //if (GLOBALCellsDeclared[0] != cellSearchId) {
                        cellDataStartPoint.innerHTML = distanceStartPoint;
                        cellDataEndPoint.innerHTML = distanceEndPoint;
                        cellDataMerged.innerHTML = distanceStartPoint + distanceEndPoint;
                        dataPointArray.push([distanceStartPoint + distanceEndPoint, cellSearchId]);
                    //}
                //}
            }
        }

        for (let i = 0; i < dataPointArray.length; i++){
            if (arrayValue[0] === null){
                arrayValue[0] = dataPointArray[i][0];
                arrayValue[1] = dataPointArray[i][1];
            }
            else if (arrayValue[0] > dataPointArray[i][0]) {
                arrayValue[0] = dataPointArray[i][0];
                arrayValue[1] = dataPointArray[i][1];
            }
        }

        if (bestPointArray.length === 0){
            bestPointArray.push([arrayValue[0], arrayValue[1]]);
        }
        else if (bestPointArray[bestPointArray.length - 1] > arrayValue){
            bestPointArray.push([arrayValue[0], arrayValue[1]]);
        }

        // Si le point d'arrive a ete percu dans la zone du point actuel
        if (GLOBALCellsBrowsed.indexOf(GLOBALCellsDeclared[1]) != -1) {
            endPointFound = true;
            functionShowPath();
        }
        else {
            GLOBALCellsCheckedNavigation++;
            functionfindPath(endPointFound, GLOBALCellsCheckedNavigation);
        }
    }

    }, 1);
}

function functionShowPath() {
    for (let i = 0; i < bestPointArray.length; i++){
        setTimeout(function(){
            document.getElementById(`cell-${bestPointArray[i][1]}`).style.backgroundColor = 'blue';
        }, 10 * i );
        setTimeout(function(){
            document.getElementById(`cell-${GLOBALCellsDeclared[1]}`).style.backgroundColor = 'yellow';
        }, 10 * bestPointArray.length );
    }
}