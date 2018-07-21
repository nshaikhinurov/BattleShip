const View = {};

View.drawFields = () => {
  drawField('human');
  drawField('computer');
  Logger.log('Fields drawn');
};

function drawField(divIdOfPlayersField) {
  for (let row = 0; row <= Model.fieldSize; row++) {
    for (let col = 0; col <= Model.fieldSize; col++) {
      let text = '';
      let className = 'cell';
      if (row == 0 && col == 0) {
        className += ' label';
      } else if (row > 0 && col == 0) {
        text = getRowCharLabel(row);
        className += ' label row-heading';
      } else if (row == 0 && col > 0) {
        text = col;
        className += ' label col-heading';
      }
      const cellId = `cell_${row}-${col}`;
      $(`#${divIdOfPlayersField} .field`).append(`<div id=${cellId} class="${className}">${text}</div>`);
    }
  }
}

function getRowCharLabel(rowIndex) {
  // Только для классической размерности
  const letterACharCode = 'А'.charCodeAt(0);
  let rowCharLabel = String.fromCharCode(rowIndex + letterACharCode - 1);
  if (rowCharLabel === 'Й')
    rowCharLabel = 'К';
  return rowCharLabel;
}


View.drawShipsToFields = () => {
  drawShipsToField(Model.gameState.human.fieldArray, 'human');
  drawShipsToField(Model.gameState.computer.fieldArray, 'computer');
  Logger.log('Ships drawn to fields');
};

function drawShipsToField(fieldArray, divIdOfPlayersField) {
  for (let row = 0; row < Model.fieldSize; row++) {
    for (let col = 0; col < Model.fieldSize; col++) {
      const cell = fieldArray[row][col];
      let className = 'field-cell ';
      className += (cell == 0) ? 'empty' : 'ship';
      if (divIdOfPlayersField === 'computer' && !Model.showComputersField)
        className = 'field-cell empty';
      const cellDomElement = $(`#${divIdOfPlayersField} .field #cell_${row + 1}-${col + 1}`);
      cellDomElement.addClass(className);
      if (divIdOfPlayersField === 'computer')
        cellDomElement.click(Controller.handleCellClick.bind(null, {row, col, master: divIdOfPlayersField}));
    }
  }
}

View.updateTurnIcons = () => {
  const waitingIcon = getWaitingIcon();
  const turnIcon = getTurnIcon();
  if (Model.gameState.currentTurnPlayer === 'human') {
    $('#human .turn-icon').html(turnIcon);
    $('#computer .turn-icon').html(waitingIcon);
    Logger.log(`Player's turn`);
  } else {
    $('#human .turn-icon').html(waitingIcon);
    $('#computer .turn-icon').html(turnIcon);
    Logger.log(`Computer's turn`);
  }
};

function getWaitingIcon() {
  return '<i class="fas fa-spinner fa-spin waiting-icon"></i>';
}

function getTurnIcon() {
  return '<i class="fas fa-check turn-icon"></i>';
}

View.updateCellView = (cell) => {
  let targetCellStatus = Model.getCellStatus(cell);
  if (Model.isMissCell(cell)){
    drawMissIcon(cell);
      Logger.log(`Missed!`);
  } else if (Model.isHitCell(cell)) {
    drawHitIcon(cell);
      Logger.log(`Hit!`);
  }
};

function drawMissIcon(cell) {
  const missIcon = getMissIcon();
  $(`#${cell.master} #cell_${cell.row + 1}-${cell.col + 1}`).html(missIcon);
}

function getMissIcon() {
  return '<i class="fas fa-circle"></i>';
}

function drawHitIcon(cell) {
  const hitIcon = getHitIcon();
  $(`#${cell.master} #cell_${cell.row + 1}-${cell.col + 1}`)
    .addClass('ship-hit')
    .html(hitIcon);
}

function getHitIcon() {
  return '<i class="fas fa-times"></i>';
}

View.showGameOverScreen = (winner) => {
  if (winner === 'human')
    showVictoryScreen();
  else
    showDefeatScreen();
};

function showVictoryScreen() {
  const content =
  `<div class="win">
    <div class="game-result">
      Победа!
    </div>
    <div class="emoji">
      <i class="far fa-laugh-beam"></i>
      <i class="far fa-grin-tongue-wink"></i>
      <i class="far fa-laugh-squint"></i>
    </div>
    <div class="button" onclick="Controller.startNewGame()">
      Сыграть ещё!
    </div>
  </div>`;
  $('.field-containers').html(content);
}

function showDefeatScreen() {
  const content =
  `<div class="win">
    <div class="game-result">
      Поражение!
    </div>
    <div class="emoji">
      <i class="far fa-angry"></i>
      <i class="far fa-sad-cry"></i>
      <i class="far fa-tired"></i>
    </div>
    <div class="button" onclick="Controller.startNewGame()">
      Матч-реванш!
    </div>
  </div>`;
  $('.field-containers').html(content);
}

View.initFieldContainers = () => {
  const content =
  `<div class="field-container" id="human">
    <div class="field"></div>
    <div class="player-info">
      <span class="turn-icon"></span>
      <span>Я</span>
    </div>
  </div>
  <div class="field-container" id="computer">
    <div class="field"></div>
    <div class="player-info">
      <span class="turn-icon"></span>
      <span>Компьютер</span>
    </div>
  </div>`;
  $('.field-containers').html(content);
};
