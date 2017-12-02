#!/usr/bin/python

import chess, sys, re

boardStr = sys.argv[1] + " KQkq - 1 0"
board = chess.Board(boardStr)
move = chess.Move.from_uci(sys.argv[2])
code = 0

if board.is_game_over():
	print("game is already over")
	code = 2
	sys.exit(code)

if move in board.legal_moves:
	
	board.push(move)
	if board.is_game_over():
		code = 2
	fen = board.fen()
	print(fen)
	sys.exit(0)
else:
	code = -1
	print("Illegal move")
	sys.exit(code)

