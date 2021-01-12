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
let deck = [2];//Skip adding 2 'randomly' since it will be the only card
for(let i = 3; i <= 99; i++){
    deck.splice(Math.floor(Math.random() * (deck.length + 1)),0,i);
}
let masterDeck = [];for(let i=0;i<deck.length;i++){masterDeck.push(deck[i])}; let simulationsRun=[];
let deckID = Math.random().toString().split(".")[1];
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
    hiscores.push(`${score},${cardsPlayed},${undos},${currentDifficulty}`);
    hiscores.sort(function(a, b) {return b.split(',')[0] - a.split(',')[0];}).splice(maxHiscores,100);//Make sure we have exactly the top ten hiscores
    $("hiscores").innerHTML = ""
    for(let i=0;i<hiscores.length;i++){
        $("hiscores").innerHTML += `<li>Score:${hiscores[i].split(',')[0]}, Cards: ${hiscores[i].split(',')[1]}, Undos: ${hiscores[i].split(',')[2]}, Level: ${hiscores[i].split(',')[3]}</li>`
    }
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
        changeRoll = Math.random()
        if(      changeRoll < 0.2){
            piles[0] += Math.ceil(Math.random() * 5);
        }else if(changeRoll < 0.4){
            piles[1] += Math.ceil(Math.random() * 5);
        }else if(changeRoll < 0.6){
            piles[2] -= Math.ceil(Math.random() * 5);
        }else if(changeRoll < 0.8){
            piles[3] -= Math.ceil(Math.random() * 5);
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

    deck = [2];//Skip adding 2 'randomly' since it will be the only card
    for(let i = 3; i <= 99; i++){
        if(hand.indexOf(i) > -1){continue;}
        deck.splice(Math.floor(Math.random() * deck.length + 1),0,i);
    }
    masterDeck = [];for(let i=0;i<deck.length;i++){masterDeck.push(deck[i])}; simulationsRun=[];
    deckID = Math.random().toString().split(".")[1];
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
        }
    }
}

function UndoMove(){
    if($("UndoButton").hidden){return}
    score -= [1,1,2,4,6,8,10,12][PlayedThisTurn]
    PlayedThisTurn--; cardsPlayed--;
    alert(`Oopsy woopsy. Wooks wike someone had a wittle fucko boingo. A wittle fucky wucky. Twy to do bettew maybe? >.< \nRemoved ${undos} point${undos!=1?"s":""}`)
    hand.push(lastPlay["Put"]);
    hand.sort(function(a, b) {
        return a - b;
    })
    piles[lastPlay["Pile"]] = lastPlay["Last"]
    PopulateHand();
    PopulatePiles();
    $("UndoButton").hidden = true;
    $("ScoreBar").innerText = `Score: ${score}`
}

function SimulateCurrentGame(ratios=[-1]){
    for(let gameRatio=0;gameRatio<ratios.length;gameRatio++){
        let ratio = ratios[gameRatio] == -1? Math.random() : ratios[gameRatio]
        console.log(`Simulating game with ratio of ${ratio}`);
        let curDeckID = deckID; let DeadGame=false;
        let simDeck=[];for(let i=0;i<masterDeck.length;i++){simDeck.push(masterDeck[i])};
        let simPiles = [];
        let simHand = [];
        let simScore = 0;let simCardsPlayed=0;
        simPiles[0] = 1;simPiles[1]=1;simPiles[2]=100;simPiles[3]=100;

        //TODO on stream, figure out how to play the game
        while((simDeck.length > 0 || simHand.length > 0) && !DeadGame){
            while(simHand.length<maxHandSize && simDeck.length > 0){simHand.push(simDeck.pop())} //fill hand
            
            let playsThisTurn=0;let costs = [];
            for(let card=0;card<simHand.length;card++){
                costs.push(GetCardCost(simPiles,simHand,simDeck,card));
            }
            costs.sort(function(a,b){return a.cost-b.cost});
            
            while((playsThisTurn<MinPlaysWithDeck || (costs[0].cost * (1-ratio)) < [1,1,2,4,6,8,10,12][playsThisTurn] * ratio) && costs[0].cost < 500){
                simPiles[costs[0].pile] = simHand[costs[0].card]
                simHand.splice(costs[0].card,1);

                costs=[];
                for(let card=0;card<simHand.length;card++){
                    costs.push(GetCardCost(simPiles,simHand,simDeck,card));
                }
                costs.sort(function(a,b){return a.cost-b.cost});
                simCardsPlayed++;simScore += [1,1,2,4,6,8,10,12][playsThisTurn];playsThisTurn++; 
                if(simHand.length == 0){break;}
                if(costs[0] > 500){DeadGame = true;break;}
            }
            if(costs.length>0){if(costs[0].cost > 500){DeadGame = true;break}}
        }//Play cards on the deck while we have cards to play
        
        if(curDeckID == deckID){
            simulationsRun.push({"ratio":ratio,"score":simScore,"cards":simCardsPlayed});
            simulationsRun.sort(function(a,b){
                return b.cardsPlayed - a.cardsPlayed
            })
            let summaryText = `Highest cards played: ${simulationsRun[0]["cards"]}, score of ${simulationsRun[0]["score"]}, ratio of ${simulationsRun[0]["ratio"]}<br>`;
            simulationsRun.sort(function(a,b){return b.score-a.score});
            summaryText += `Highest scoring game: ${simulationsRun[0]["score"]}, played ${simulationsRun[0]["cards"]} cards, ratio of ${simulationsRun[0]["ratio"]}
            <br>Games played: ${simulationsRun.length}
            <br>Ratios used: 0`;
            simulationsRun.sort(function(a,b){return a.ratio-b.ratio});
            let fix = 4;
            if(simulationsRun.length >= 200){fix--}
            if(simulationsRun.length >= 350){fix--}
            if(simulationsRun.length >= 450){fix--}
            for(let sim=1;sim<simulationsRun.length -1;sim++){
                if( parseFloat(simulationsRun[sim].ratio).toFixed(fix) == parseFloat(simulationsRun[sim-1].ratio).toFixed(fix)){continue}//Remove duplicates
                summaryText += `, ${parseFloat(simulationsRun[sim].ratio).toFixed(fix)}`;
            }
            $("SimulationResults").innerHTML = summaryText + ", 1";
        }//else a change to the deck was made while we were simulating
    }
}

function GetCardCost(piles,hand,deck,card){
    let leastBad = {"cost":1000,"pile":0,"card":card};
    for(let pile=0;pile<4;pile++){
        if((hand[card]>piles[pile]&&hand[card]!=piles[pile]+10&&pile>1) || (hand[card]<piles[pile]&&hand[card]!=piles[pile]-10&&pile<2)){continue;}
        //Any card that gets here can be played on this pile
        let costSavings = 0; 
        for(let check=Math.min(hand[card],piles[pile])+1;check<Math.max(hand[card],piles[pile]);check++){
            if(hand.indexOf(check)==-1&&deck.indexOf(check)==-1){
                costSavings++
            }
        }
        if(hand.indexOf(hand[card] + 10)>-1 || hand.indexOf(hand[card]-10)>-1){
            //If this card is part of a ten-off pair, cost will go up to play in the wrong direction
            //and cost will go down to play in the better direction
            if((hand.indexOf(hand[card] + 10)>-1 && pile > 1) || (hand.indexOf(hand[card] - 10)>-1 && pile < 2)){//it's the proper first play
                Math.abs(hand[card]-piles[pile])-10-costSavings < leastBad.cost? leastBad = {"cost":Math.abs(hand[card]-piles[pile])-10-costSavings,"pile":pile,"card":card} : leastBad=leastBad;
            }else{//it's the higher card
                leastBad = {"cost":Math.abs(hand[card]-piles[pile])+10-costSavings,"pile":pile,"card":card}
            }
        }else{
            if((pile<2 && hand[card] + 10 == piles[pile]) || (pile>1 && hand[card] -10 == piles[pile])){//wrong way cards
                leastBad = {"cost":-10-costSavings,"pile":pile,"card":card};
            }else{//normal card costs
                if(Math.abs(hand[card]-piles[pile])-costSavings < leastBad.cost){
                    leastBad = {"cost":Math.abs(hand[card]-piles[pile])-costSavings,"pile":pile,"card":card};
                }
            }
            
        }
    }
    return leastBad;
}