let RandomState = Math.floor(Math.random() * 100000) + 1//Guarantees that our state is at least 1

function randNorm(pocketNumber = 100000){
    if(RandomState == 0){
        alert("Something went wrong, and the random has been turned off. Fixing now!")
        RandomState = Math.floor(Math.random() * pocketNumber)
    }
    RandomState ^= RandomState >> 12; // a
	RandomState ^= RandomState << 25; // b
    RandomState ^= RandomState >> 27; // c
    return (RandomState % pocketNumber) / pocketNumber
}

function randRange(start=0,width=100){
    //Returns an int from [start,end)
    norm = randNorm()
    return Math.floor(norm * width) + start
}

function Seed2Code(width = 40){
    let startstring = `${RandomState},`
    let AddedLetters = 0;
    while(btoa(startstring + "i_littleluna_i on twitch.tv!".substring(0,AddedLetters)).length < width){
        AddedLetters++;
    }
    return btoa(startstring + "i_littleluna_i on twitch.tv!".substring(0,AddedLetters+2))
}

function Code2Seed(code){
    try {
        let instr = atob(code)
        return (parseInt(instr.split(",")[0]))
    } catch (error) {
        alert("Invalid seed code given! Setting seed to a random number")
        RandomState = randRange(10000,249000)
    }
    
}

function GetNewDeck(hand=[]){
    let deck = [2];//Skip adding 2 'randomly' since it will be the only card
    for(let i = 3; i <= 99; i++){
        if(hand.indexOf(i) > -1){continue;}
        deck.splice(Math.floor(randNorm() * (deck.length + 1)),0,i);
    }
    return deck
}

function SimulateCurrentGame(ratios=[-1]){
    for(let gameRatio=0;gameRatio<ratios.length;gameRatio++){
        let ratio = ratios[gameRatio] == -1? Math.random() : ratios[gameRatio]
        let DeadGame=false;
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