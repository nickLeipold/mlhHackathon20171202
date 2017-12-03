#!/usr/bin/python

import chess, sys, re


pattern = r"[a-hA-H][1-8][a-hA-H][1-8]"
if len(sys.argv[2]) == 4:
    boardStr = sys.argv[1] + " KQkq - 1 0"
    board = chess.Board(boardStr)
    move = chess.Move.from_uci(sys.argv[2])
    code = 0

    if board.is_game_over():
        fen = board.fen()
        print(fen)
    	code = 2
    	sys.exit(code)

    if move in board.legal_moves:

    	board.push(move)
    	if board.is_game_over():
    		code = 3
    	fen = board.fen()
    	print(fen)
    	sys.exit(0)
    else:
    	code = -1
        fen = board.fen()
        print(fen)
    	sys.exit(code)

# print(sys.argv[2])
sys.exit(-1)
