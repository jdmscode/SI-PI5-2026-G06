import { test, expect } from "@playwright/test";

const anatomyParts = [
  "Cabeça", "Pescoço", "Face", "Couro Cabeludo", "Orelha Direita", "Orelha Esquerda",
  "Tórax", "Abdômen", "Quadril", "Dorso Superior", "Dorso Inferior", "Região Lombar",
  "Ombro Direito", "Ombro Esquerdo", "Braço Direito", "Braço Esquerdo",
  "Cotovelo Direito", "Cotovelo Esquerdo", "Antebraço Direito", "Antebraço Esquerdo",
  "Mão Direita", "Mão Esquerda",
  "Coxa Direita", "Coxa Esquerda", "Joelho Direito", "Joelho Esquerdo",
  "Panturrilha Direita", "Panturrilha Esquerda", "Tornozelo Direito", "Tornozelo Esquerdo",
  "Pé Direito", "Pé Esquerdo",
];

test.describe("Mapeamento Anatômico - Seleção de Partes", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/mapping");
  });

  test("deve exibir view Lista ao alternar o toggle", async ({ page }) => {
    const toggle = page.getByRole("switch");
    await toggle.click();
    await expect(page.getByRole("button", { name: "Cabeça e Pescoço" })).toBeVisible();
  });

  test("deve selecionar cada parte e exibir Local correto", async ({ page }) => {
    const groupForPart: Record<string, string> = {
      Cabeça: "Cabeça e Pescoço", Pescoço: "Cabeça e Pescoço", Face: "Cabeça e Pescoço",
      "Couro Cabeludo": "Cabeça e Pescoço", "Orelha Direita": "Cabeça e Pescoço", "Orelha Esquerda": "Cabeça e Pescoço",
      Tórax: "Tronco", Abdômen: "Tronco", Quadril: "Tronco", "Dorso Superior": "Tronco", "Dorso Inferior": "Tronco", "Região Lombar": "Tronco",
      "Ombro Direito": "Membros Superiores", "Ombro Esquerdo": "Membros Superiores", "Braço Direito": "Membros Superiores", "Braço Esquerdo": "Membros Superiores",
      "Cotovelo Direito": "Membros Superiores", "Cotovelo Esquerdo": "Membros Superiores", "Antebraço Direito": "Membros Superiores", "Antebraço Esquerdo": "Membros Superiores",
      "Mão Direita": "Membros Superiores", "Mão Esquerda": "Membros Superiores",
      "Coxa Direita": "Membros Inferiores", "Coxa Esquerda": "Membros Inferiores", "Joelho Direito": "Membros Inferiores", "Joelho Esquerdo": "Membros Inferiores",
      "Panturrilha Direita": "Membros Inferiores", "Panturrilha Esquerda": "Membros Inferiores", "Tornozelo Direito": "Membros Inferiores", "Tornozelo Esquerdo": "Membros Inferiores",
      "Pé Direito": "Membros Inferiores", "Pé Esquerdo": "Membros Inferiores",
    };

    await page.getByRole("switch").click(); // Lista view

    for (const part of anatomyParts) {
      const group = groupForPart[part];
      const accordionBtn = page.getByRole("button", { name: group }).first();
      if ((await accordionBtn.getAttribute("aria-expanded")) !== "true") {
        await accordionBtn.click();
        await page.waitForTimeout(250);
      }
      const partBtn = page.getByRole("button", { name: part, exact: true }).first();
      await partBtn.scrollIntoViewIfNeeded();
      await partBtn.click();
      const localLabel = page.locator("p:has-text('Local:')").filter({ hasText: part });
      await expect(localLabel).toBeVisible({ timeout: 3000 });
    }
  });

  test("seleção Mão Direita deve mostrar Local: Mão Direita", async ({ page }) => {
    await page.getByRole("switch").click();
    await page.getByRole("button", { name: "Membros Superiores" }).first().click();
    await page.waitForTimeout(300);
    await page.getByRole("button", { name: "Mão Direita" }).first().click();
    await expect(page.getByText("Local: Mão Direita")).toBeVisible();
  });

  test("seleção Mão Esquerda deve mostrar Local: Mão Esquerda", async ({ page }) => {
    await page.getByRole("switch").click();
    await page.getByRole("button", { name: "Membros Superiores" }).first().click();
    await page.waitForTimeout(300);
    await page.getByRole("button", { name: "Mão Esquerda" }).first().click();
    await expect(page.getByText("Local: Mão Esquerda")).toBeVisible();
  });
});
