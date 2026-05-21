export interface TestCase {
  name: string;
  input: string;
  expected: string;
}

const rawTests: { name: string; input: string; expected: string }[] = [
  {
    name: "Single condition",
    input: 
`if(a){@
  print(a);
}`,
    expected: 
`if ( a )
    {
    print(a);
    }`,
  },
  {
    name: "Two conditions",
    input:
`if(a && b){@
  print(a);
}`,
    expected: 
`if ( a
  && b )
  {
    print(a);
  }`,
  },
  {
    name: "Three conditions",
    input: 
`if(a && b && c){@
  print(a);
}`,
    expected: 
`if ( a
  && b
  && c )
  {
    print(a);
  }`,
  },
];

export const ifTests: TestCase[] = rawTests.flatMap((t) => [
  {
    name: `${t.name} (cursor on if)`,
    input: t.input,
    expected: t.expected,
  },
  {
    name: `${t.name} (cursor on body)`,
    input: t.input,
    expected: t.expected,
  },
  {
    name: `${t.name} (cursor on closing brace)`,
    input: t.input,
    expected: t.expected,
  },
]);
