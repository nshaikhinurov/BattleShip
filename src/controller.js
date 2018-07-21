const Controller = {};

$(document).ready(() => {
  Logger.log('Document ready');
  Controller.startNewGame();
});

Controller.startNewGame = () => {
  Logger.log('New game starting');
  Model.initGameState();
  View.initFieldContainers();
  View.drawFields();
  View.drawShipsToFields();
  View.updateTurnIcons();
};

Controller.handleCellClick = (cell) => {
  if (!Model.isHumansTurn())
    return;

  Logger.log(`Player shot ${cell.row}-${cell.col}`);

  if (Model.isEmptyCell(cell)) {
    Model.setMissedStatus(cell);
    initNextTurn();
  } else if (Model.isShipCell(cell)) {
    Model.setHitStatus(cell);
    checkWinGame('human');
  }
  View.updateCellView(cell);
};

function initNextTurn() {
  Model.setNextTurn();
  View.updateTurnIcons();
  if (Model.isComputersTurn())
    setTimeout(makeComputersTurn, Model.computersTurnDelayInMilliseconds);
}

function makeComputersTurn() {
  let cell;

  // Компьютер выбирает клетку в которую ещё не стрелял
  do {
    cell = {
      row: Model.randomCellIndex(),
      col: Model.randomCellIndex(),
      master: 'human'
    };
    Logger.log(`Computer chose ${cell.row}-${cell.col}`);
  } while (isShotCell(cell));

  Logger.log(`Computer shot ${cell.row}-${cell.col}`);
  if (Model.isEmptyCell(cell)) {
    Model.setMissedStatus(cell);
    initNextTurn();
  } else if (Model.isShipCell(cell)) {
    Model.setHitStatus(cell);
    checkWinGame('computer');
    setTimeout(makeComputersTurn, Model.computersTurnDelayInMilliseconds);
  }
  View.updateCellView(cell);
}

function isShotCell(cell) {
  return Model.isHitCell(cell) || Model.isMissCell(cell);
}

function checkWinGame(player) {
  const opponent = Model.getOpponent(player);
  if (Model.isDefeated(opponent)){
    Logger.log(`${player} wins!`);
    setTimeout(View.showGameOverScreen.bind(null, player), 1000);
  }
}
