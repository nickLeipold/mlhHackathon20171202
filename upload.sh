#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
SERVER=webaccess@orion.hugo-klepsch.tech

echo $DIR

rsync -avz --exclude=/mlhHackathon20171202/.git/ $DIR $SERVER:/home/webaccess



