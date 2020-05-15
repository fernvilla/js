//
// Single card REPL blackjack game
//

//Node prompt for user input
const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const askQuestion = q => new Promise(res => rl.question(q, answer => res(answer)));

const winMessage = 'You won the game.';
const lossMessage = 'You lost the game.';
const tieMessage = 'The game is a Tie.';
const faceCards = ['J', 'Q', 'K'];
const cardTypes = [2, 3, 4, 5, 6, 7, 8, 9, 10, ...faceCards, 'A'];

let gameHasStarted, isDealerTurn, dealerCards, playerCards, availableCards, cardDeck;

//Initial game state
const setUpTable = () => {
  gameHasStarted = true;
  isDealerTurn = false;
  dealerCards = [];
  playerCards = [];
  availableCards = [];
  cardDeck = createDeck();
};

// Create 4 of each type of card
const createDeck = () => cardTypes.reduce((acc, curr) => [...acc, ...Array(4).fill(curr)], []);

const initiateGame = () => {
  console.clear();
  console.log('A Game of BlackJack \n===================');
  promptUserForAction();
};

const getAvailableCommands = () => (gameHasStarted ? ['deal', 'hit', 'stand', 'quit'] : ['deal', 'quit']);

const userInputQuestion = async (customQuestion = null) => {
  const availableCommands = getAvailableCommands().join(', ');
  const questionText = customQuestion || `What would you like to do: ${availableCommands}? \n`;

  return await askQuestion(`${questionText}: `);
};

const promptUserForAction = async (customQuestion = null) => {
  const input = await userInputQuestion(customQuestion);
  const availableCommands = getAvailableCommands();

  if (!availableCommands.includes(input.toLowerCase())) {
    console.log('Wrong Command. Try again');
    return promptUserForAction(' ');
  }

  switch (input.toLowerCase()) {
    case 'deal':
      startGame();
      break;
    case 'hit':
      dealPlayerCard();
      break;
    case 'stand':
      handleDealerTurn();
      break;
    case 'quit':
      quitGame();
      break;
  }
};

const startGame = () => {
  setUpTable();
  shuffleCards();
  dealInitialHands();
};

const shuffleCards = () => {
  let shuffled = [...cardDeck];

  // JS version of: https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#The_modern_algorithm
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  availableCards = shuffled;
};

const removeCardFromDeck = i => availableCards.splice(i, 1);

const getRandomCard = () => {
  const randomIndex = Math.floor(Math.random() * availableCards.length);
  const randomCard = availableCards[randomIndex];

  removeCardFromDeck(randomIndex);

  return randomCard;
};

const dealInitialHands = () => {
  for (let i = 1; i <= 2; i++) {
    dealerCards.push(getRandomCard());
    playerCards.push(getRandomCard());
  }

  displayHands();
  promptUserForAction();
};

const dealPlayerCard = () => {
  playerCards.push(getRandomCard());
  displayHands();
  checkForBust(playerCards, promptUserForAction);
};

const dealDealerCard = () => {
  console.log('Dealer hits...');
  dealerCards.push(getRandomCard());
  checkForBust(dealerCards, handleDealerTurn);
};

const handleDealerTurn = () => {
  isDealerTurn = true;
  const dealerHandValue = getHandValue(dealerCards);
  const playerHandValue = getHandValue(playerCards);
  displayHands();

  dealerHandValue >= 17 ? compareHands(dealerHandValue, playerHandValue) : dealDealerCard();
};

const getHandValue = hand => {
  let aceCount = 0;

  let totalValue = hand.reduce((acc, curr) => {
    //handle aces after other cards are totaled (1 vs 11 scenario needs non-ace card totals first)
    if (curr === 'A') {
      aceCount++;
      return acc;
    }

    faceCards.includes(curr) ? (acc += 10) : (acc += curr);

    return acc;
  }, 0);

  if (aceCount > 0) {
    const totalValueWithAces = Array(aceCount)
      .fill()
      .reduce(acc => {
        acc += 11; // start at 11

        if (acc > 21) acc -= 10; //reduce to 1 if it will push past 21

        return acc;
      }, totalValue); //start with non-ace total value

    return totalValueWithAces;
  }

  return totalValue;
};

const checkForBust = (hand, cb) => {
  const handValue = getHandValue(hand);

  handValue > 21 ? handleBust() : cb();
};

const handleBust = () => {
  gameHasStarted = false;

  displayHands();
  console.log(isDealerTurn ? winMessage : lossMessage);
  promptUserForAction();
};

const compareHands = (dealerHandValue, playerHandValue) => {
  if (dealerHandValue === playerHandValue) console.log(tieMessage);
  if (dealerHandValue < playerHandValue) console.log(winMessage);
  if (dealerHandValue > playerHandValue) console.log(lossMessage);

  promptUserForAction();
};

const displayHands = () => {
  const houseCards = dealerCards.map((card, i) => {
    // Hide dealer card when it's player's turn
    if (i === 0) return isDealerTurn ? card : '*';

    return card;
  });

  console.log(`House: ${houseCards.join(', ')}`);
  console.log(`Player: ${playerCards.join(', ')}`);
};

const quitGame = () => {
  console.log("Don't feel bad! In the end, the house always wins! Goodbye!");

  rl.close();
};

initiateGame();
