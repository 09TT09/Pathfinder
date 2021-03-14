let cheminAuto = true;
let varChemin;
let breakRules = false;
let animationDelayConfig = 8;
let notSetTimeOut = false;
let notSetTimeOutValue = 0;
let endDelay = 1;

document.getElementById('params').addEventListener('click', function(e) {
    document.getElementById('divparams').style.display = "block";
});

document.getElementById('exitparams').addEventListener('click', function(e) {
    document.getElementById('divparams').style.display = "none";
});

document.getElementById('hauteur').addEventListener('focusout', function(e) {
    if (this.value < 2) this.value = 2;
    document.getElementById('largeur').innerHTML = this.value;
    document.getElementById('surface').innerHTML = this.value * this.value;
});

document.getElementById('hauteur').addEventListener('keyup', function(e) {
    document.getElementById('largeur').innerHTML = this.value;
    document.getElementById('surface').innerHTML = this.value * this.value;
});

document.getElementById('cheminAutomatique').addEventListener('change', function(e) {
    let cheminText;
    cheminAuto = !cheminAuto;
    if (cheminAuto === true) {
        cheminText = 'activé';
        document.getElementById('findPathbutton').style.display = "none";
    }
    else {
        cheminText = 'désactivé';
        document.getElementById('findPathbutton').style.display = "inline-block";
    }
    console.log(`chemin automatique : %c${cheminText}`, 'color: orange');
});

document.getElementById('logClear').addEventListener('click', function(e) {
    console.clear();
});

document.getElementById('msConfig').addEventListener('change', function(e) {
    animationDelayConfig = this.value;
});

document.getElementById('activeAnim').addEventListener('change', function(e) {
    notSetTimeOut = !notSetTimeOut;
    if (this.checked) {
        document.getElementById('tempsAnimCells').style.display = 'block';
        notSetTimeOutValue = 1;
    }
    else {
        document.getElementById('tempsAnimCells').style.display = 'none';
        notSetTimeOutValue = 0;
    }
});

document.getElementById('createTable').addEventListener('click', function(e) {
    document.getElementById("divContent").innerHTML = "";
    document.getElementById("tableauCreated").innerHTML = "";
    tableConstruct();
});






function tableConstruct(){ // création du tableau
    let allCoordsCells = []
    let coordX = 1;
    let coordY = 1;
    let paramsSurface = document.getElementById('hauteur').value;
    let tableSurfaceVal = parseInt(document.getElementById('tableSurface').value);

    document.getElementById("tableauCreated").insertAdjacentHTML('beforeend',
        '<button class="button" id="pointDeDepart">Point de départ</button> \
        <button class="button" id="pointArrive">Point d\'arrivé</button> \
        <button class="button" id="findPathbutton">Simuler chemin</button>'
    );
    if (tableSurfaceVal > paramsSurface) tableSurfaceVal = parseInt(paramsSurface);
    document.getElementById("divContent").insertAdjacentHTML('beforeend', '<table id="table" cellspacing="0"><tbody id="tableBody"></tbody></table>');
    for (let tableColumn = 1; tableColumn <= tableSurfaceVal; tableColumn++){
        document.getElementById("tableBody").insertAdjacentHTML('beforeend', `<tr id="ligne${coordX}"></tr>`);
        for (let tableLineCell = 1; tableLineCell <= tableSurfaceVal; tableLineCell++){
            document.getElementById(`ligne${coordX}`).insertAdjacentHTML('beforeend', `<td id="${coordX},${coordY}"></td>`);
            allCoordsCells.push(`${coordX},${coordY}`);
            coordY++;
        }
        coordY = 1;
        coordX++;
    }
    console.log(allCoordsCells); // console.log
    addListeners(allCoordsCells, tableSurfaceVal);
}






function addListeners(allCoordsCells, tableSurfaceVal){ // ajout des boutons + événements
    let buttonActiveDepart = false;
    let buttonActiveArrive = false;
    let pointDeDepartValue;
    let pointArriveValue;
    let buttonsValues = [
        ['pointDeDepart', buttonActiveDepart, pointDeDepartValue, 'point_de_depart', 'crimson', 'color_1'],
        ['pointArrive', buttonActiveArrive, pointArriveValue, 'point_d_arrive', 'lime', 'color_2']
    ]

    for (let buttonNumber = 0; buttonNumber <= 1; buttonNumber++){
        document.getElementById(buttonsValues[buttonNumber][0]).addEventListener('click', function() {
            buttonsValues[buttonNumber][1] === true ? buttonsValues[buttonNumber][1] = false : buttonsValues[buttonNumber][1] = true;
            if ((buttonsValues[0][1] && buttonsValues[1][1]) === true) {
                buttonsValues[0][1] = false; buttonsValues[1][1] = false;
                buttonsValues[buttonNumber][1] === true ? buttonsValues[buttonNumber][1] = false : buttonsValues[buttonNumber][1] = true;
                if (document.getElementsByClassName('color_1')[0]) document.getElementsByClassName('color_1')[0].classList.remove('color_1');
                if (document.getElementsByClassName('color_2')[0]) document.getElementsByClassName('color_2')[0].classList.remove('color_2');
            }
            pointDepart(buttonsValues[buttonNumber][1]);
            console.log(`%cpoint de départ:%c ${buttonsValues[0][1]}\n%cpoint d'arrivé:%c ${buttonsValues[1][1]}`, 'color: crimson', 'color: white', 'color: lime', 'color: white');
        });

        allCoordsCells.forEach(function(idButton) {
            buttonsValues[buttonNumber][2] = undefined;
            document.getElementById(idButton).addEventListener('click', function() {
                //if (notSetTimeOut === false ) clearTimeout(varChemin);
                if (cheminAuto === false) {
                    for (let i = 0; i < document.getElementsByTagName("td").length; i++) {
                        if (document.getElementsByTagName("td")[i].classList.contains('color_3')) document.getElementsByTagName("td")[i].classList.remove("color_3");
                        if (document.getElementsByTagName("td")[i].classList.contains('color_4')) document.getElementsByTagName("td")[i].classList.remove("color_4");
                    }
                }
                if (buttonsValues[buttonNumber][1] === true){
                    if (document.getElementsByClassName(buttonsValues[buttonNumber][3])[0] != undefined){
                        document.getElementsByClassName(buttonsValues[buttonNumber][3])[0].classList.remove(buttonsValues[buttonNumber][3]);
                    }
                    buttonsValues[buttonNumber][2] = this.id;
                    console.log(`%c◼ %c${buttonsValues[buttonNumber][2]}`, `color: ${buttonsValues[buttonNumber][4]}`, 'color: white'); // console.log
                    this.classList.add(buttonsValues[buttonNumber][3]);
                    // experiment !---
                    if (cheminAuto === true) {
                        if ((buttonsValues[0][2] && buttonsValues[1][2]) != undefined){
                            findPath(buttonsValues, tableSurfaceVal, allCoordsCells);
                        }
                    }
                    // experiment ---!
                }
            });
        });

        function pointDepart(getIdPointDeDepart){
            getIdPointDeDepart = document.getElementById(buttonsValues[buttonNumber][0]);
            buttonsValues[buttonNumber][1] === true ? getIdPointDeDepart.classList.add(buttonsValues[buttonNumber][5]) : getIdPointDeDepart.classList.remove(buttonsValues[buttonNumber][5]);
        }
    }

    document.getElementById("findPathbutton").addEventListener('click', function() {
        console.log(`%c${buttonsValues[0][2]}%c - %c${buttonsValues[1][2]}`, 'color: crimson', 'color: white', 'color: lime');
        if ((buttonsValues[0][2] && buttonsValues[1][2]) != undefined){
            findPath(buttonsValues, tableSurfaceVal, allCoordsCells);
        }
    });
}






function findPath(buttonsValues, tableSurfaceVal, allCoordsCells){ // cherche le chemin du point de départ à l'arrivé
    let arriveFound = false;
    let compteurTableau = 0;
    let operateurTableau = [+1, -1];
    let parcoursPoint = [buttonsValues[0][2]];

    // experiment !---
    if (cheminAuto === true) {
        for (let i = 0; i < document.getElementsByTagName("td").length; i++) {
            if (document.getElementsByTagName("td")[i].classList.contains('color_3')) document.getElementsByTagName("td")[i].classList.remove("color_3");
            if (document.getElementsByTagName("td")[i].classList.contains('color_4')) document.getElementsByTagName("td")[i].classList.remove("color_4");
        }
    }
    // experiment ---!
    loop:
    for (let parcoursTableau = 0; parcoursTableau < parcoursPoint.length; parcoursTableau++){ // tant que tableau "parcoursPoint" est inférieur à sa longueur - "cT" (attention peut mener à une boucle infini)
        let CoordsStartPoint = parcoursPoint[compteurTableau].split(",");
        let CoordsStartPointIntegers = CoordsStartPoint.map(coords => parseInt(coords));
        for (let researchPoints = 0; researchPoints <= 3; researchPoints++){ // tant que le tour d'une cellule n'est pas complet faire...
            if (researchPoints <= 1){ // cellule en bas puis en haut
                if ((CoordsStartPointIntegers[0] + operateurTableau[researchPoints]) > 0 && (CoordsStartPointIntegers[0] + operateurTableau[researchPoints]) < (tableSurfaceVal + 1)){
                    let xValue = CoordsStartPointIntegers[0] + operateurTableau[researchPoints];
                    let yValue = CoordsStartPointIntegers[1];
                    if (parcoursPoint.indexOf(`${xValue},${yValue}`) === -1){
                        //document.getElementById(`${xValue},${yValue}`).classList.add("color_3");
                        parcoursPoint.push(`${xValue},${yValue}`);
                    }
                }
            } else { // cellule à droite puis à gauche
                if ((CoordsStartPointIntegers[1] + operateurTableau[researchPoints - 2]) > 0 && (CoordsStartPointIntegers[1] + operateurTableau[researchPoints - 2]) < (tableSurfaceVal + 1)){
                    let xValue = CoordsStartPointIntegers[0];
                    let yValue = CoordsStartPointIntegers[1] + operateurTableau[researchPoints - 2];
                    if (parcoursPoint.indexOf(`${xValue},${yValue}`) === -1){
                        //document.getElementById(`${xValue},${yValue}`).classList.add("color_3");
                        parcoursPoint.push(`${xValue},${yValue}`);
                    }
                }
            }
            if (researchPoints === 3) { // tour complet d'une cellule ?
                compteurTableau++;
            }
        }
        for (let searchArrive = 0; searchArrive < parcoursPoint.length; searchArrive++){
            if (parcoursPoint[searchArrive] === buttonsValues[1][2]) arriveFound = true;
        }
        if (arriveFound === true) {
            stopThat(parcoursPoint, buttonsValues, allCoordsCells);
            break loop;
        }
    }
}






function stopThat(parcoursPoint, buttonsValues, allCoordsCells){
    let cellsColor;

    allCoordsCells.forEach(function(idButton) {
        document.getElementById(idButton).addEventListener('click', function() {
            //if ((buttonsValues[0][1] || buttonsValues[1][1]) === true) endDelay = 0;
        });
    });

    for (cellsColor = 0; cellsColor < parcoursPoint.length; cellsColor++){
        let CoordsStartPoint = parcoursPoint[cellsColor].split(",");
        let CoordsStartPointIntegers = CoordsStartPoint.map(coords => parseInt(coords));
        let xValue = CoordsStartPointIntegers[0];
        let yValue = CoordsStartPointIntegers[1];
        if (notSetTimeOut === true ) document.getElementById(`${xValue},${yValue}`).classList.add("color_3");
        animationCellules(parcoursPoint, buttonsValues, cellsColor, xValue, yValue, endDelay);
    }

}






function animationCellules(parcoursPoint, buttonsValues, cellsColor, xValue, yValue, endDelay) {

    if (notSetTimeOut === false ) {
        setTimeout(function() {
            document.getElementById(`${xValue},${yValue}`).classList.add("color_3");
        }, cellsColor * animationDelayConfig * endDelay);
    }

    if (parcoursPoint.length - 1 === cellsColor){
        traceTheWay(parcoursPoint, buttonsValues);
    }

}






function traceTheWay(parcoursPoint, buttonsValues) {

    let traceChemin = buttonsValues[0][2];
    let traceCheminSplit = traceChemin.split(",");
    let traceCheminSplitInteger = traceCheminSplit.map(pointChemin => parseInt(pointChemin));
    let a = buttonsValues[1][2];
    let aSplit = a.split(",");
    let aSplitInteger = aSplit.map(aChemin => parseInt(aChemin));

    varChemin = setTimeout(function() {
        while (traceCheminSplitInteger[0] != aSplitInteger[0]){
            if (traceCheminSplitInteger[0] < aSplitInteger[0]){ traceCheminSplitInteger[0]++ }
            else { traceCheminSplitInteger[0]-- }
            document.getElementById(`${traceCheminSplitInteger[0]},${traceCheminSplitInteger[1]}`).classList.add("color_4");
        }
        while (traceCheminSplitInteger[1] != aSplitInteger[1]){
            if (traceCheminSplitInteger[1] < aSplitInteger[1]){ traceCheminSplitInteger[1]++ }
            else { traceCheminSplitInteger[1]-- }
            document.getElementById(`${traceCheminSplitInteger[0]},${traceCheminSplitInteger[1]}`).classList.add("color_4");
        }

        console.log(parcoursPoint);
        console.log(`%c--- Point d\'arrivé trouvé ---`, 'color: orange');

    }, parcoursPoint.length * animationDelayConfig * notSetTimeOutValue);
}