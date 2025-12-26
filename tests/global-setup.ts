import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  // Configurar el navegador para MSW
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Navegar a la página principal para inicializar MSW
  await page.goto('http://localhost:3001');
  
  // Esperar a que MSW se inicialice
  await page.waitForFunction(() => {
    return window.navigator.serviceWorker?.ready;
  }, { timeout: 10000 }).catch(() => {
    // Si no hay service worker, continuar sin él
    console.log('Service worker no disponible, continuando sin MSW en el navegador');
  });
  
  await browser.close();
}

export default globalSetup;