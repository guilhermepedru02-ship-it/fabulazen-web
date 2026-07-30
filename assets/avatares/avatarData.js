/**
 * avatarData.js — Fabula-Zen
 *
 * CONTRATO DE AVATAR
 * ──────────────────
 * Para trocar todos os avatares (novo estilo, 3D, ilustração externa, etc.),
 * basta substituir este arquivo. O AvatarSystem.js não precisa ser tocado.
 *
 * Cada avatar deve ter EXATAMENTE estas propriedades:
 *
 *   id       {string}  — identificador único, nunca mude após lançar
 *                        (fica salvo no localStorage do usuário)
 *   nome     {string}  — nome exibido embaixo do avatar
 *   render   {string}  — um dos três formatos abaixo:
 *                        'svg'   → campo svg com string SVG inline
 *                        'img'   → campo src com caminho para imagem
 *                        'url'   → campo src com URL externa
 *
 * EXEMPLOS DE MIGRAÇÃO:
 *
 *   Trocar para PNGs/WEBPs gerados por IA:
 *     { id: 'maya', nome: 'Maya', render: 'img', src: 'assets/avatares/maya.webp' }
 *
 *   Trocar para modelos 3D renderizados:
 *     { id: 'maya', nome: 'Maya', render: 'img', src: 'assets/avatares/3d/maya.png' }
 *
 *   Trocar para sprites de uma spritesheet:
 *     { id: 'maya', nome: 'Maya', render: 'sprite', sheet: 'assets/avatares/sheet.png', x: 0, y: 0, w: 120, h: 140 }
 *
 *   Manter os SVGs atuais enquanto testa novos em paralelo:
 *     Adicione um campo `draft: true` nos novos — o sistema pode filtrá-los
 *
 * REGRA DE OURO:
 *   Nunca remova um id que já foi ao ar. Se um avatar for aposentado,
 *   marque com `aposentado: true`. O sistema usa o primeiro avatar ativo
 *   como fallback para usuários que tinham o avatar aposentado.
 */

const AVATARES = [
  // ── COMUNS ───────────────────────────────────────────────────────────────
  {
    id: 'maya',
    nome: 'Maya',
    render: 'img',
    src: 'assets/avatares/avatar Maya.webp',
    raridade: 'comum',
    unlock: { tipo: 'padrao' },
    nivelMinimo: 1
  },
  // ── RAROS ────────────────────────────────────────────────────────────────
  {
    id: 'saci',
    nome: 'Saci',
    render: 'img',
    src: 'assets/avatares/avatar Saci.webp',
    raridade: 'raro',
    // Nível 5 + 2 livros de folclore
    unlock: {
      tipo: 'hibrido',
      condicoes: [
        { tipo: 'nivel', nivel: 5 },
        { tipo: 'folclore', livros: 2 }
      ]
    },
    nivelMinimo: 5
  },
  {
    id: 'luna',
    nome: 'Luna',
    render: 'svg',
    raridade: 'comum',
    unlock: { tipo: 'nivel', nivel: 2 },
    nivelMinimo: 2,
    svg: `<svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="60" cy="130" rx="38" ry="12" fill="#C8B0E8" opacity="0.5"/>
      <rect x="32" y="90" width="56" height="48" rx="16" fill="#9B6BC8"/>
      <rect x="18" y="92" width="18" height="38" rx="9" fill="#9B6BC8"/>
      <rect x="84" y="92" width="18" height="38" rx="9" fill="#9B6BC8"/>
      <circle cx="60" cy="66" r="36" fill="#FFE0C8"/>
      <ellipse cx="60" cy="36" rx="36" ry="18" fill="#2C1810"/>
      <rect x="24" y="34" width="72" height="24" rx="8" fill="#2C1810"/>
      <ellipse cx="28" cy="60" rx="11" ry="24" fill="#2C1810"/>
      <ellipse cx="92" cy="60" rx="11" ry="24" fill="#2C1810"/>
      <circle cx="46" cy="66" r="7" fill="white"/>
      <circle cx="74" cy="66" r="7" fill="white"/>
      <circle cx="47" cy="67" r="4" fill="#6B3080"/>
      <circle cx="75" cy="67" r="4" fill="#6B3080"/>
      <circle cx="48" cy="65" r="1.5" fill="white"/>
      <circle cx="76" cy="65" r="1.5" fill="white"/>
      <ellipse cx="60" cy="80" rx="3" ry="2.5" fill="#E8A87C"/>
      <path d="M50 90 Q60 100 70 90" stroke="#C0725A" stroke-width="2" fill="none" stroke-linecap="round"/>
      <ellipse cx="36" cy="78" rx="7" ry="5" fill="#E0A0C0" opacity="0.6"/>
      <ellipse cx="84" cy="78" rx="7" ry="5" fill="#E0A0C0" opacity="0.6"/>
    </svg>`
  },
  {
    id: 'davi',
    nome: 'Davi',
    render: 'svg',
    raridade: 'comum',
    // Nível 2 + 3 quizzes
    unlock: {
      tipo: 'hibrido',
      condicoes: [
        { tipo: 'nivel', nivel: 2 },
        { tipo: 'quizzes', quantidade: 3 }
      ]
    },
    nivelMinimo: 2,
    svg: `<svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="60" cy="130" rx="38" ry="12" fill="#A0C8F0" opacity="0.5"/>
      <rect x="32" y="90" width="56" height="48" rx="16" fill="#4A90D9"/>
      <rect x="18" y="92" width="18" height="38" rx="9" fill="#4A90D9"/>
      <rect x="84" y="92" width="18" height="38" rx="9" fill="#4A90D9"/>
      <circle cx="60" cy="66" r="36" fill="#FDDBB4"/>
      <ellipse cx="60" cy="36" rx="32" ry="14" fill="#8B4513"/>
      <rect x="28" y="33" width="64" height="20" rx="6" fill="#8B4513"/>
      <ellipse cx="32" cy="52" rx="9" ry="18" fill="#8B4513"/>
      <ellipse cx="88" cy="52" rx="9" ry="18" fill="#8B4513"/>
      <circle cx="46" cy="66" r="7" fill="white"/>
      <circle cx="74" cy="66" r="7" fill="white"/>
      <circle cx="47" cy="67" r="4" fill="#2C1810"/>
      <circle cx="75" cy="67" r="4" fill="#2C1810"/>
      <circle cx="48" cy="65" r="1.5" fill="white"/>
      <circle cx="76" cy="65" r="1.5" fill="white"/>
      <ellipse cx="60" cy="80" rx="3" ry="2.5" fill="#E8A87C"/>
      <path d="M50 90 Q60 98 70 90" stroke="#C0725A" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <ellipse cx="36" cy="78" rx="7" ry="5" fill="#F4A0A0" opacity="0.5"/>
      <ellipse cx="84" cy="78" rx="7" ry="5" fill="#F4A0A0" opacity="0.5"/>
    </svg>`
  },
  {
    id: 'bia',
    nome: 'Bia',
    render: 'svg',
    raridade: 'comum',
    // Nível 2 + 5 livros
    unlock: {
      tipo: 'hibrido',
      condicoes: [
        { tipo: 'nivel', nivel: 2 },
        { tipo: 'livros', quantidade: 5 }
      ]
    },
    nivelMinimo: 2,
    svg: `<svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="60" cy="130" rx="38" ry="12" fill="#F0C8D0" opacity="0.5"/>
      <rect x="32" y="90" width="56" height="48" rx="16" fill="#E8607A"/>
      <rect x="18" y="92" width="18" height="38" rx="9" fill="#E8607A"/>
      <rect x="84" y="92" width="18" height="38" rx="9" fill="#E8607A"/>
      <circle cx="60" cy="66" r="36" fill="#FFE0C8"/>
      <ellipse cx="60" cy="34" rx="36" ry="18" fill="#D4880A"/>
      <rect x="24" y="32" width="72" height="26" rx="8" fill="#D4880A"/>
      <ellipse cx="26" cy="58" rx="12" ry="26" fill="#D4880A"/>
      <ellipse cx="94" cy="58" rx="12" ry="26" fill="#D4880A"/>
      <circle cx="46" cy="66" r="7" fill="white"/>
      <circle cx="74" cy="66" r="7" fill="white"/>
      <circle cx="47" cy="67" r="4" fill="#3D2B1F"/>
      <circle cx="75" cy="67" r="4" fill="#3D2B1F"/>
      <circle cx="48" cy="65" r="1.5" fill="white"/>
      <circle cx="76" cy="65" r="1.5" fill="white"/>
      <ellipse cx="60" cy="80" rx="3" ry="2.5" fill="#E8A060"/>
      <path d="M50 90 Q60 100 70 90" stroke="#C0725A" stroke-width="2" fill="none" stroke-linecap="round"/>
      <ellipse cx="36" cy="78" rx="8" ry="6" fill="#F4A0A0" opacity="0.65"/>
      <ellipse cx="84" cy="78" rx="8" ry="6" fill="#F4A0A0" opacity="0.65"/>
    </svg>`
  },
  {
    id: 'kaua',
    nome: 'Kauã',
    render: 'svg',
    aposentado: true,
    unlock: { tipo: 'conquista', conquistaId: 'heroi_folclore' },
    nivelMinimo: 3,
    svg: `<svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="60" cy="130" rx="38" ry="12" fill="#A8D8B0" opacity="0.5"/>
      <rect x="32" y="90" width="56" height="48" rx="16" fill="#2E7D50"/>
      <rect x="18" y="92" width="18" height="38" rx="9" fill="#2E7D50"/>
      <rect x="84" y="92" width="18" height="38" rx="9" fill="#2E7D50"/>
      <circle cx="60" cy="66" r="36" fill="#C68642"/>
      <ellipse cx="60" cy="34" rx="30" ry="12" fill="#1A0A00"/>
      <rect x="30" y="30" width="60" height="18" rx="6" fill="#1A0A00"/>
      <ellipse cx="34" cy="50" rx="10" ry="20" fill="#1A0A00"/>
      <ellipse cx="86" cy="50" rx="10" ry="20" fill="#1A0A00"/>
      <circle cx="46" cy="66" r="7" fill="white"/>
      <circle cx="74" cy="66" r="7" fill="white"/>
      <circle cx="47" cy="67" r="4" fill="#1A0A00"/>
      <circle cx="75" cy="67" r="4" fill="#1A0A00"/>
      <circle cx="48" cy="65" r="1.5" fill="white"/>
      <circle cx="76" cy="65" r="1.5" fill="white"/>
      <ellipse cx="60" cy="80" rx="3.5" ry="3" fill="#A0622A"/>
      <path d="M50 90 Q60 98 70 90" stroke="#8B4513" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <ellipse cx="36" cy="78" rx="7" ry="5" fill="#C08040" opacity="0.5"/>
      <ellipse cx="84" cy="78" rx="7" ry="5" fill="#C08040" opacity="0.5"/>
    </svg>`
  },
  {
    id: 'isis',
    nome: 'Isis',
    render: 'svg',
    aposentado: true,
    unlock: { tipo: 'livros', quantidade: 10 },
    nivelMinimo: 3,
    svg: `<svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="60" cy="130" rx="38" ry="12" fill="#F5D0A0" opacity="0.5"/>
      <rect x="32" y="90" width="56" height="48" rx="16" fill="#D4870A"/>
      <rect x="18" y="92" width="18" height="38" rx="9" fill="#D4870A"/>
      <rect x="84" y="92" width="18" height="38" rx="9" fill="#D4870A"/>
      <circle cx="60" cy="66" r="36" fill="#8D5524"/>
      <ellipse cx="60" cy="32" rx="36" ry="16" fill="#1A0800"/>
      <rect x="24" y="28" width="72" height="26" rx="6" fill="#1A0800"/>
      <ellipse cx="22" cy="62" rx="14" ry="30" fill="#1A0800"/>
      <ellipse cx="98" cy="62" rx="14" ry="30" fill="#1A0800"/>
      <circle cx="46" cy="65" r="7" fill="white"/>
      <circle cx="74" cy="65" r="7" fill="white"/>
      <circle cx="47" cy="66" r="4" fill="#1A0800"/>
      <circle cx="75" cy="66" r="4" fill="#1A0800"/>
      <circle cx="48" cy="64" r="1.5" fill="white"/>
      <circle cx="76" cy="64" r="1.5" fill="white"/>
      <ellipse cx="60" cy="79" rx="3.5" ry="3" fill="#6B3A1F"/>
      <path d="M50 89 Q60 99 70 89" stroke="#6B3A1F" stroke-width="2" fill="none" stroke-linecap="round"/>
      <ellipse cx="36" cy="77" rx="8" ry="6" fill="#C07040" opacity="0.45"/>
      <ellipse cx="84" cy="77" rx="8" ry="6" fill="#C07040" opacity="0.45"/>
    </svg>`
  },
  {
    id: 'pedro',
    nome: 'Pedro',
    render: 'svg',
    aposentado: true,
    unlock: { tipo: 'nivel', nivel: 4 },
    nivelMinimo: 4,
    svg: `<svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="60" cy="130" rx="38" ry="12" fill="#B0C8E8" opacity="0.5"/>
      <rect x="32" y="90" width="56" height="48" rx="16" fill="#3A6EA8"/>
      <rect x="18" y="92" width="18" height="38" rx="9" fill="#3A6EA8"/>
      <rect x="84" y="92" width="18" height="38" rx="9" fill="#3A6EA8"/>
      <circle cx="60" cy="66" r="36" fill="#FDDBB4"/>
      <rect x="28" y="38" width="64" height="14" rx="6" fill="#C8A000"/>
      <ellipse cx="60" cy="38" rx="32" ry="10" fill="#C8A000"/>
      <rect x="24" y="36" width="72" height="10" rx="5" fill="#E8C000"/>
      <circle cx="46" cy="66" r="7" fill="white"/>
      <circle cx="74" cy="66" r="7" fill="white"/>
      <circle cx="47" cy="67" r="4" fill="#2C4A80"/>
      <circle cx="75" cy="67" r="4" fill="#2C4A80"/>
      <circle cx="48" cy="65" r="1.5" fill="white"/>
      <circle cx="76" cy="65" r="1.5" fill="white"/>
      <ellipse cx="60" cy="80" rx="3" ry="2.5" fill="#E8A87C"/>
      <path d="M50 90 Q60 99 70 90" stroke="#C0725A" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <ellipse cx="36" cy="78" rx="7" ry="5" fill="#F4A0A0" opacity="0.5"/>
      <ellipse cx="84" cy="78" rx="7" ry="5" fill="#F4A0A0" opacity="0.5"/>
    </svg>`
  },
  // ── LENDÁRIOS ─────────────────────────────────────────────────────────────
  {
    id: 'caipora',
    nome: 'Caipora',
    render: 'img',
    src: 'assets/avatares/avatar Caipora.webp',
    raridade: 'lendario',
    // Nível 10 + 3 livros de folclore + conquista Herói do Folclore
    unlock: {
      tipo: 'hibrido',
      condicoes: [
        { tipo: 'nivel', nivel: 10 },
        { tipo: 'folclore', livros: 3 },
        { tipo: 'conquista', conquistaId: 'heroi_folclore' }
      ]
    },
    nivelMinimo: 10
  },
  {
    id: 'flipflip',
    nome: 'Flip Flip',
    render: 'img',
    src: 'assets/avatares/avatar Flip Flip.webp',
    raridade: 'lendario',
    // Nível 8 + 10 livros + conquista Devorador de Histórias
    unlock: {
      tipo: 'hibrido',
      condicoes: [
        { tipo: 'nivel', nivel: 8 },
        { tipo: 'livros', quantidade: 10 },
        { tipo: 'conquista', conquistaId: 'dez_livros' }
      ]
    },
    nivelMinimo: 8
  },
  {
    id: 'pipoca',
    nome: 'Pipoca',
    render: 'img',
    src: 'assets/avatares/avatar pipoca.webp',
    raridade: 'raro',
    // Nível 5 + conquista Leitor Dedicado
    unlock: {
      tipo: 'hibrido',
      condicoes: [
        { tipo: 'nivel', nivel: 5 },
        { tipo: 'conquista', conquistaId: 'cinco_livros' }
      ]
    },
    nivelMinimo: 5
  },
  {
    id: 'cuca',
    nome: 'Cuca',
    render: 'img',
    src: 'assets/avatares/avatar Cuca.webp',
    raridade: 'lendario',
    unlock: {
      tipo: 'hibrido',
      condicoes: [
        { tipo: 'nivel', nivel: 9 },
        { tipo: 'folclore', livros: 4 },
        { tipo: 'conquista', conquistaId: 'heroi_folclore' }
      ]
    },
    nivelMinimo: 9
  }
];

window.AVATARES = AVATARES;
