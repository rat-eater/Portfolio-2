import { print, askQuestion } from "./io.mjs";
import { ANSI } from "./ansi.mjs";
import DICTIONARY from "./language.mjs";
import showSplashScreen from "./splash.mjs";

const GAME_BOARD_SIZE = 3;
const PLAYER_1 = 1;
const PLAYER_2 = -1;
const EMPTY = 0;

const MENU_CHOICES = {
    START_GAME_PVP: 1,
    START_GAME_PVC: 2,
    SHOW_SETTINGS: 3,
    EXIT_GAME: 4,
};

let language = DICTIONARY.en;
let gameboard;
let currentPlayer;

clearScreen();
showSplashScreen();
setTimeout(start, 2500); // Show splash screen for 2.5 seconds

async function start() {
    do {
        let chosenAction = await showMenu();

        switch (chosenAction) {
            case MENU_CHOICES.START_GAME_PVP:
                await runGame(false); // PvP
                break;
            case MENU_CHOICES.START_GAME_PVC:
                await runGame(true); // PvC
                break;
            case MENU_CHOICES.SHOW_SETTINGS:
                await showSettings(); // Access settings
                break;
            case MENU_CHOICES.EXIT_GAME:
                clearScreen();
                process.exit();
        }
    } while (true);
}

async function runGame(isPlayerVsComputer) {
    let isPlaying = true;

    while (isPlaying) {
        initializeGame(); // Reset everything related to playing the game
        isPlaying = await playGame(isPlayerVsComputer); // Run the actual game 
    }
}

async function showMenu() {
    let choice;
    let validChoice = false;

    while (!validChoice) {
        clearScreen();
        print(ANSI.COLOR.YELLOW + "MENU" + ANSI.RESET);
        print("1. Play Game (PvP)");
        print("2. Play Game (PvC)");
        print("3. Settings");
        print("4. Exit Game");

        choice = await askQuestion("Select an option: ");

        // Ensure that the choice corresponds to a menu option
        if (Object.values(MENU_CHOICES).includes(Number(choice))) {
            validChoice = true;
        } else {
            print(ANSI.COLOR.RED + "Invalid choice. Please try again." + ANSI.RESET);
        }
    }

    return Number(choice); // Return the numeric choice
}

async function showSettings() {
    clearScreen();
    print("Settings Menu");
    print("1. Change Language");
    print("2. Back to Main Menu");
    
    let choice = await askQuestion("Choose an option: ");
    if (choice === '1') {
        await changeLanguage();
    } else if (choice === '2') {
        return; // Go back to main menu
    } else {
        print("Invalid choice. Returning to settings.");
        await showSettings(); // Callback to show settings again
    }
}

async function changeLanguage() {
    clearScreen();
    print("Choose Language:");
    print("1. English");
    print("2. Romanian");
    
    let choice = await askQuestion("Select language: ");
    switch (choice) {
        case '1':
            language = DICTIONARY.en;
            break;
        case '2':
            language = DICTIONARY.ro;
            break;
        default:
            print("Invalid choice. Returning to settings.");
            await showSettings(); // Show settings if command is invalid
    }
}

async function playGame(isPlayerVsComputer) {
    let outcome;
    do {
        clearScreen();
        showGameBoardWithCurrentState();
        showHUD();
        
        let move;
        if (isPlayerVsComputer && currentPlayer === PLAYER_2) {
            move = await getComputerMove(); // Get move from computer
        } else {
            move = await getGameMoveFromCurrentPlayer();
        }

        updateGameBoardState(move);
        outcome = evaluateGameState();
        changeCurrentPlayer();
    } while (outcome === 0);

    showGameSummary(outcome);
    return await askWantToPlayAgain();
}

async function askWantToPlayAgain() {
    let answer = await askQuestion(language.PLAY_AGAIN_QUESTION);
    return answer && answer.toLowerCase()[0] === language.CONFIRM;
}

function showGameSummary(outcome) {
    clearScreen();
    if (outcome === 'draw') {
        print("The game is a draw!");
    } else {
        let winningPlayer = (outcome > 0) ? 1 : 2;
        print("Winner is Player " + winningPlayer);
    }
    showGameBoardWithCurrentState();
    print("GAME OVER");
}

function changeCurrentPlayer() {
    currentPlayer *= -1;
}

function evaluateGameState() {
    let sum = 0;

    // Check rows and columns
    for (let i = 0; i < GAME_BOARD_SIZE; i++) {
        sum = gameboard[i].reduce((acc, val) => acc + val, 0);
        if (Math.abs(sum) === 3) return sum; // Win found
    }

    for (let i = 0; i < GAME_BOARD_SIZE; i++) {
        sum = 0;
        for (let j = 0; j < GAME_BOARD_SIZE; j++) {
            sum += gameboard[j][i];
        }
        if (Math.abs(sum) === 3) return sum; // Win found
    }

    // Check diagonals
    sum = gameboard[0][0] + gameboard[1][1] + gameboard[2][2];
    if (Math.abs(sum) === 3) return sum; // Win found

    sum = gameboard[0][2] + gameboard[1][1] + gameboard[2][0];
    if (Math.abs(sum) === 3) return sum; // Win found

    // Check for draw
    if (gameboard.flat().every(cell => cell !== EMPTY)) return 'draw';

    return 0; // Game continues
}

function updateGameBoardState(move) {
    const ROW_ID = 0;
    const COLUMN_ID = 1;
    gameboard[move[ROW_ID]][move[COLUMN_ID]] = currentPlayer;
}

async function getGameMoveFromCurrentPlayer() {
    let position = null;
    do {
        let rawInput = await askQuestion("Place your mark at (row col): ");
        position = rawInput.split(" ").map(num => parseInt(num) - 1); // I used help from others
    } while (!isValidPositionOnBoard(position));

    return position;
}

async function getComputerMove() {
    for (let row = 0; row < GAME_BOARD_SIZE; row++) {
        for (let col = 0; col < GAME_BOARD_SIZE; col++) {
            if (gameboard[row][col] === EMPTY) {
                return [row, col]; // Plain logic: first available space
            }
        }
    }
    return null; 
}

function isValidPositionOnBoard(position) {
    if (position.length < 2) {
        return false;
    }

    let row = position[0];
    let col = position[1];

    if (row < 0 || row >= GAME_BOARD_SIZE || col < 0 || col >= GAME_BOARD_SIZE) {
        return false; // Not on board
    }
    if (gameboard[row][col] !== EMPTY) {
        return false; 
    }

    return true; 
}

function showHUD() {
    let playerDescription = (currentPlayer === PLAYER_1) ? "one" : "two";
    print("Player " + playerDescription + " it is your turn");
}

function showGameBoardWithCurrentState() {
    for (let row = 0; row < GAME_BOARD_SIZE; row++) {
        let rowOutput = "";
        for (let col = 0; col < GAME_BOARD_SIZE; col++) {
            let cell = gameboard[row][col];
            if (cell === EMPTY) {
                rowOutput += "_ ";
            } else if (cell === PLAYER_1) {
                rowOutput += ANSI.COLOR.GREEN + "X" + ANSI.RESET + " ";
            } else {
                rowOutput += ANSI.COLOR.RED + "O" + ANSI.RESET + " ";
            }
        }
        print(rowOutput);
    }
}

function initializeGame() {
    gameboard = createGameBoard();
    currentPlayer = PLAYER_1;
}

function createGameBoard() {
    return Array.from({ length: GAME_BOARD_SIZE }, () => Array(GAME_BOARD_SIZE).fill(EMPTY));
}

function clearScreen() {
    console.log(ANSI.CLEAR_SCREEN, ANSI.CURSOR_HOME, ANSI.RESET);
}


//#endregion
