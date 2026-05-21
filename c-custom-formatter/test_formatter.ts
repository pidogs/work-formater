import IfFormatter from "./src/formatters/if";
import { ifTests } from "./test_cases/ifs";
import { arrayTests } from "./test_cases/arrays";

interface TestCase {
  name: string;
  input: string;
  cursorLine: number;
  expected: string;
}

const allTests: Record<string, TestCase[]> = {
  if: ifTests,
  array: arrayTests,
};

function runTest(test: TestCase, formatter: IfFormatter) {
  let input = test.input;
  let cursorLine = test.cursorLine;

  const lines = input.split(/\r?\n/);
  const markerLine = lines.findIndex((line) => line.includes("@"));

  if (markerLine !== -1) {
    cursorLine = markerLine;
    input = lines.map((line) => line.replace(/@/g, "")).join("\n");
  }

  console.log(`\n=== ${test.name} ===`);
  console.log("Input:");
  console.log(input);
  console.log(`\nCursor Line: ${cursorLine}`);

  const result = formatter.formatAtPosition(input, cursorLine);

  if (result) {
    console.log("\nOutput:");
    console.log(result.formattedText);
    console.log(`\nLines ${result.startLine} to ${result.endLine}`);

    if (test.expected) {
      console.log("\nExpected:");
      console.log(test.expected);
      console.log(
        "\nMatch:",
        result.formattedText === test.expected ? "✅ PASS" : "❌ FAIL"
      );
    }
  } else {
    console.log("\nNULL - no block found!");
  }
}

function main() {
  const args = process.argv.slice(2);
  const formatterType = args[0] || "if";
  const testArg = args[1]; // "all", number, or undefined
  const cursorOverride = args[2] ? parseInt(args[2]) : undefined;

  const tests = allTests[formatterType];
  if (!tests) {
    console.error(
      `Unknown formatter type: ${formatterType}. Available: ${Object.keys(allTests).join(", ")}`
    );
    process.exit(1);
  }

  const formatter = new IfFormatter();

  if (testArg === "all" || testArg === undefined) {
    console.log(`Running all ${formatterType} tests...`);
    tests.forEach((t) => {
      const test = cursorOverride !== undefined ? { ...t, cursorLine: cursorOverride } : t;
      runTest(test, formatter);
    });
  } else {
    const testIndex = parseInt(testArg);
    if (isNaN(testIndex) || testIndex < 0 || testIndex >= tests.length) {
      console.error(
        `Invalid test index: ${testArg}. Available: 0-${tests.length - 1}`
      );
      process.exit(1);
    }
    const test = cursorOverride !== undefined ? { ...tests[testIndex], cursorLine: cursorOverride } : tests[testIndex];
    runTest(test, formatter);
  }
}

main();
