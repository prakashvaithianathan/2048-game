import { useEffect, useState } from "react";

function App() {
  const [tiles, setTiles] = useState([
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ]);
  const [score, setScore] = useState(0);
  const [history, setHistory] = useState([]);
  const [gameOver, setGameOver] = useState(false);

  const colorObj = {
    2: "#eee4da",
    4: "#ede0c8",
    8: "#f2b179",
    16: "#f59563",
    32: "#f67c5f",
    64: "#f65e3b",
    128: "#edcf72",
    256: "#edcc61",
    512: "#edc850",
    1024: "#edc53f",
    2048: "#edc22e",
  };

  // Spawn two tiles initially
  useEffect(() => {
    const initial = addRandomTiles(tiles, 2);
    setTiles(initial);
  }, []);

  const addRandomTiles = (grid, count = 1) => {
    const newGrid = grid.map((row) => [...row]);
    const emptyCells = [];

    for (let i = 0; i < 4; i++)
      for (let j = 0; j < 4; j++)
        if (newGrid[i][j] === 0) emptyCells.push([i, j]);

    for (let k = 0; k < count && emptyCells.length > 0; k++) {
      const randomIndex = Math.floor(Math.random() * emptyCells.length);
      const [r, c] = emptyCells.splice(randomIndex, 1)[0];
      newGrid[r][c] = Math.random() < 0.9 ? 2 : 4;
    }
    return newGrid;
  };

  const checkGameOver = (grid) => {
    // Check if there are empty cells
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (grid[i][j] === 0) return false;
      }
    }

    // Check if any adjacent cells can merge
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const current = grid[i][j];
        if (j < 3 && current === grid[i][j + 1]) return false;
        if (i < 3 && current === grid[i + 1][j]) return false;
      }
    }

    return true;
  };

  // Fixed merge function that prevents double-merging
  const mergeLine = (line) => {
    // Remove zeros
    const filtered = line.filter((v) => v !== 0);
    const merged = [];
    let scoreGained = 0;
    let i = 0;

    while (i < filtered.length) {
      if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
        // Merge the two tiles
        const mergedValue = filtered[i] * 2;
        merged.push(mergedValue);
        scoreGained += mergedValue;
        i += 2; // Skip the next tile since we merged it
      } else {
        merged.push(filtered[i]);
        i++;
      }
    }

    // Fill the rest with zeros
    while (merged.length < 4) {
      merged.push(0);
    }

    return { line: merged, score: scoreGained };
  };

  const move = (direction) => {
    if (gameOver) return;

    let newTiles = tiles.map((row) => [...row]);
    let moveScore = 0;

    if (direction === "up") {
      for (let col = 0; col < 4; col++) {
        const column = [];
        for (let row = 0; row < 4; row++) column.push(newTiles[row][col]);
        const { line: merged, score } = mergeLine(column);
        moveScore += score;
        for (let row = 0; row < 4; row++)
          newTiles[row][col] = merged[row];
      }
    } else if (direction === "down") {
      for (let col = 0; col < 4; col++) {
        const column = [];
        for (let row = 3; row >= 0; row--) column.push(newTiles[row][col]);
        const { line: merged, score } = mergeLine(column);
        moveScore += score;
        for (let row = 3, i = 0; row >= 0; row--, i++)
          newTiles[row][col] = merged[i];
      }
    } else if (direction === "left") {
      for (let row = 0; row < 4; row++) {
        const { line: merged, score } = mergeLine(newTiles[row]);
        moveScore += score;
        newTiles[row] = merged;
      }
    } else if (direction === "right") {
      for (let row = 0; row < 4; row++) {
        const reversed = [...newTiles[row]].reverse();
        const { line: merged, score } = mergeLine(reversed);
        moveScore += score;
        newTiles[row] = merged.reverse();
      }
    }

    // Only update if board changed
    if (JSON.stringify(newTiles) !== JSON.stringify(tiles)) {
      // Save current state to history
      setHistory((prev) => [...prev, { tiles, score }]);
      
      const withNewTile = addRandomTiles(newTiles, 1);
      setTiles(withNewTile);
      setScore((prev) => prev + moveScore);

      // Check for game over
      if (checkGameOver(withNewTile)) {
        setGameOver(true);
      }
    }
  };

  const undo = () => {
    if (history.length === 0) return;
    
    const lastState = history[history.length - 1];
    setTiles(lastState.tiles);
    setScore(lastState.score);
    setHistory((prev) => prev.slice(0, -1));
    setGameOver(false);
  };

  const restart = () => {
    const initial = addRandomTiles(
      [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
      2
    );
    setTiles(initial);
    setScore(0);
    setHistory([]);
    setGameOver(false);
  };

  // Handle arrow key press
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
        event.preventDefault();
      }
      
      switch (event.key) {
        case "ArrowUp":
          move("up");
          break;
        case "ArrowDown":
          move("down");
          break;
        case "ArrowLeft":
          move("left");
          break;
        case "ArrowRight":
          move("right");
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [tiles, gameOver]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 p-4">
      <div className="flex items-center justify-between w-full max-w-md mb-4">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">2048</h1>
          <p className="text-slate-300 text-sm">Use arrow keys to play</p>
        </div>
        <div className="text-right">
          <div className="text-white text-sm mb-1">SCORE</div>
          <div className="text-3xl font-bold text-yellow-400">{score}</div>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={restart}
          className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
        >
          New Game
        </button>
        <button
          onClick={undo}
          disabled={history.length === 0}
          className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
        >
          Undo
        </button>
      </div>

      {gameOver && (
        <div className="mb-4 px-6 py-3 bg-red-500 text-white font-bold rounded-lg">
          Game Over! No more moves available.
        </div>
      )}

      <div className="grid grid-cols-4 gap-3 p-4 bg-slate-700 rounded-2xl shadow-2xl">
        {tiles.map((row, i) =>
          row.map((value, j) => (
            <div
              key={`${i}-${j}`}
              className="w-20 h-20 rounded-lg flex items-center justify-center text-2xl font-bold transition-all duration-100"
              style={{
                backgroundColor: value ? colorObj[value] || "#3c3a32" : "#cdc1b4",
                color: value > 4 ? "#f9f6f2" : "#776e65",
                fontSize: value >= 1000 ? "1.25rem" : "1.5rem",
              }}
            >
              {value !== 0 ? value : ""}
            </div>
          ))
        )}
      </div>

      <div className="mt-6 text-slate-400 text-sm text-center max-w-md">
        <p className="mt-2">Press arrow keys to move tiles. When two tiles with the same number touch, they merge into one!</p>
      </div>
    </div>
  );
}

export default App;