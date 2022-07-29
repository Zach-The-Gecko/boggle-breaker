import { readFileSync } from "fs";

const directions = [
  "↖️",
  "⬆️",
  "↗️",
  "⬅️",
  "➡️",
  "↙️",
  "⬇️",
  "↘️",
  "👋",
  "👆",
  "🫰",
  "👈",
  "👉",
  "🖋️",
  "👇",
  "✏️",
];

const doesThisWordWork = (word, startingTile, gameBoard) => {
  const startingAcc = startingTile.letter === word[0] ? [startingTile] : [];
  // We need to see if the first letter of the word matches the startingTile

  // Sample Gameboard:
  // C  A  T  R
  // A  M  B  L
  // Z  U  I  P
  // T  U  M  B

  // Positions:
  // 0  1  2  3
  // 4  5  6  7
  // 8  9  10 11
  // 12 13 14 15

  // "letterTree" is layed out like this
  // Sample Word: "Cat"

  // [
  //   [  <--  This is "startingAcc"
  //     {
  //       letter: "c",
  //       position: 0,
  //     },
  //   ],  <--  This is "startingAcc"

  //   [
  //     {
  //       letter: "a",
  //       position: 1,
  //     },
  //     {
  //       letter: "a",
  //       position: 4,
  //     },
  //   ],
  //   [
  //     {
  //       letter: "t",
  //       position: 2,
  //     },
  //   ],
  // ];

  const letterTree = Array.from(word).reduce(
    (acc, _letter, index, word) => {
      if (acc[index]) {
        // if there was at least one letter from last time to continue mapping
        acc[index].map((parentTile) => {
          // from all of the letters it will map it as the "parentTile"
          acc[index + 1] = parentTile.nearbyLettersIndex
            .map((index) => {
              return gameBoard[index];
            }) // Converts the "nearbyLettersIndex" into the actual nearby letters
            .reduce((validNearbyTiles, tile, direction) => {
              // filters and makes sure that the next array in the acc
              // is correct, also adds parents so that you can find the path

              // we can tell the "direction"
              //because all of the nearby letters are listed from top left to bottom right

              if (tile) {
                // Not all letters are valid
                if (tile.letter === word[index + 1]) {
                  // checks if the letter is the right letter
                  tile.parents = [...parentTile.parents, parentTile]; // adds the parents of the parent tile and the parent tile as its parents
                  const parentTilePositions = tile.parents.map(
                    // converts the tiles into the position of the tiles
                    (oneOfTheParents) => {
                      return oneOfTheParents.position;
                    }
                  );
                  if (!parentTilePositions.includes(tile.position)) {
                    // makes sure that you don't use a letter that was already used in the path
                    tile.parents[tile.parents.length - 1].direction = // sets the direction of the parent tile
                      directions[direction];
                    validNearbyTiles.push(tile); // adds the tile to be mapped as parent tiles in the acc
                  }
                }
              }

              return validNearbyTiles;
            }, []);
        });
        return acc;
      }
      return acc;
    },
    [startingAcc] // Starting Accumulator
  );

  if (letterTree.length - 1 === word.length) {
    // checks if it was able to get the entire word done in the LetterTree
    // changes the emojis of the starting and ending tiles
    const finalTile =
      letterTree[word.length - 1][letterTree[word.length - 1].length - 1];
    const startingTile = letterTree[0][letterTree[0].length - 1];
    finalTile.direction = "⭐";
    startingTile.direction =
      directions[directions.indexOf(startingTile.direction) + 8];

    const emptyAnswer = [
      "⬛",
      "⬛",
      "⬛",
      "⬛",
      "⬛",
      "⬛",
      "⬛",
      "⬛",
      "⬛",
      "⬛",
      "⬛",
      "⬛",
      "⬛",
      "⬛",
      "⬛",
      "⬛",
    ];

    [...finalTile.parents, finalTile].map((tile) => {
      // gets the final tile's parents and changes "emptyAnswer" to contain actual directions
      emptyAnswer[tile.position] = tile.direction;
    });

    const finalAnswer = emptyAnswer.reduce(
      // converts the array into a string
      (stringAnswer, displayLetter, index) => {
        stringAnswer = stringAnswer + displayLetter;
        if (index % 4 == 3) {
          stringAnswer = stringAnswer + "<br>";
        }
        return stringAnswer;
      },
      ""
    );
    return finalAnswer;
  } else {
    return false;
  }
};

export default (minAnswers, input) => {
  // Forms the gameboard
  const unfinishedGameBoard = Array.from(input).map((letter, position) => {
    return {
      letter,
      parents: [],
      direction: "",
      position,
    };
  });

  const gameBoard = unfinishedGameBoard.map((tile) => {
    const row = Math.floor(tile.position / 4); // Gets the row
    const column = tile.position - row * 4; // and column of the tile

    const isLeft = Boolean(column) ? 1 : NaN; // determines if the tile is on the left
    const isRight = column === 3 ? NaN : 1; // or right side to help find nearby letters

    const nearbyLettersIndex = [
      tile.position - 5 * isLeft,
      tile.position - 4,
      tile.position - 3 * isRight,
      tile.position - 1 * isLeft,
      tile.position + 1 * isRight,
      tile.position + 3 * isLeft,
      tile.position + 4,
      tile.position + 5 * isRight,
    ];

    return {
      ...tile,
      nearbyLettersIndex,
    };
  });

  const words = readFileSync(
    "./dictionaries/l" + minAnswers + ".txt",
    // there are a few dictionaries that contain minimum of 3, 4, or 5 letters
    // (along with a test dictionary for bugs) and it reads what dictionary we need
    // I am just using all valid scrabble words
    "utf8"
  ).split("\n");

  const answers = words.reduce((acc, word) => {
    // maps through every single word
    gameBoard.map((tile) => {
      // and for every word it maps through every single tile
      const answer = doesThisWordWork(word.toLowerCase(), tile, gameBoard); // checks if the word will work

      gameBoard.map((tile) => {
        // resets the values of a couple of properties
        (tile.parents = []), (tile.direction = "");
      });
      if (answer) {
        acc.push([word, answer]); // adds the answer to the acc
      }
    });
    return acc;
  }, []);
  return answers.sort((a, b) => b[0].length - a[0].length); // sorts the answers from longest to shortest
};
