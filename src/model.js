const Model = {
  fieldSize: 10,
  showComputersField: false,
  gameState: {},
  cellStatus: {
    miss: -1,
    empty: 0,
    ship: 1,
    hit: 2
  },
  computersTurnDelayInMilliseconds: 500
};

Model.initGameState = () => {
  const humanShipsData = generateShipsData();
  const computerShipsData = generateShipsData();

  Model.gameState = {
    human: {
      ships: humanShipsData.shipGeneration,
      fieldArray: humanShipsData.fieldArray
    },
    computer: {
      ships: computerShipsData.shipGeneration,
      fieldArray: computerShipsData.fieldArray
    },
    currentTurnPlayer: 'human'
  };
  Logger.log('Game State initialized');
};

function generateShipsData() {
  const fieldArray = getEmptyFieldArray();
  let shipGenerationDataContainer = {
    shipGeneration: [],
    fieldArray
  };
  const remainingShipsForPlacingOnField = getRemainingShipsForPlacingOnField();
  shipGenerationDataContainer = getShipGenerationRecursive(
    remainingShipsForPlacingOnField,
    shipGenerationDataContainer
  );
  return shipGenerationDataContainer;
}

function getEmptyFieldArray() {
  const fieldArray = new Array(Model.fieldSize);
  fieldArray.fill(new Array(Model.fieldSize).fill(Model.cellStatus.empty));
  return fieldArray;
}

function getRemainingShipsForPlacingOnField() {
  const remainingShipsForPlacingOnField = [];
  for (let shipSize = 1; shipSize <= 4; shipSize++) {
    const shipsCount = 5 - shipSize;
    for (let i = 0; i < shipsCount; i++) {
      remainingShipsForPlacingOnField.push({
        size: shipSize
      });
    }
  }
  return remainingShipsForPlacingOnField;
}

// -----Рекурсивный алгоритм генерации расположения кораблей на поле-----
// Кратко: идея алгоритма как в задаче о восьми ферзях, поиск с возвратом.
// Подробнее: 
// На каждом уровне рекурсии производится поиск доступных позиций для очередного корабля из очереди
// Для корабля выбирается случайная позиция из списка оставшихся доступных позиций, потом углубляем рекурсию для следующего корабля
// Если корабль расположить некуда, происходит откат на один уровень рекурсии обратно по стеку
// Для верхнего уровня рекурсии в этом случае из списка доступных позиций выбранная удаляется, выбирается другая
function getShipGenerationRecursive(remainingShipsForPlacingOnField, originalDataContainer) {
  if (remainingShipsForPlacingOnField.length == 0)
    return originalDataContainer;

  const currentDataContainer = deepCopy(originalDataContainer);
  let newDataContainer;

  const shipSize = remainingShipsForPlacingOnField[0].size;
  let possibleShipPositions;
  let shipPosition;
  let shipType;

  if (Math.random() < 0.5) {
    shipType = 'horizontal';
    possibleShipPositions = getPossiblePositionsOfHorizontalShip(
      currentDataContainer.fieldArray,
      shipSize
    );
  } else {
    shipType = 'vertical';
    possibleShipPositions = getPossiblePositionsOfVerticalShip(
      currentDataContainer.fieldArray,
      shipSize
    );
  }

  do {
    shipPosition = popRandomElement(possibleShipPositions);
    if (shipPosition === null)
      return null; // больше некуда поместить корабль
    const newremainingShipsForPlacingOnField = remainingShipsForPlacingOnField.slice(1);
    const newShipGeneration = deepCopy(currentDataContainer.shipGeneration);
    const newFieldArray = deepCopy(currentDataContainer.fieldArray);
    if (shipType == 'horizontal')
      placeShipHorizontally(newFieldArray, shipSize, shipPosition);
    else
      placeShipVertically(newFieldArray, shipSize, shipPosition);

    newShipGeneration.push({
      position: shipPosition,
      size: shipSize,
      type: shipType
    });

    newDataContainer = {
      shipGeneration: newShipGeneration,
      fieldArray: newFieldArray
    };

    newDataContainer = getShipGenerationRecursive(
      newremainingShipsForPlacingOnField,
      newDataContainer
    );
  } while (newDataContainer === null);
  return newDataContainer;
}

function getPossiblePositionsOfHorizontalShip(fieldArray, shipSize) {
  // Позицию корабля будем определять индексом его левой клетки в массиве
  const possibleShipPositions = [];
  for (let row = 0; row < Model.fieldSize; row++) {
    for (let col = 0; col < Model.fieldSize; col++) {
      if (isPossiblePositionOfHorizontalShip(row, col, fieldArray, shipSize)) {
        possibleShipPositions.push({
          row,
          col
        });
      }
    }
  }
  return possibleShipPositions;
}

function isPossiblePositionOfHorizontalShip(row, col, fieldArray, shipSize) {
  const lastShipCol = col + shipSize - 1;

  if (lastShipCol >= Model.fieldSize)
    return false; // корабль выйдет за границы поля

  // нельзя пересекать другие корабли, соприкасаться бортами или углами
  for (let i = row - 1; i <= row + 1; i++) {
    for (let j = col - 1; j <= lastShipCol + 1; j++) {
      if (!isEmptyOrOuterCell(i, j, fieldArray))
        return false;
    }
  }

  return true;
}

function getPossiblePositionsOfVerticalShip(fieldArray, shipSize) {
  // Позицию корабля будем определять индексом его верхней клетки в массиве
  const possibleShipPositions = [];
  for (let row = 0; row < Model.fieldSize; row++) {
    for (let col = 0; col < Model.fieldSize; col++) {
      if (isPossiblePositionOfVerticalShip(row, col, fieldArray, shipSize)) {
        possibleShipPositions.push({
          row,
          col
        });
      }
    }
  }
  return possibleShipPositions;
}

function isPossiblePositionOfVerticalShip(row, col, fieldArray, shipSize) {
  const lastShipRow = row + shipSize - 1;

  if (lastShipRow >= Model.fieldSize)
    return false; // корабль выйдет за границы поля

  // нельзя пересекать другие корабли, соприкасаться бортами или углами
  for (let i = row - 1; i <= lastShipRow + 1; i++) {
    for (let j = col - 1; j <= col + 1; j++) {
      if (!isEmptyOrOuterCell(i, j, fieldArray))
        return false;
    }
  }

  return true;
}

function isEmptyOrOuterCell(row, col, fieldArray) {
  if (row < 0 || row >= Model.fieldSize || col < 0 || col >= Model.fieldSize)
    return true;

  return fieldArray[row][col] === Model.cellStatus.empty;
}

function placeShipHorizontally(fieldArray, shipSize, position) {
  fieldArray[position.row].fill(Model.cellStatus.ship, position.col, position.col + shipSize);
}

function placeShipVertically(fieldArray, shipSize, position) {
  for (let i = position.row; i < position.row + shipSize; i++)
    fieldArray[i][position.col] = Model.cellStatus.ship;
}

function popRandomElement(array) {
  if (array.length == 0)
    return null;

  const randomIndex = Math.floor(Math.random() * array.length);
  const element = array[randomIndex];
  array.splice(randomIndex, 1);
  return element;
}

function deepCopy(sourceObj) {
  let key;
  let value;
  const output = Array.isArray(sourceObj) ? [] : {};
  for (key in sourceObj) {
    value = sourceObj[key];
    output[key] = (typeof value === "object" && value !== null) ? deepCopy(value) : value;
  }
  return output;
}

// -----API модели-----

Model.getCellStatus = (cell) => {
  return Model.gameState[cell.master].fieldArray[cell.row][cell.col];
};

Model.isMissCell = (cell) => {
  return Model.gameState[cell.master].fieldArray[cell.row][cell.col] === Model.cellStatus.miss;
};

Model.isEmptyCell = (cell) => {
  return Model.gameState[cell.master].fieldArray[cell.row][cell.col] === Model.cellStatus.empty;
};

Model.isShipCell = (cell) => {
  return Model.gameState[cell.master].fieldArray[cell.row][cell.col] === Model.cellStatus.ship;
};

Model.isHitCell = (cell) => {
  return Model.gameState[cell.master].fieldArray[cell.row][cell.col] === Model.cellStatus.hit;
};

Model.setMissedStatus = (cell) => {
  Model.gameState[cell.master].fieldArray[cell.row][cell.col] = Model.cellStatus.miss;
};

Model.setHitStatus = (cell) => {
  Model.gameState[cell.master].fieldArray[cell.row][cell.col] = Model.cellStatus.hit;
  if (cell.master === 'human') {
    if (cell.row - 1 >= 0 && cell.col - 1 >= 0)
      Model.gameState.human.fieldArray[cell.row-1][cell.col-1] = Model.cellStatus.miss;
    if (cell.row - 1 >= 0 && cell.col + 1 < Model.fieldSize)
      Model.gameState.human.fieldArray[cell.row-1][cell.col+1] = Model.cellStatus.miss;
    if (cell.row + 1 < Model.fieldSize && cell.col - 1 >= 0)
      Model.gameState.human.fieldArray[cell.row+1][cell.col-1] = Model.cellStatus.miss;
    if (cell.row + 1 < Model.fieldSize && cell.col + 1 < Model.fieldSize)
      Model.gameState.human.fieldArray[cell.row+1][cell.col+1] = Model.cellStatus.miss;
  }
};

Model.setNextTurn = () => {
  const opponent = Model.getOpponent(Model.gameState.currentTurnPlayer);
  Model.gameState.currentTurnPlayer = opponent;
};

Model.isHumansTurn = () => {
  return Model.gameState.currentTurnPlayer === 'human';
}

Model.isComputersTurn = () => {
  return Model.gameState.currentTurnPlayer === 'computer';
}

Model.getOpponent = (player) => {
  const opponent = (player === 'human') ?
    'computer' :
    'human';
  return opponent;
}

Model.isDefeated = (player) => {
  return !Model.areShipsRemaining(player);
} 

Model.areShipsRemaining = (player) => {
  const array = Model.gameState[player].fieldArray;
  
  for (let row = 0; row < Model.fieldSize; row++) {
    for (let col = 0; col < Model.fieldSize; col++) {
      let cell = {
        row,
        col,
        master: player
      };
      if (Model.isShipCell(cell))
        return true;
    }
  }
  return false;
};

Model.randomCellIndex = () => Math.floor(Math.random() * Model.fieldSize);
