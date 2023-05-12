/*
 *  Gloable Variablen, die im Spiel benötigt werden
 */
let tokens = [
    [1],
    [1,2],
    [1,2,3],
    [1,2,3],
    [1,2,3],
    [1,2,3],
    [1,2,3],
    [1,2,3],
    [1,2,3],
    [1,2,3],
    [1,2,3],
    [1,2,3],
    [1,2,3],
    [1,2,3],
    [1,2,3]
];

let cardsTakenByKI = [];

let noOfTokens = 10;
let startNoOfTokens = 10;  // Kann durch Auswahl in den Optionen geändert werden und dient als Startmenge (Standard: 10)
let winsPlayer = 0;
let winsKI = 0;
let startPlayer = 'ki';


/*
 *  Wird automatisch beim Laden der Seite ausgeführt.
 */
function init() {
    render();
}


/*
 *  Rendert das Spiel mit den aktuellen Einstellungen (bzgl. verfügbarer Züge für die KI)
 */
function render() {
    // Anzahl noch verfügbaren Spielsteine und Spielstand eintragen
    document.getElementById('noOfTokens').innerHTML = noOfTokens;
    document.getElementById('winsPlayer').innerHTML = winsPlayer;
    document.getElementById('winsKI').innerHTML = winsKI;

    // Spielsteine anhand der Anzahl anzeigen
    renderTokens();

    // Anzeige der möglichen Züge für die KI
    renderPossibleMovesKI();
}


/*
 *  Rendert die Tokens, abhängig von der noch verfügbaren Anzahl
 */
function renderTokens() {
    let elem = document.getElementById('tokens');
    elem.innerHTML = '';
    for (let i = 1; i <= noOfTokens; i++) {
        let newCode = `
            <img src="img/token.png" alt="Spielstein" class="imgToken"> 
        `;
        elem.innerHTML += newCode;
    }
}


/*
 *  Rendert die Anzeige der möglichen Züge für die KI
 *  Markiert dabei die zuletzt gemachten Züge der KI
 */
function renderPossibleMovesKI() {
    document.getElementById('possibleMovesKI').innerHTML = '';
    let newCode = '';
    for (let i = 0; i < startNoOfTokens; i++) {
    //for (let i = 0; i < tokens.length; i++) {
        let bgColor = (i+1 == noOfTokens) ? ` bg-lightgreen` : ``;
        newCode += `<div id="card" class="card">
            <div class="card-header card-header-KI">
            ${i+1} <img src="img/token.png" alt="" class="height-24">
        </div>
        <div class="card-body card-body-KI${bgColor}">`;
        for (let j = 0; j < tokens[i].length; j++) {
            let newID = `card-${i}-${[j]}`;
            let newValue = +tokens[i][j];
            let newClass = (cardsTakenByKI.indexOf(newID) > -1) ? 'bg-red' : 'bg-lightred';
            newCode += `
                <span id="${newID}" class="${newClass}">${newValue}</span> `
        }
        newCode += `
            </div>
        </div>`;
    }

    document.getElementById('possibleMovesKI').innerHTML += newCode;
}


/*
 *  Zug der KI
 *  Bearbeitet die Auswirkungen dieses Zuges
 */
function makeMoveKI() {
    // Buttons ein- und ausblenden
    toggleButtons();

    // Zähle die Spielsteine: 
    // --> Anzahl ist in noOfTokens enthalten

    // Liegt auf dem Platz 'noOfTokens' noch ein Zettel, dann ziehe zufällig einen davon.
    let place = noOfTokens - 1; // da von 0 - 9 statt 1 -10
    let possibleArray = tokens[place];

    // Achtung: Bei der Startanzahl von 5 Tokens kann es vorkommen, daß die KI schon am Start nicht mehr ziehen kann. Dann ist das Spiel komplett beendet
    if (cardsTakenByKI.length == 0 && possibleArray.length == 0) {
        terminateGame();
        return;
    }

    // console.log('Place: ' + place);
    // console.log('possibleArray: ' + possibleArray);
    // console.log('possibleArray.length: ' + possibleArray.length);
    if (possibleArray.length == 0) {
        giveUp();
    } else {
        let noteToTake = Math.floor(Math.random() * possibleArray.length); // 0, 1 oder 2, entspricht 1, 2 oder 3 Token, die genommen werden
        let cardID = `card-${place}-${noteToTake}`;
        cardsTakenByKI.push(cardID);  // registrieren, welche Karte die KI gezogen hat. Das ist ggf. gleichzeitig die letzte Karte, die die KI gezogen hat.
        let noOfCardsToTake = tokens[place][noteToTake];
        
        noOfTokens -= noOfCardsToTake;
    }

    // Prüfung, ob das der letzte Stein war
    checkForLoser('ki', noOfTokens);

    render();
}


/*
 *  Zug des Spielers
 *  Bearbeitet die Auswirkungen dieses Zuges
 * 
 *  @Param {integer} noTokens - Anzahl der Tokens, die der Spieler weggenommen hat
 */
function makeMovePlayer(noTokens) {
    // Buttons ein- und ausblenden
    toggleButtons();

    // Spielsteine entfernen
    noOfTokens -= noTokens;

    // Prüfung, ob das der letzte Stein war
    checkForLoser('player', noOfTokens);

    render();
}


/*
 *  Der Computer gibt auf, der Spieler gewinnt das Spiel
 */
function giveUp() {
    checkForLoser('ki', 0);
}


/*
 *  Prüft, ob ein Spiel verloren ist (howMuch ist 0)
 *  Bearbeitet die Auswirkunen, falls das zutrifft
 * 
 *  @Param {string} who - Wer hat den Zug gemacht? 'player' oder 'ki'
 *  @Param {integer} howMuch - Wieviele Tokens sind noch übrig. 
 *                             Dies wird übergeben und nicht anhand von noOfTokens registriert, weil bei einer Aufgabe der KI die Zahl nicht 0 ist.
 */
function checkForLoser(who, howMuch) {
    if (howMuch == 0){
        if (who == 'player') {
            winsKI++;
            document.getElementById('winnerName').innerHTML = 'die KI';
        } else {
            winsPlayer++;
            document.getElementById('winnerName').innerHTML = 'der Spieler';
            removeLastCard();
        }
        document.getElementById('winner').classList.remove('disp-none');

        showBtnNewGame();
    }
}


/*
 *  Die zuletzt von der KI gezogene Karte wird aus tokens entfernt.
 *  Wird aufgerufen, wenn die KI verliert oder aufgeben muss.
 * 
 *  Format der Angabe in cardsTakenByKI --> z.B. card-2-1
 *  --> d.h. im Beispiel: cardsTakenByKI[2][1] muss entfernt werden
 */
function removeLastCard() {
    let lastCard = cardsTakenByKI.splice(-1);  // ACHTUNG: lastCard ist ein Array
    let tmpArray = lastCard[0].split("-");
    tokens[+tmpArray[1]].splice(+tmpArray[2], 1);
}


/*
 *  Startet ein neues Spiel
 *  Einige Elemente werden verborgen und einige globale Variablen zurückgesetzt
 */
function newGame() {
    document.getElementById('buttonPlayer').classList.add('disp-none');
    document.getElementById('buttonKI').classList.remove('disp-none');
    document.getElementById('buttonNextGame').classList.add('disp-none');
    document.getElementById('terminateGame').classList.add('disp-none');
    document.getElementById('winner').classList.add('disp-none');

    noOfTokens = startNoOfTokens;
    cardsTakenByKI = [];
    render();

    if (startPlayer == 'player')
        toggleButtons();
}


/*
 *  Zeigt den Button 'Nächste Runde' an, verbirgt die Buttons für Spieler und KI
 */
function showBtnNewGame() {
    document.getElementById('buttonPlayer').classList.add('disp-none');
    document.getElementById('buttonKI').classList.add('disp-none');
    document.getElementById('buttonNextGame').classList.remove('disp-none');
    document.getElementById('terminateGame').classList.add('disp-none');
}


/*
 *  Wechselt die Sichtbarkeit der Zug-Buttons von Spieler und KI
 */
function toggleButtons() {
    document.getElementById('buttonPlayer').classList.toggle('disp-none');
    document.getElementById('buttonKI').classList.toggle('disp-none');
}


/*
 *  Setzt den Startspieler und rendert das Spielfeld neu
 *
 *  @Param {string} player - Wer beginnt das Spiel? 'player' oder 'ki'
 */
function setStartPlayer(player) {
    startPlayer = player;
    newGame();
}


/*
 *  Löscht alle Spielfortschritte
 *  Einfachster Weg: Seite neu laden, aber ich möchte mal die relevanten Daten, also die globalen Variablen, von Hand zurücksetzen
 */
function resetGame() {
    // Tokens zurücksetzen
    tokens = [
        [1],
        [1,2],
        [1,2,3],
        [1,2,3],
        [1,2,3],
        [1,2,3],
        [1,2,3],
        [1,2,3],
        [1,2,3],
        [1,2,3],
        [1,2,3],
        [1,2,3],
        [1,2,3],
        [1,2,3],
        [1,2,3]
    ];

    winsPlayer = 0;      // Gewonnene Spiele des Spielers auf 0 setzen
    winsKI = 0;          // Gewonnene Spiele der KI auf 0 setzen
    startPlayer = 'ki';  // Standard ist, daß die KI beginnt

    newGame();           // Der Rest wird hier erledigt
}


/*
 *  Setzt die Anzahl der Token, die beim Start zur Verfügung stehen
 *  Wird gesetzt, wenn eine entsprechende Option aus der Navigation aufgerufen wird
 */
function setStartTokens(noToSet) {
    startNoOfTokens = noToSet;
    newGame();
}


/*
 *  Wird aufgerufen, wenn die KI gleich den ersten Zug nicht mehr machen kann. Bei Startwert '5 Token' kann das passieren.
 *  Hier ist dann nur noch ein Reset des Spiels möglich.
 */
function terminateGame() {
    document.getElementById('buttonPlayer').classList.add('disp-none');
    document.getElementById('buttonKI').classList.add('disp-none');
    document.getElementById('buttonNextGame').classList.add('disp-none');
    document.getElementById('terminateGame').classList.remove('disp-none');
}