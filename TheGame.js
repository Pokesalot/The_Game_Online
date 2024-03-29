/*
    4 piles of cards, 2 ascending, 2 descending
    Cards range 2-99, hand size is 8 by default

    - Check for card being valid to play
        - Either one or more below on descending
        or above on ascending
        -or ten above on descending
    
    piles: collection of play pile top cards
        - 0 and 1 are ascending
        - 2 and 3 are descending
*/
let selectionColor = "lime";
let maxHiscores = 10;
let hiscores = []
let difficulties = [1]
let currentDifficulty = difficulties[0]
let difshow = $("difficultyHeader")
difshow.innerText = `Current difficulty: ${currentDifficulty}`
//Create deck and shuffle it by adding cards to it randomly
let deck = GetNewDeck();
let simulationsRun=[];
//Create piles
let piles = {};
piles[0] = 1;
piles[1] = 1;
piles[2] = 100;
piles[3] = 100;
//Create hand
let maxHandSize = 8;
let minHandSize = 5;
let hand = []
let selected = 0;
let MinPlaysWithDeck = 2;
let PlayedThisTurn = 0;
let score = 0;
let lastPlay = {"Put":0,"Pile":0,"Last":0};
let undos = 0;
let cardsPlayed = 0;

PopulatePiles();
PopulateHand();
PopulateDifficulties();
PopulateBingo();
SimulateCurrentGame([0,1,-1]);
$("TimeInput").value=RandomSeed


function PopulateHand(){
    //fill the hand with cards and sort
    while(hand.length < maxHandSize && deck.length > 0 && PlayedThisTurn == 0){
        hand.push(deck.pop(0));
    }
    hand.sort(function(a, b) {
        return a - b;
    })
    //display cards in hand
    let handrow = $("HandRow");
    let handHTML = ""
    for(let i =0;i<hand.length;i++){
        if(hand[i] != selected){
            handHTML += `
                <td class="middle" onclick="SelectFromHand(${hand[i]})">${hand[i]}</td>
            `
        }else{
            handHTML += `
                <td class="middle" style="background-color: ${selectionColor};" onclick="SelectFromHand(${hand[i]})">${hand[i]}</td>
            `
        }
    }
    handrow.innerHTML = handHTML;
    //Update deck information
    let cr = $("CardsRemaining");
    cr.innerText = `Cards in deck: ${deck.length}`
}

function PopulatePiles(){
    for(let pile=0;pile<4;pile++){
        let td = $(`Pile${pile}`)
        td.innerText= piles[pile];
    }
}

function PopulateDifficulties(){
    let options = "";
    for(let i=0;i<difficulties.length;i++){
        options += `<option>Level ${i + 1}</option>`;
    }
    $("NewGameSelector").innerHTML = options;
    $("NewGameSelector").selectedIndex = currentDifficulty-1
}

function PopulateBingo(){
    let boardHTML = "<tr class=\"right\">";
    for(let i=0;i<10;i++){
        for(let j=1;j<=10;j++){
            let num = i*10 + j;
            boardHTML += `<td class=\"right\"${hand.indexOf(num) + deck.indexOf(num) == -2?" style=\"background-color: black\"":""}>${num}</td>`;
        }
        boardHTML += "</tr><tr class=\"right\">";
    }
    $("BingoBoard").innerHTML = boardHTML + "</tr>";
}


function $(id){
    return document.getElementById(id)
}

function SelectFromHand(newSelect){
    if(newSelect == selected){
        selected = 0;
    }else{
        selected = newSelect;
    }
    PopulateHand()
}

function TryPlay(pileNumber){
    if(selected==0){return;}
    let endturn = $("EndTurnButton");
    if(pileNumber < 2){ //Ascending numbers
        if(selected > piles[pileNumber] || selected == piles[pileNumber] - 10){
            lastPlay = {"Put":selected,"Pile":pileNumber,"Last":piles[pileNumber]};
            if(selected == piles[pileNumber] - 10){score+=5}
            piles[pileNumber] = selected
            hand = hand.filter(card => card != selected)
            score += [1,1,2,4,6,8,10,12][PlayedThisTurn]
            PlayedThisTurn++; cardsPlayed++;
            $("UndoButton").hidden = false;
            $("RestartGameButton").hidden = false;
        }else{
            alert("do you are have stupid");
        }
    }else{ //Descending numbers
        if(selected < piles[pileNumber] || selected == piles[pileNumber] + 10){
            lastPlay = {"Put":selected,"Pile":pileNumber,"Last":piles[pileNumber]};
            if(selected == piles[pileNumber] + 10){score+=5}
            piles[pileNumber] = selected
            hand = hand.filter(card => card != selected)
            score += [1,1,2,4,6,8,10,12][PlayedThisTurn]
            PlayedThisTurn++; cardsPlayed++;
            $("UndoButton").hidden = false;
        }else{
            alert("do you are have stupid");
        }
    }

    endturn.hidden = true;
    if(hand.length == 0 && deck.length == 0){
        if(currentDifficulty == difficulties.length){
            difficulties.push(difficulties.length + 1);
            alert("You won! You have also unlocked a harder difficulty to try your skills!");
            PopulateDifficulties();
        }else{
            alert("You won! Try a harder one next time :^)");
        }

    }else if((hand.length == 0 || PlayedThisTurn >= MinPlaysWithDeck) && deck.length > 0){
        endturn.hidden = false;
    }
    
    let plh = $("playsLeftHeader");
    if(deck.length>0){
        plh.innerText = `Cards to play: ${Math.max(MinPlaysWithDeck-PlayedThisTurn,0)}`
    }else{
        plh.innerText = `Cards to play: ${hand.length}`
    }
    $("ScoreBar").innerText = `Score: ${score}`

    selected = 0
    PopulatePiles();
    PopulateHand();
    PopulateBingo();
    CheckForDeadBoard();
}


function NewGame(newRatios = [0,1,-1]){
    if(score>0){
        hiscores.push(`${score},${cardsPlayed},${undos},${currentDifficulty},${RandomSeed},${CurrentGame}`);
        hiscores.sort(function(a, b) {return b.split(',')[0] - a.split(',')[0];}).splice(maxHiscores,100);//Make sure we have exactly the top ten hiscores
        $("hiscores").innerHTML = ""
        for(let i=0;i<hiscores.length;i++){
            $("hiscores").innerHTML += `<li>Score:${hiscores[i].split(',')[0]}, Cards: ${hiscores[i].split(',')[1]}, Undos: ${hiscores[i].split(',')[2]}, Level: ${hiscores[i].split(',')[3]}, Time: ${hiscores[i].split(',')[4]}, Seed: ${hiscores[i].split(',')[5]}</li>`
        }
    }
    
    $("SeedInput").value=CurrentGame
    currentDifficulty = difficulties[$("NewGameSelector").selectedIndex];
    $("difficultyHeader").innerText = `Current difficulty: ${currentDifficulty}`


    //Create deck and shuffle it by adding cards to it randomly
    piles[0] = 1;
    piles[1] = 1;
    piles[2] = 100;
    piles[3] = 100;
    //Create hand
    maxHandSize = 8;
    hand = [];
    MinPlaysWithDeck = 2;
    
    
    let drh = $("difficultyRollsHeader");
    let changes = "|";
    difficultyChanges = currentDifficulty - 1
    while(difficultyChanges > 0){
        changeRoll = randNorm(500+difficultyChanges+CurrentGame)
        if(      changeRoll < 0.2){
            piles[0] += Math.ceil(randNorm(600+difficultyChanges+CurrentGame) * 5);
        }else if(changeRoll < 0.4){
            piles[1] += Math.ceil(randNorm(600+difficultyChanges+CurrentGame) * 5);
        }else if(changeRoll < 0.6){
            piles[2] -= Math.ceil(randNorm(600+difficultyChanges+CurrentGame) * 5);
        }else if(changeRoll < 0.8){
            piles[3] -= Math.ceil(randNorm(600+difficultyChanges+CurrentGame) * 5);
        }else if(changeRoll < 0.85){
            if(maxHandSize == minHandSize){continue}
            maxHandSize--;
        }else if(changeRoll < 0.9){
            if(hand.length == 0){
                hand = [52]
            }else{
                hand.push(hand[hand.length-1] - 1)
            }
        }else{
            MinPlaysWithDeck++;
        }
        difficultyChanges--;
        changes += `${parseFloat(changeRoll).toFixed(2)}|`
        drh.innerText = `Changes this game: ${changes}`
    }

    
    deck = GetNewDeck()
    simulationsRun=[];
    selected = 0;
    PlayedThisTurn = 0;
    lastPlay = {"Put":0,"Pile":0,"Last":0};
    undos = 0;
    score = 0;
    cardsPlayed = 0;
    $("playsLeftHeader").innerText = `Cards to play: ${MinPlaysWithDeck}`
    $("EndTurnButton").hidden = true;
    $("NoMoves").hidden=true;
    $("ScoreBar").innerText = "Score: 0";

    PopulatePiles();
    PopulateHand();
    PopulateBingo();
    SimulateCurrentGame(newRatios);
}

function RestartGame(){
    NewGame();
    $("RestartGameButton").hidden = true;
    $("UndoButton").hidden = true;
}

function EndTurn(){
    if($("EndTurnButton").hidden){return}
    PlayedThisTurn = 0;
    PopulateHand();
    $("EndTurnButton").hidden = true;
    let plh = $("playsLeftHeader");
    if(deck.length>0){
        plh.innerText = `Cards to play: ${Math.max(MinPlaysWithDeck-PlayedThisTurn,0)}`
    }else{
        plh.innerText = `Cards to play: ${hand.length}`
    }
    $("UndoButton").hidden = true;
    CheckForDeadBoard();
}

function CheckForDeadBoard(){
    if(hand.length >= 1){
        for(let i=0;i<hand.length;i++){//We don't check for valid moves in the form of moving the wrong way by ten below, but those are valid moves
            if(hand[i] == piles[0]-10 || hand[i] == piles[1]-10 || hand[i] == piles[2]+10 ||hand[i] == piles[3]+10){return;}
        }
        if(hand[0] > piles[2] && hand[0] > piles[3] && hand[hand.length-1]<piles[0] && hand[hand.length-1]<piles[1] && $("EndTurnButton").hidden){//No possible moves and we can't end turn
            let charlie = $("NoMoves");
            charlie.hidden=false;
            setTimeout(() => {  alert("Your game has no more moves, let's start a new one!");NewGame() }, 500);
            CurrentGame++;
        }
    }
}

function UndoMove(){
    if($("UndoButton").hidden){return}
    if((lastPlay.Pile < 2 && lastPlay.Last - lastPlay.Put == 10) || (lastPlay.Pile >1 && lastPlay.Last - lastPlay.Put == -10)){
        score -= 5;
    }
    score -= [0,1,1,2,4,6,8,10,12][PlayedThisTurn]
    PlayedThisTurn--; cardsPlayed--;
    let plh = $("playsLeftHeader");
    if(deck.length>0){
        plh.innerText = `Cards to play: ${Math.max(MinPlaysWithDeck-PlayedThisTurn,0)}`
    }else{
        plh.innerText = `Cards to play: ${hand.length}`
    }
    alert(`Oopsy woopsy. Wooks wike someone had a wittle fucko boingo. A wittle fucky wucky. Twy to do bettew maybe? >.<`)
    hand.push(lastPlay["Put"]);
    hand.sort(function(a, b) {
        return a - b;
    })
    piles[lastPlay["Pile"]] = lastPlay["Last"]
    PopulateHand();
    PopulatePiles();
    $("UndoButton").hidden = true;
    $("ScoreBar").innerText = `Score: ${score}`
    let endturn = $("EndTurnButton")
    endturn.hidden = true;
    if(hand.length == 0 && deck.length == 0){
        if(currentDifficulty == difficulties.length){
            difficulties.push(difficulties.length + 1);
            alert("You won! You have also unlocked a harder difficulty to try your skills!");
            PopulateDifficulties();
        }else{
            alert("You won! Try a harder one next time :^)");
        }

    }else if((hand.length == 0 || PlayedThisTurn >= MinPlaysWithDeck) && deck.length > 0){
        endturn.hidden = false;
    }
}


function testHardMode(){
    for(let dif=0;dif<50;dif++){
        difficulties.push(difficulties.length + 1);
    }
    PopulateDifficulties();
}