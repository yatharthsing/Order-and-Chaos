# Order and Chaos

A web-based implementation of the classic Order and Chaos board game with a single-player mode against a custom AI opponent.

## Live Demo
https://order-and-chaos.vercel.app

## GitHub
https://github.com/yatharthsing/Order-and-Chaos

## How to Play
- **Order** wins by getting 5 pieces in a row (X or O) in any direction
- **Chaos** wins by filling the board without allowing 5 in a row
- Both players can place either X or O on their turn

## Game Modes
- Human vs Human
- Play as Order vs AI Chaos
- Play as Chaos vs AI Order

## AI Implementation
The AI uses **Minimax** with **Alpha-Beta Pruning** to search ahead and pick the best move.

- The heuristic function scores board states by counting threats (sequences of 2, 3, 4 in a row)
- Alpha-Beta Pruning cuts branches that can't affect the result, making the search fast enough to run in the browser
- The AI only considers moves adjacent to existing pieces, further reducing the search space

## Tech Stack
- React + Vite
- Tailwind CSS
- Deployed on Vercel