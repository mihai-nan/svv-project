
def readFile(filename):
    fin = open(filename, 'r')
    line = fin.readline()
    columns = line.split(',')
    print(columns)
    dataset = []
    while line:
        line = fin.readline()
        tokens = line.split(',')
        date = tokens[0]
        components = date.split('-')
        if len(components) != 3:
            continue
        values = list(map(int, date.split('-')))
        values += list(map(float, tokens[1:]))
        dataset.append(values)
        print(values)
    return dataset


dataset = readFile('data/Stocks/a.us.txt')
