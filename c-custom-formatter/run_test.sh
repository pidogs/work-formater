#!/usr/bin/env bash

# Usage: ./run_test.sh [formatter_type] [test_number] [cursor_line]
# Example: ./run_test.sh if all
# Example: ./run_test.sh if 0
# Example: ./run_test.sh if 0 1

cd "$(dirname "$0")"

if [ -z "$1" ]; then
  echo "Usage: $0 [formatter_type] [test_number] [cursor_line]"
  echo "  formatter_type: if, array (default: if)"
  echo "  test_number: all, 0, 1, 2... (default: all)"
  echo "  cursor_line: line number (optional)"
  exit 1
fi

FORMATTER_TYPE="${1:-if}"
TEST_NUMBER="${2:-all}"
CURSOR_LINE="${3:-}"

CMD="npx ts-node test_formatter.ts $FORMATTER_TYPE $TEST_NUMBER"
if [ -n "$CURSOR_LINE" ]; then
  CMD="$CMD $CURSOR_LINE"
fi

echo "Running: $CMD"
eval $CMD
