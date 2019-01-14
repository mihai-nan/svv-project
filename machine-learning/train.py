from model import *
import torch
import random
from torch.autograd import Variable


lstm_input_size = 9
h1 = 32
num_train = 1
output_dim = 5
num_layers = 1
lr = 0.2
num_epochs = 10

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


def splitDataset(dataset):
    N = len(dataset)
    size = random.randint(1, N-1)
    sequence = dataset[:size]
    target = dataset[size]
    return sequence, target[3:8]


dataset = readFile('data/Stocks/a.us.txt')
sequence, target = splitDataset(dataset)
print(target, target)

train_dataset = []
for i in range(40):
    input, target = splitDataset(dataset)
    train_dataset.append((input, target))

test_dataset = []
for i in range(10):
    input, target = splitDataset(dataset)
    test_dataset.append((input, target))

model = LSTMModel(lstm_input_size, h1, batch_size=num_train, output_dim=output_dim, num_layers=num_layers)

loss_fn = torch.nn.MSELoss(size_average=False)
optimiser = torch.optim.Adam(model.parameters(), lr=lr)

for t in range(num_epochs):
    idx = 0
    for (sample, target) in train_dataset:
        # Clear stored gradient
        model.zero_grad()

        # Initialise hidden state
        # Don't do this if you want your LSTM to be stateful
        # model.hidden = model.init_hidden()


        X_train = Variable(torch.tensor([sample]))
        y_train = Variable(torch.tensor(target))

        # Forward pass
        y_pred = model(X_train)

        loss = loss_fn(y_pred, y_train)
        if t % 1 == 0 and idx % 5 == 0:
            print("Epoch ", t, "MSE: ", loss.item())
            print("Predict: ", y_pred, "Target: ", y_train)
        idx += 1

        # Zero out gradient, else they will accumulate between epochs
        optimiser.zero_grad()

        # Backward pass
        loss.backward()

        # Update parameters
        optimiser.step()

torch.save(model, 'models/lstm.pth')

