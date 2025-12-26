import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  // Limpiar recursos globales si es necesario
  console.log('Tests completados, limpiando recursos...');
}

export default globalTeardown;