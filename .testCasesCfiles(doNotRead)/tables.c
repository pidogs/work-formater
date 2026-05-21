#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// Test 1: The "Vertical Abyss" (2D Integer Matrix)
int grid_data[15][10] = {
{1,2,3,4,5,6,7,8,9,10},
{ 11, 12,
13, 14, 15, 16, 17, 18, 19, 20},
{
21,22,23,24,25,26,27,28,29,30
},
{31,32,33,34,35,36,37,38,39,40},
{ 41,42,43,
44,45,46,47,48,49,50},
{51,52,53,54,55,56,57,58,59,60},
{ 61,62,
63,64,65,66,67,68,69,70},
{71,72,73,74,75,76,77,78,79,80},
{81,
82,83,84,85,86,87,88,89,90},
{91,92,93,94,95,96,97,98,99,100},
{101,102,103,104,105,
106,107,108,109,110},
{111,112,113,114,115,116,117,118,119,120},
{121,122,123,
124,125,126,127,128,129,130},
{131,132,133,134,135,136,137,138,139,140},
{141,142,143,144,145,146,147,148,149,150}
};

// Test 2: The "Struct Chaos" (Large Data Record Table)
struct SystemLog {
    int id;
    double value;
    char* tag;
    int status;
    int priority;
} logs[12] = {
{1,0.0012,"SYS_INIT",1,5},
{ 2,  -500.5, "TEMP_LOW",0,2  },
{3,
120.0,"VOLT_OK",1,1},
{4,0.0,"ERR_NULL",0,9},
{5, 99.99, "MEM_HIGH", 1, 3},
{6,-1.0,"DISK_FULL",0,5},
{7, 45.67,"NET_DOWN",0,10},
{8,12.34,"CPU_IDLE",1,1},
{9, 0.000001, "FAN_FAIL", 0, 8},
{10,33.3,"PWR_OK",1,2},
{11, -10.0, "AUTH_DENY",0,7},
{12,5.5,"WIFI_LOST",0,4}
};

// Test 3: The "Compressed Ribbon" (Single-Row 1D Array)
int sequence_data[50] = {1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50};

// Test 4: The "String Scramble" (Pointer Array)
const char* menu_options[15] = {
"START",
"OPTIONS",
"SETTINGS",
"AUDIO",
"VIDEO",
"CONTROLS",
"NETWORK",
"ACCOUNT",
"BACK",
"SAVE",
"LOAD",
"DELETE",
"EXIT",
"QUIT",
"RESTART"
};

// Test 5: The "Floating Point Disaster" (High Precision)
double precision_test[10] = {
0.0000000000001,
123456789.987654321,
-0.000000000000000004,
987654321.123456789,
0.123456789012345,
-987654321.987654321,
0.0,
1.11111111111111111111,
5.55555555555555555555,
-0.00000000000000000001
};

// Test 6: The "Staircase Indent" (2D Array)
int staircase[ 5 ][ 5 ] =
    {
    { 1,  2,  3,  4,  5  },
    { 6,  7,  8,  9,  10 },
    { 11, 12, 13, 14, 15 },
    { 16, 17, 18, 19, 20 },
    { 21, 22, 23, 24, 25 },
    };


int asdf456[ 5 ] =
    {
    { 1,  },
    { 6,  },
    { 11, },
    { 16, },
    { 21, },
    };

// Test 7: The "Extreme Whitespace" (Integer Array)
int massive_gap[10] = {
1,

2,

3,

4,

5,

6,

7,

8,

9,

10
};

// Test 8: The "Scattered Struct" (Deeply Messy)
struct PlayerStats { int hp; int mp; int lvl; float speed; };
 struct PlayerStats players[8] =
    {
    { 100, 50,  1, 5.5  },
    { 200, 100, 2, 6.0  },
    { 300, 150, 3, 7.5  },
    { 400, 200, 4, 8.5  },
    { 500, 250, 5, 9.5  },
    { 600, 300, 6, 10.5 },
    { 700, 350, 7, 11.5 },
    { 800, 400, 8, 12.5 },
    };

// Test 9: The "Comma-First" Nightmare
int comma_test[ 10 ] = {   1 , 2 , 3 , 4 , 5 , 6 , 7 , 8 , 9 , 10 };

// Test 10: The "3D Cube of Chaos" (Nested 3D Array)
int cube[3][3][3] = {
{
{1, 2, 3},
{4, 5, 6},
{7, 8, 9}
},
{
{10, 11, 12},
{13, 14, 15},
{16, 17, 18}
},
{
{19, 20, 21},
{22, 23, 24},
{25, 26, 27}
}
};

// Test 11: The "Wide Table" (Many Columns)
struct entry table[10] = {
    /* val1,    val2,      small_val, tiny_val, text,       flag,  choice */
    {100000001, -50000000, 290, 255, "First Initial Entry", true,  YES   },
    {200000002, -400000,   100, 10,  "Second Entry Here",   false, NO    },
    {300000003, -30000,    200, 20,  "Third Entry String",  true,  MAYBE },
    {400000004, -20000000,
         30000123, 30, "Fourth Entry Data", false, I_DONT_KNOW                 },
    {500000005, -100000,   40000123, 40, "Fifth Entry Test",  true,  CAN_YOU_REPEAT_THE_QUESTION },
    {600000006, 0,         50000123, 50, "Sixth entry",       false, YES                         },
    {700000007, 100000000, 60000123, 60, "Seventh entry",     true,  NO                          },
    {800000008, 2000000, 700, 70, "Eighth entry",      false, MAYBE                       },
    {900000009, 300,     800, 80, "Ninth entry",       true,  I_DONT_KNOW                 },
    {100000010, 40000,   900, 90, "Tenth entry final", false, CAN_YOU_REPEAT_THE_QUESTION }
    };

// Test 12: The "Mixed Types" (Various Data Types)
int mixed_array[8] = {
    42,
    -17,
    0,
    255,
    1024,
    -32768,
    65535,
    2147483647
};

// Test 13: The "Nested Nightmare" (Deeply Nested Arrays)
int nested[2][3][4] = {
    {
        {1, 2, 3, 4},
        {5, 6, 7, 8},
        {9, 10, 11, 12}
    },
    {
        {13, 14, 15, 16},
        {17, 18, 19, 20},
        {21, 22, 23, 24}
    }
};

// Test 14: The "Sparse Matrix" (Mostly Zeros)
int sparse[5][5] = {
    {0, 0, 0, 0, 0},
    {0, 1, 0, 0, 0},
    {0, 0, 0, 0, 0},
    {0, 0, 0, 1, 0},
    {0, 0, 0, 0, 0}
};

// Test 15: The "Character Array" (Char Initialization)
char hello[] = {'H', 'e', 'l', 'l', 'o', ' ', 'W', 'o', 'r', 'l', 'd', '\0'};

// Test 16: The "Hexadecimal Array" (Hex Values)
int hex_values[10] = {
    0x00000000,
    0x11111111,
    0x22222222,
    0x33333333,
    0x44444444,
    0x55555555,
    0x66666666,
    0x77777777,
    0x88888888,
    0xFFFFFFFF
};

// Test 17: The "Octal Array" (Octal Values)
int octal_values[8] = {
    00,
    01,
    02,
    03,
    04,
    05,
    06,
    07
};

// Test 18: The "Negative Numbers" (All Negative)
int negatives[10] = {
    -1, -2, -3, -4, -5,
    -6, -7, -8, -9, -10
};

// Test 19: The "Large Numbers" (Big Values)
long long big_numbers[5] = {
    9223372036854775807LL,
    -9223372036854775807LL,
    1234567890123456789LL,
    -1234567890123456789LL,
    0LL
};

// Test 20: The "Float Array" (Floating Point Values)
float float_array[10] = {
    1.0f, 2.5f, 3.14f, 4.0f, 5.5f,
    6.666f, 7.777f, 8.888f, 9.999f, 10.101f
};

// Test 21: The "Double Array" (Double Precision)
double double_array[8] = {
    1.1, 2.2, 3.3, 4.4,
    5.5, 6.6, 7.7, 8.8
};

// Test 22: The "Boolean Array" (Using stdbool.h)
#include <stdbool.h>
bool bool_array[6] = {
    true, false, true, false, true, false
};

// Test 23: The "Struct Array" (Complex Struct)
typedef struct {
    int x;
    int y;
    int width;
    int height;
    char name[32];
} Rectangle;

Rectangle rectangles[4] = {
    {0, 0, 100, 50, "First Rect"},
    {10, 20, 200, 100, "Second Rect"},
    {5, 5, 50, 50, "Third Rect"},
    {100, 100, 300, 200, "Fourth Rect"}
};

// Test 24: The "Enum Array" (Enumeration Values)
typedef enum {
    RED,
    GREEN,
    BLUE,
    YELLOW,
    CYAN,
    MAGENTA,
    WHITE,
    BLACK
} Color;

Color palette[8] = {
    RED, GREEN, BLUE, YELLOW,
    CYAN, MAGENTA, WHITE, BLACK
};

// Test 25: The "Function Pointer Array" (Advanced)
int add(int a, int b) { return a + b; }
int subtract(int a, int b) { return a - b; }
int multiply(int a, int b) { return a * b; }
int divide(int a, int b) { return b != 0 ? a / b : 0; }

int (*operations[4])(int, int) = {
    add,
    subtract,
    multiply,
    divide
};

int main() {
    printf("Test file with 25 different array initialization patterns\n");
    printf("This file is designed to test C code formatters\n");
    
    // Print some values to verify compilation
    printf("grid_data[0][0] = %d\n", grid_data[0][0]);
    printf("sequence_data[0] = %d\n", sequence_data[0]);
    printf("precision_test[0] = %e\n", precision_test[0]);
    printf("staircase[0][0] = %d\n", staircase[0][0]);
    printf("cube[0][0][0] = %d\n", cube[0][0][0]);
    
    return 0;
}



complex_struct_t test_table[] = {
{1, 2, NESTED_VALS(3, 4, 5, {6, 7, 8}), {10, 11, 12, 13}, "initial row"},
{100, 200, NESTED_VALS(300, 400, 500, {600, 700, 800}), {101, 102, 103, 104}, "row two"},
{0, 0, NESTED_VALS(0, 0, 0, {0, 0, 0}), {0, 0, 0, 0}, "the zero row"},
{42, 24, NESTED_VALS(1, 1, 1, {2, 2, 2}), {9, 8, 7, 6}, "meaning of life"},
{10, 20, NESTED_VALS(30, 40, 50, {60, 70, 80}), {90, 100, 110, 120}, "tens"},
{-1, -5, NESTED_VALS(-10, -20, -30, {-40, -50, -60}), {-1, -2, -3, -4}, "negatives"},
{999, 888, NESTED_VALS(777, 666, 555, {444, 333, 222}), {1, 1, 1, 1}, "countdown"},
{7, 14, NESTED_VALS(21, 28, 35, {42, 49, 56}), {7, 7, 7, 7}, "multiples of seven"},
{123, 456, NESTED_VALS(789, 101, 112, {131, 415, 161}), {1, 2, 3, 4}, "sequential-ish"},
{5, 5, NESTED_VALS(5, 5, 5, {5, 5, 5}), {5, 5, 5, 5}, "just fives"},
{1, 0, NESTED_VALS(1, 0, 1, {0, 1, 0}), {1, 1, 0, 0}, "binary style"},
{9, 9, NESTED_VALS(8, 8, 7, {7, 6, 6}), {5, 4, 3, 2}, "descending values"},
{11, 22, NESTED_VALS(33, 44, 55, {66, 77, 88}), {99, 11, 22, 33}, "double digits"},
{101, 202, NESTED_VALS(303, 404, 505, {606, 707, 808}), {909, 101, 111, 121}, "palindromes"},
{13, 17, NESTED_VALS(19, 23, 29, {31, 37, 41}), {43, 47, 53, 59}, "prime numbers"},
{2, 4, NESTED_VALS(8, 16, 32, {64, 128, 256}), {512, 1024, 2048, 4096}, "powers of two"},
{6, 12, NESTED_VALS(18, 24, 30, {36, 42, 48}), {54, 60, 66, 72}, "sixes"},
{1000, 2000, NESTED_VALS(3000, 4000, 5000, {6000, 7000, 8000}), {1, 2, 3, 4}, "thousands"},
{111, 222, NESTED_VALS(333, 444, 555, {666, 777, 888}), {999, 0, 0, 0}, "triple digits"},
{99, 98, NESTED_VALS(97, 96, 95, {94, 93, 92}), {91, 90, 89, 88}, "near hundred"},
{1, 2, NESTED_VALS(1, 2, 3, {4, 5, 6}), {7, 8, 9, 10}, "final row of the test table"}
};