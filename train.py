import torch
import torchvision
from torchvision import datasets, transforms
from torch import nn, optim
from tqdm import tqdm 
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

transform = transforms.Compose([
    transforms.Resize((300, 300)),
    transforms.RandomHorizontalFlip(),
    transforms.RandomRotation(10),
    transforms.ToTensor()
])

#matriz de confusão pra analisar o desempenho do modelo

train_data = datasets.ImageFolder("melanoma_cancer_dataset/train", transform=transform)
train_loader = torch.utils.data.DataLoader(train_data, batch_size=32, shuffle=True)

model = torchvision.models.efficientnet_b3(weights="DEFAULT")
model.classifier[1] = nn.Linear(model.classifier[1].in_features, 2)

model.to(device)

criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=0.0003)

for epoch in range(5):
    model.train()
    total_loss = 0

    loop = tqdm(train_loader, desc=f"Epoch {epoch+1}")

    for images, labels in loop:
        images, labels = images.to(device), labels.to(device)

        outputs = model(images)
        loss = criterion(outputs, labels)

        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

        total_loss += loss.item()

        loop.set_postfix(loss=loss.item())
    print(f"Epoch {epoch+1} concluída | Loss total: {total_loss:.4f}")

torch.save(model.state_dict(), "model.pth")
print("Modelo salvo!")