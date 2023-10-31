"use strict";

const ROW = 7;
const COL = 7;

// A structure to hold the necessary parameters
class Cell {
  constructor() {
    this.p = 0;
  }
}

/* ******* HELPER FUNCTIONS **************/
// A helper function to check whether the given cell is
// blocked or not
function isUnBlocked(grid, row, col) {
  // Returns true if the cell is not blocked, else false
  if (grid[row][col] == 0) return true;
  else return false;
}

// A helper function to check whether the given cell (row, col)
// is a valid cell or not.
function isValid(row, col) {
  // Returns true if row number and column number
  // is in range
  return row >= 0 && row < ROW && col >= 0 && col < COL;
}

// Set initial probabilities to 0
function setInitialProbs(tempProb, posteriorProb) {
  for (let i = 0; i < ROW; i++) {
    for (let j = 0; j < COL; j++) {
      posteriorProb[i][j] = "";
      tempProb[i][j] = 0;
    }
  }
}

function printPosteriorProbs(probabilities) {
  for (let i = 0; i < ROW; i++) {
    for (let j = 0; j < COL; j++) {
      process.stdout.write(probabilities[i][j] + " ");
    }
    console.log();
  }
}

// ** Sensing probability function (Filtering)
// This function takes in the structure of the maze, the prior probabilities of every open cell in the maze
// and the sensing action for every cell, for example [0,1,0,0] means the robot senses obstacle west, east, south
//  and open square north
function sensing(grid, priorProb, sensingActn) {
  let westProb = 0;
  let northProb = 0;
  let eastProb = 0;
  let southProb = 0;
  let sum = 0;

  // Create the posterior probability 2D array.
  //   This is what is going to be returned by the function later.
  let posteriorProb = new Array(ROW);
  for (let i = 0; i < ROW; i++) {
    posteriorProb[i] = new Array(COL);
  }

  // This is a 2D array representing P(Z|S)P(S)
  let tempProb = new Array(ROW);
  for (let i = 0; i < ROW; i++) {
    tempProb[i] = new Array(COL);
  }

  setInitialProbs(tempProb, posteriorProb);

  // loop over the grid, for every cell check if it's open
  for (let i = 0; i < ROW; i++) {
    for (let j = 0; j < COL; j++) {
      if (grid[i][j] === 0) {
        // The cell is open, so we calculate the posterior probability for that cell

        // * ----- Check the left cell (WEST) -----

        // Check if it's a valid cell
        if (isValid(i, j - 1)) {
          const leftCell = grid[i][j - 1];
          // open square
          if (leftCell == 0) {
            // probability that robot senses open square west
            if (leftCell === sensingActn[0]) westProb = 0.95;
            // probability robot senses an obstacle
            else westProb = 0.05;
          }
          // obstacle
          else {
            // probability that robot senses an obstacle west
            if (leftCell === sensingActn[0]) westProb = 0.9;
            // probability that robot senses an open square
            else westProb = 0.1;
          }
        }

        // not a valid cell, so acts as a 1
        else {
          if (sensingActn[0] === 1) westProb = 0.9;
          else westProb = 0.1;
        }

        // * -------- Check the top cell (NORTH) ------

        // Check if it's a valid cell
        if (isValid(i - 1, j)) {
          const northCell = grid[i - 1][j];

          // open square
          if (northCell === 0) {
            // probability that robot senses an open square north
            if (northCell === sensingActn[1]) northProb = 0.95;
            // probability that robot senses an obstacle north
            else northProb = 0.05;
          }
          // obstacle
          else {
            // probability that robot senses an obstacle north
            if (northCell === sensingActn[1]) northProb = 0.9;
            else northProb = 0.1;
          }
        }
        // not a valid cell, acts as an obstacle (1)
        else {
          if (sensingActn[1] === 1) northProb = 0.9;
          else northProb = 0.1;
        }

        // * --------- Check the right cell (EAST) -------

        // Check if it's a valid cell
        if (isValid(i, j + 1)) {
          const eastCell = grid[i][j + 1];

          // open square
          if (eastCell === 0) {
            // probability that robot senses an open square east
            if (eastCell === sensingActn[2]) eastProb = 0.95;
            // probability that robot senses an obstacle east
            else eastProb = 0.05;
          }
          // obstacle
          else {
            // probability that robot senses an obstacle east
            if (eastCell === sensingActn[2]) eastProb = 0.9;
            else eastProb = 0.1;
          }
        }
        // not a valid cell, acts as an obstacle (1)
        else {
          if (sensingActn[2] === 1) eastProb = 0.9;
          else eastProb = 0.1;
        }

        // * ---------- Check the south cell (SOUTH) -------------

        // Check if it's a valid cell
        if (isValid(i + 1, j)) {
          const southCell = grid[i + 1][j];

          // open square
          if (southCell === 0) {
            // probability that robot senses an open square north
            if (southCell === sensingActn[3]) southProb = 0.95;
            // probability that robot senses an obstacle north
            else southProb = 0.05;
          }
          // obstacle
          else {
            // probability that robot senses an obstacle north
            if (southCell === sensingActn[3]) southProb = 0.9;
            else southProb = 0.1;
          }
        }
        // not a valid cell, acts as an obstacle (1)
        else {
          if (sensingActn[3] === 1) southProb = 0.9;
          else southProb = 0.1;
        }
      } else {
        tempProb[i][j] = 1; // Mark an obstacle in tempProb
        continue;
      }

      // Multiply westProb*northProb*eastProb*southProb*priorProb[i][j]

      // This is P(Z|S)
      let evidenceConditionalProb = westProb * northProb * eastProb * southProb;

      // P(S|Z) = P(Z|S=t)P(S=t)
      let sensingProb = evidenceConditionalProb * priorProb[i][j];
      tempProb[i][j] = sensingProb;
      sum += sensingProb;
    }
  }

  // Now we have the evidence conditional probabilities for every open square,
  // and we have the sum of all those probabilities.
  // What's left to do is get the posterior probabilities after sensing
  // Loop over these probabilities, for each, divide it by the sum.
  for (let i = 0; i < ROW; i++) {
    for (let j = 0; j < COL; j++) {
      if (isUnBlocked(grid, i, j)) {
        posteriorProb[i][j] = ((tempProb[i][j] / sum) * 100).toFixed(2);
      } else posteriorProb[i][j] = "####";
    }
  }

  return posteriorProb;
}

// ** Motion probability function
// This function takes in the prior probabilities of every open cell in the maze and the moving action
// for every cell. For example, E means the robot is moving east, N is north and so on.
function motion(grid, priorProb, movingActn) {
  let westTransitionProb = 0;
  let northTransitionProb = 0;
  let eastTransitionProb = 0;
  let southTransitionProb = 0;

  let posteriorMotionProbs = new Array(ROW);
  for (let i = 0; i < ROW; i++) posteriorMotionProbs[i] = new Array(COL);

  setInitialProbs(posteriorMotionProbs);

  // loop over the whole maze
  for (let i = 0; i < ROW; i++) {
    for (let j = 0; j < COL; j++) {
      // Make sure the square is unblocked
      if (isUnBlocked(grid, i, j)) {
        // Check the robot's moving action
        switch (movingActn) {
          case "W":
            // Check left, up, right and down squares to figure out the transition probability for it

            // * ----- WEST --------
            // Check if it's a valid cell
            if (isValid(i, j - 1)) {
              // If it's an obstacle, we can move left from the current square
              //  with 75% probability and bounce back
              if (!isUnBlocked(grid, i, j - 1))
                westTransitionProb = 0.75 * priorProb[i][j];
            }
            // not a valid west cell, so acts as an obstacle
            else westTransitionProb = 0.75 * priorProb[i][j];

            // * ------- NORTH ---------
            if (isValid(i - 1, j)) {
              if (isUnBlocked(grid, i - 1, j))
                // valid unblocked north cell, so we can move left from that cell with 15% probability
                // to the current cell
                northTransitionProb = 0.15 * priorProb[i - 1][j];
              // valid blocked cell, we can move right from the current cell with 10% probability and
              //  bounce back to current square
              else northTransitionProb = 0.1 * priorProb[i][j];
            }
            // Not a valid north cell, acts as an obstacle from the north
            else northTransitionProb = 0.1 * priorProb[i][j];

            // * ------- EAST -------
            if (isValid(i, j + 1)) {
              //  valid unblocked east cell, so we can move straight from that cell
              //  with 75% probability to the current cell
              if (isUnBlocked(grid, i, j + 1))
                eastTransitionProb = 0.75 * priorProb[i][j + 1];
            }

            // * -------- SOUTH -------
            if (isValid(i + 1, j)) {
              if (isUnBlocked(grid, i + 1, j))
                // Valid unblocked south cell, so we can move right with 10% probability from that cell
                // and reach the current cell
                southTransitionProb = 0.1 * priorProb[i + 1][j];
              // Valid blocked south cell, we can move left from the current cell with 15% probability
              // and bounce back
              else southTransitionProb = 0.15 * priorProb[i][j];
            }
            // Not a valid south cell, acts as an obstacle
            else southTransitionProb = 0.15 * priorProb[i][j];

            break;
          case "N":

          case "E":

          case "S":
        }

        posteriorMotionProbs[i][j] = (
          westTransitionProb +
          northTransitionProb +
          eastTransitionProb +
          southTransitionProb
        ).toFixed(2);
      }
      // blocked square, we don't calculate its probability
      else posteriorMotionProbs[i][j] = "####";
    }
  }
}

// This is the structure of the maze, 0 is open square. 1 is obstacle
// All out of bounds cells are obstacles too
const grid = [
  [0, 0, 0, 0, 0, 0, 0],
  [0, 1, 0, 1, 0, 1, 0],
  [0, 0, 0, 0, 0, 1, 0],
  [0, 0, 0, 1, 0, 0, 0],
  [0, 1, 0, 0, 0, 0, 0],
  [0, 1, 0, 1, 0, 1, 0],
  [0, 0, 0, 0, 0, 0, 0],
];

// Create the initial probabilities for the maze
let initialProbs = [
  [2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5],
  [2.5, -49, 2.5, -49, 2.5, -49, 2.5],
  [2.5, 2.5, 2.5, 2.5, 2.5, -49, 2.5],
  [2.5, 2.5, 2.5, -49, 2.5, 2.5, 2.5],
  [2.5, -49, 2.5, 2.5, 2.5, 2.5, 2.5],
  [2.5, -49, 2.5, -49, 2.5, -49, 2.5],
  [2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5],
];

// The robot is going to perform the following actions
let posteriorSensProbs = sensing(grid, initialProbs, [0, 1, 0, 0]);

printPosteriorProbs(posteriorSensProbs);
// let posteriorMotionProbs = motion(posteriorSensProbs, "E");
