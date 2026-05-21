# The Plan for the table formatter
1) Get entire file
2) Parse to entire table, based on curser location
3) split into comments, header, table, and footer. With line numbers to maintain data integrity. 
4) grab each table row and split into groups of data like so:
    a) 1, 2
    b) NESTED_VALS(3, 4, 5, {6, 7, 8})
    c) {10, 11, 12, 13}
    d) "initial row"
5) if there are nested groups, recursive call to split those as well.
6) once have split data, test shape of data to check if
    a) all rows have same number of groups
    b) all groups have same number of elements (if they are arrays)
    c) is 1d array
7) if all checks pass
8) unpack data into 2d array of strings.
9) calculate max width of each group, and make padding array
10) reconstruct table with padding and return formatted table.
11) format comments and header and footer.
12) combine all 
13) place formatted table back into file and return.

somewhere in there check curser location is between two newlines and only fix that section of table not the entire table.