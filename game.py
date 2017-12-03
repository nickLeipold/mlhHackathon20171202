#!/usr/bin/python

import chess, sys, re


pattern = r"[a-hA-H][1-8][a-hA-H][1-8]"
if len(sys.argv[2]) == 4:
    tempStr = sys.argv[1] + " KQkq - 1 0"
    boardStr = sys.argv[1]
    board = chess.Board(tempStr)
    move = chess.Move.from_uci(sys.argv[2])
    code = 0

    if board.is_game_over():
        fen = board.fen()

        if "w" in fen:
            new = fen.split(" w ", 1)[0] + " w"
        else:
            new = fen.split(" b ", 1)[0] + " b"

        print(new)
        code = 3
        sys.exit(code)

    if move in board.legal_moves:

        board.push(move)
        if board.is_game_over():
            code = 3
            sys.exit(code)
        fen = board.fen()

        if "w" in fen:
            new = fen.split(" w ", 1)[0] + " w"
        else:
            new = fen.split(" b ", 1)[0] + " b"

        print(new)
        sys.exit(0)
    else:
        code = 4
        fen = board.fen()

        if "w" in fen:
            new = fen.split(" w ", 1)[0] + " w"
        else:
            new = fen.split(" b ", 1)[0] + " b"

        print(new)
        sys.exit(code)

print(sys.argv[1])
sys.exit(5)
