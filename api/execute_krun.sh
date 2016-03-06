#! /bin/bash

set -euf -o pipefail

FILE="$1"
CINIT="$2"

cd ./k/alk

../k/bin/krun "$FILE" -cINIT="$CINIT"
