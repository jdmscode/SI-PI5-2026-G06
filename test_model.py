import os
import torch
import torchvision
from torchvision import transforms
from torch import nn
from PIL import Image

# escolhe se vai usar gpu ou cpu
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# recria a mesma arquitetura usada no treino
model = torchvision.models.efficientnet_b3(weights="DEFAULT")
model.classifier[1] = nn.Linear(model.classifier[1].in_features, 2)

# carrega os pesos treinados no modelo
model.load_state_dict(torch.load("model.pth", map_location=device))
model.to(device)

# coloca o modelo em modo de avaliação
model.eval()

# define as transformações usadas na inferência
transform = transforms.Compose([
    transforms.Resize((300, 300)),
    transforms.ToTensor()
])

# define as pastas com as imagens de teste e seus rótulos reais
pastas_teste = {
    "benigno": "imagens_teste/benigno",
    "maligno": "imagens_teste/maligno"
}

# define o mapeamento entre índice previsto e nome da classe
idx_para_classe = {
    0: "benigno",
    1: "maligno"
}

# quantidade de imagens por classe
MAX_IMAGENS = 500


# inicializa contadores gerais
total_imagens = 0
total_acertos = 0

# inicializa contadores por classe
estatisticas_por_classe = {
    "benigno": {"total": 0, "acertos": 0},
    "maligno": {"total": 0, "acertos": 0}
}

# percorre cada pasta de teste
for classe_real, caminho_pasta in pastas_teste.items():
    arquivos = sorted(os.listdir(caminho_pasta))[:MAX_IMAGENS]

    for nome_arquivo in arquivos:
        caminho_imagem = os.path.join(caminho_pasta, nome_arquivo)

        # abre a imagem e garante que ela esteja em rgb
        imagem = Image.open(caminho_imagem).convert("RGB")

        # aplica as transformações e adiciona dimensão de batch
        imagem_tensor = transform(imagem).unsqueeze(0).to(device)

        # roda a inferência sem calcular gradientes
        with torch.no_grad():
            saida = model(imagem_tensor)
            indice_previsto = torch.argmax(saida, dim=1).item()

        # converte o índice previsto para o nome da classe
        classe_prevista = idx_para_classe[indice_previsto]

        # atualiza contadores gerais
        total_imagens += 1
        estatisticas_por_classe[classe_real]["total"] += 1

        # atualiza contadores de acerto
        if classe_prevista == classe_real:
            total_acertos += 1
            estatisticas_por_classe[classe_real]["acertos"] += 1

        # mostra o resultado individual de cada imagem
        print(f"Imagem: {nome_arquivo} | Real: {classe_real} | Previsto: {classe_prevista}")

# mostra métricas gerais
if total_imagens > 0:
    acuracia_geral = total_acertos / total_imagens * 100

    print(f"\nTotal de imagens: {total_imagens}")
    print(f"Total de acertos: {total_acertos}")
    print(f"Acurácia geral: {acuracia_geral:.2f}%")

    print("\nAcurácia por classe:")
    for classe, stats in estatisticas_por_classe.items():
        if stats["total"] > 0:
            acuracia_classe = stats["acertos"] / stats["total"] * 100
            print(f"{classe}: {stats['acertos']}/{stats['total']} | {acuracia_classe:.2f}%")
        else:
            print(f"{classe}: nenhuma imagem testada")
else:
    print("Nenhuma imagem válida foi encontrada nas pastas de teste.")