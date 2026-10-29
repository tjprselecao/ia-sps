# Identidade visual do TJPR e como o portal a aplica

**Fonte oficial:** [Manual de Uso da Marca TJPR](https://www.tjpr.jus.br/documents/18319/80874352/Manual+de+Marca+P%C3%BAblico/31ead32c-214e-8423-ee45-51318abf6050) (28 páginas). A identidade foi aprovada pela Resolução nº 227/2019 do Órgão Especial. Casos não previstos no manual: Coordenadoria de Comunicação Social do TJPR.

Este documento resume o manual e registra **como o portal o aplica**, inclusive os desvios conscientes de uma ferramenta interna.

---

## 1. Cores

### 1.1 Cores institucionais (manual, p. 21)

| Token no `core.css` | Pantone | CMYK | RGB | HEX |
|---|---|---|---|---|
| `--navy` | 303 C | C90 M50 Y40 K40 | 0 · 42 · 58 | `#002a3a` |
| `--teal` | 321 C | C84 M28 Y40 K3 | 0 · 140 · 149 | `#008c95` |
| `--mint` | 3258 C | C64 M0 Y39 K0 | 73 · 197 · 177 | `#49c5b1` |
| `--gold` | 116 C | C05 M30 Y75 K00 | 238 · 177 · 52 | `#eeb134` |
| `--coral` | 2026 C | C05 M65 Y65 K00 | 235 · 85 · 59 | `#eb553b` |

Para impressão, use Pantone ou CMYK; para tela, RGB ou HEX. O manual exige fidelidade na reprodução das cores.

### 1.2 Cores secundárias: gradações oficiais (manual, p. 22)

O manual autoriza as gradações das cores principais "como cores auxiliares". **Quando precisar de um tom intermediário (fundo suave, borda, hover), use um destes valores, e não um hex inventado.** Ordem: do mais escuro ao mais claro.

| Base | Gradações |
|---|---|
| `#002a3a` navy | `#1b3f4a` `#3a5461` `#526a74` · `#6b8089` `#84959c` `#9ba9af` · `#b7c1c6` `#d0d6d9` `#e7eaec` |
| `#008c95` teal | `#2f969e` `#48a0a6` `#5bacb2` · `#7ab9bf` `#8ec5c9` `#a4d1d3` · `#bbdcdf` `#d1e8eb` `#e9f5f6` |
| `#49c5b1` mint | `#70c3b6` `#76cabd` `#8ad0c7` · `#9dd4cb` `#b2dad4` `#bfe0dc` · `#cfe7e5` `#dfefee` `#f0f8f8` |
| `#eeb134` gold | `#f0b949` `#f1c15d` `#f3c971` · `#f5d085` `#f6d899` `#f8e0ae` · `#fae7c2` `#fcefd6` `#fdf7ea` |
| `#eb553b` coral | `#ed664f` `#ef7762` `#f18876` · `#f39989` `#f5aa9d` `#f7bbb1` · `#f9ccc4` `#fbddd8` `#fdeeeb` |

Sugestões de uso:
- fundos de aviso: `#fdeeeb` (coral), `#fdf7ea` (gold), `#f0f8f8` (mint), `#e9f5f6` (teal);
- bordas neutras: `#d0d6d9`, `#b7c1c6`;
- texto secundário: `#526a74`.

### 1.3 Cores restritas (manual, p. 23): não usar

Rosa `#F49DB6`, magenta `#D12F8B` e roxo `#7F3F98` são exclusivos de materiais da CEVID (Coordenadoria Estadual da Mulher em Situação de Violência Doméstica e Familiar). **Não se aplicam a este portal.**

### 1.4 Neutros do portal (não são do manual)

O `core.css` define neutros próprios, próximos da gradação do navy:
- `--paper` `#eef1f2`
- `--paper-dark` `#dde4e6`
- `--ink` `#14232a`
- `--ink-soft` `#4d5e64`
- `--line` `#c7d2d5`
- `--navy-light` `#0d4658`

Continue usando esses tokens para manter a consistência.

**Valores legados fora da paleta** (registrados no backlog; não replicar):
- `#a7a290`: botão desabilitado, tom oliva;
- `#722525`: hover do `.download-btn`;
- `#fbfaf4` e `#f4f2e9`: tons creme amarelados;
- sombras `rgba(35,40,31,…)`, herança de uma paleta antiga.

Os apelidos `--seal`, `--seal-light` e `--stamp-red` também vêm dessa fase.

---

## 2. Tipografia (manual, p. 25)

- **Oficial:** **URW DIN** e variações (Light, Regular, Medium, Bold, Black e itálicos). É uma fonte paga, não pode ser distribuída no repositório e não está disponível em CDN gratuito.
- **No portal**, que não usa CDN nem embute fontes hoje:

| Papel | Pilha no `core.css` | Por quê |
|---|---|---|
| Títulos, botões, menu, números de passo | `'Barlow Semi Condensed', system-ui, sans-serif` | Barlow é uma sans geométrica de traço DIN-like, de licença aberta (OFL) |
| Texto corrido | `'Barlow', system-ui, sans-serif` | Idem |
| Dados, tabelas, eyebrow, nomes de arquivo | `'IBM Plex Mono', 'Consolas', monospace` | Leitura de códigos e colunas |

- ⚠ **Nenhuma dessas fontes está embutida.** Em máquinas sem a Barlow instalada, o portal aparece em `system-ui` (Segoe UI no Windows, SF no macOS). Para fidelidade total, uma melhoria possível é embutir os `.woff2` da Barlow em `vendor/fonts/` com `@font-face` local, já que a licença OFL permite (ver backlog). **Nunca carregue a fonte do Google Fonts.**
- **Documentos gerados** (PDF e Athos) seguem a fonte do **modelo oficial** de cada documento, e não a do portal: Calibri/Carlito, Times New Roman 11pt ou Helvetica.

---

## 3. Marca (logo)

### O que o manual determina
- **Composição:** símbolo (espada, escudo, balança, araucária e as iniciais TJ) + logotipo (sigla TJPR + nome por extenso).
  - O **símbolo** pode aparecer sozinho em peças internas ou como identificação adicional.
  - O **logotipo nunca** aparece sozinho.
- **Versões:** completa (horizontal e vertical), simples (símbolo + sigla) e usos restritos (setorial e coordenadorias).
- **Proibido criar logos para secretarias, seções, divisões ou setores** (p. 11). Logo de coordenadoria só com aprovação da Presidência, e não vale em documentos oficiais. Em material com vários setores, use só a marca do TJPR.
- **Área de proteção:** margem igual à altura da letra "T" da marca.
- **Redução mínima** (p. 15):

  | Versão | Horizontal | Vertical |
  |---|---|---|
  | Completa | 3 cm | 1,7 cm |
  | Simples | 1,5 cm | 0,85 cm |

- **Fundos** (p. 17): em fundo claro, a marca em **azul-escuro**; em fundo escuro (navy, teal, mint, coral), em **branco**. Prefira fundos de cor única.
- **Proibições** (p. 19): mudar a proporção, rotacionar, distorcer, mudar a posição dos elementos, aplicar cores não permitidas, usar fundo chapado sobre imagem.
- **Reprodução:** sempre a partir do **arquivo digital oficial**, nunca redesenhando ou reaproveitando de material impresso.

### Como o portal aplica
- **Cabeçalho das páginas** (`institutionalHtml` em `layout.js`):
  - mostra "TJPR / TRIBUNAL DE JUSTIÇA DO ESTADO DO PARANÁ" **em texto** (`.tjpr-fallback`), na cor navy;
  - ao lado, a identificação: Tribunal, Secretaria de Gestão de Pessoas e a sigla `SG-SGP-CDHO-DSERFTA`, com balão do nome por extenso;
  - **não há logo de setor**, conforme o manual.
- **Documentos gerados** (Convocação do Ponto 18, PDF do Resultado Final): usam o logotipo oficial em JPEG/base64 de `tjpr_logo.js`, extraído do modelo oficial. Não troque por uma versão redesenhada, recolorida ou esticada. Mantenha a proporção (208×123).
- Se um dia o cabeçalho do portal passar a usar o logo gráfico, use o arquivo oficial (SVG ou PNG) **embutido localmente**: em azul-escuro sobre a área branca do cabeçalho, ou em branco sobre o `.app-header` navy.

---

## 4. Ícones (manual, p. 26)

- O manual pede ícones simples, **de traço e de uma única cor**, consistentes entre si. O TJPR mantém um banco de ícones.
- **Desvio consciente do portal:** os cartões, o menu e os cabeçalhos usam **emojis** como selo visual de cada ferramenta (`emoji` no registro). Por ser uma ferramenta interna, eles funcionam como identificadores rápidos.
  - No menu, aparecem em tons de cinza quando inativos (`filter:grayscale(1)`).
  - Em documentos publicados (Athos, PDF), **não use emojis**.
- Se for preciso desenhar um ícone (SVG inline), siga o manual: traço, uma cor (`currentColor` ou um token), poucos elementos.

---

## 5. A linguagem visual do portal (o que manter)

- **Faixa de 5 cores** no topo da `.sheet`, nas cinco cores institucionais em partes iguais. No índice, também na base do `.app-header.rainbow`.
- **Cabeçalho navy** (`.app-header`) com eyebrow em mono maiúsculo `--mint` e título branco em Barlow Semi Condensed.
- **Cor de acento por ferramenta** (`cor` no registro → `--accent`): filete do cabeçalho, sombra do selo de emoji, filete do cartão no índice, borda do `.step-info`. As cores atribuídas hoje seguem as cinco institucionais.
- **Cantos retos ou quase retos**, traço fino `--line`, sombras discretas, fundo creme (`#fffdf7`) em campos e selos.
- **Hierarquia dos estados:** `--mint` para sucesso/ok, `--coral` para erro ou atenção, `--teal` para neutro ou foco.
- **Acessibilidade:**
  - foco visível (`outline` teal ou mint);
  - contraste do texto `--ink` sobre branco;
  - emojis com `aria-hidden`;
  - `prefers-reduced-motion` respeitado.
