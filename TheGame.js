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
let difficulties = [1]
let currentDifficulty = difficulties[0]
    let difshow = $("difficultyHeader")
    difshow.innerText = `This game's difficulty: ${currentDifficulty}`
//Create deck and shuffle it by adding cards to it randomly
let deck = [2];//Skip adding 2 'randomly' since it will be the only card
for(let i = 3; i <= 99; i++){
    deck.splice(Math.floor(Math.random() * deck.length + 1),0,i);
}
//Create piles
let piles = {};
piles[0] = 1;
piles[1] = 1;
piles[2] = 100;
piles[3] = 100;
//Create hand
let maxHandSize = 8;
let hand = []
let selected = null;
let MinPlaysWithDeck = 2;
let MinPlaysWithoutDeck = 1;
let PlayedThisTurn = 0;

PopulatePiles()
PopulateHand()
PopulateDifficulties()


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
                <td onclick="SelectFromHand(${hand[i]})">${hand[i]}</td>
            `
        }else{
            handHTML += `
                <td style="background-color: darkblue;" onclick="SelectFromHand(${hand[i]})">${hand[i]}</td>
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
    if(pileNumber < 2){ //Ascending numbers
        if(selected > piles[pileNumber] || selected == piles[pileNumber] - 10){
            piles[pileNumber] = selected
            hand = hand.filter(card => card != selected)
            PlayedThisTurn++;
        }
    }else{ //Descending numbers
        if(selected < piles[pileNumber] || selected == piles[pileNumber] + 10){
            piles[pileNumber] = selected
            hand = hand.filter(card => card != selected)
            PlayedThisTurn++;
        }
    }

    if((PlayedThisTurn >= MinPlaysWithDeck || (deck.length == 0 && PlayedThisTurn >= MinPlaysWithoutDeck)) && deck.length > 0){
        let endturn = $("EndTurnButton");
        endturn.hidden = false;
    }
    if(hand.length == 0 && deck.length == 0){
        if(currentDifficulty == Math.max(difficulties)){
            difficulties += difficulties.length + 1;
            alert("You won! You have also unlocked a harder difficulty to try your skills!");
        }else{
            alert("You won! Try a harder one next time :^)");
        }

    }
    

    selected = 0
    PopulatePiles();
    PopulateHand();
}

function NewGame(){
    let difsel = $("NewGameSelector");
    currentDifficulty = difficulties[difsel.selectedIndex];
    let difshow = $("difficultyHeader")
    difshow.innerText = `This game's difficulty: ${currentDifficulty}`
    //Create deck and shuffle it by adding cards to it randomly
    
    piles[0] = 1;
    piles[1] = 1;
    piles[2] = 100;
    piles[3] = 100;
    //Create hand
    maxHandSize = 8;
    hand = [];
    MinPlaysWithDeck = 2;
    MinPlaysWithoutDeck = 1;
    
    difficultyChanges = currentDifficulty - 1
    while(difficultyChanges > 0){
        changeRoll = Math.random()
        if(      changeRoll < 0.2){
            piles[0] += Math.floor(Math.random() * 5);
        }else if(changeRoll < 0.4){
            piles[1] += Math.floor(Math.random() * 5);
        }else if(changeRoll < 0.6){
            piles[2] -= Math.floor(Math.random() * 5);
        }else if(changeRoll < 0.8){
            piles[3] -= Math.floor(Math.random() * 5);
        }else if(changeRoll < 0.85){
            
        }else{
            MinPlaysWithDeck++;
            MinPlaysWithoutDeck++;
        }
        difficultyChanges--;
    }

    deck = [2];//Skip adding 2 'randomly' since it will be the only card
    for(let i = 3; i <= 99; i++){
        deck.splice(Math.floor(Math.random() * deck.length + 1),0,i);
    }

    selected = null;
    PlayedThisTurn = 0;
    let endturn = $("EndTurnButton");
    endturn.hidden = true;

    PopulatePiles()
    PopulateHand()
}

function EndTurn(){
    PlayedThisTurn = 0;
    PopulateHand();
    let endturn = $("EndTurnButton");
    endturn.hidden = true;
}

function PopulateDifficulties(){
    let difsel = $("NewGameSelector");
    let options = "";
    for(let i=0;i<difficulties.length;i++){
        options += `<option>Level ${i + 1}</option>`;
    }
    difsel.innerHTML = options;
}