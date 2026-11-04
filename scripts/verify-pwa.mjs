import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const erros = []

for (const arquivo of [
  'public/icons/icon-192.png',
  'public/icons/icon-512.png',
  'public/icons/apple-touch-icon.png',
  'public/icons/icon.svg',
]) {
  if (!existsSync(join(root, arquivo))) erros.push(`Falta ${arquivo}`)
}

const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
if (!pkg.devDependencies?.['vite-plugin-pwa']) erros.push('vite-plugin-pwa não está em package.json')

const vite = readFileSync(join(root, 'vite.config.ts'), 'utf8')
if (!vite.includes('VitePWA')) erros.push('VitePWA não configurado em vite.config.ts')
if (!vite.includes('start_url: "/aluno/inicio"')) erros.push('manifest sem start_url da área do aluno')

const html = readFileSync(join(root, 'index.html'), 'utf8')
if (!html.includes('apple-mobile-web-app-capable')) erros.push('index.html sem meta Apple PWA')

for (const arquivo of [
  'src/shared/components/PwaInstallPrompt.tsx',
  'src/shared/components/PwaRuntime.tsx',
  'src/shared/components/OfflineBanner.tsx',
  'src/shared/lib/offlineCache.ts',
]) {
  if (!existsSync(join(root, arquivo))) erros.push(`Falta ${arquivo}`)
}

if (erros.length) {
  console.error('PWA verificação falhou:')
  for (const erro of erros) console.error(`- ${erro}`)
  process.exit(1)
}

console.log('PWA verificação ok (manifest, ícones, prompt e cache offline).')
console.log('Android: Chrome → Instalar app (ou o banner na área do aluno).')
console.log('iOS: Safari → Compartilhar → Adicionar à Tela de Início.')
