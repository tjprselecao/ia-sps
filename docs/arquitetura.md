# Arquitetura do portal

## Visão geral

- **O que é:** um site estático com várias páginas, em HTML, CSS e JS puros. **Não há build, bundler, framework, npm nem testes automatizados.**
- **Ferramentas:** cada uma é uma página `.html` independente, com lógica própria num `<nome>_logic.js`.
- **Base comum:** as páginas compartilham uma moldura feita de 4 peças, sem "aplicativo" central nem roteador.

| Peça | Papel |
|---|---|
| `core.css` | Identidade visual e todos os componentes compartilhados |
| `core.js` | Utilitários compartilhados, expostos em `window.TJPRCore` |
| `ferramentas.js` | **Registro único** de seções e ferramentas, mais `VERSAO_APP` |
| `layout.js` | Monta cabeçalho institucional, menu, título, índice e comportamentos comuns a partir do registro |

- **Navegação:** é feita por links `<a>` reais entre arquivos.
- **Processamento:** acontece **no navegador** (client-side). Os arquivos enviados pelo usuário (PDF, XLSX, CSV) nunca saem da máquina. Só o Editor do Fluxo e a Consulta de Vagas gravam na nuvem, e nenhum dos dois guarda dados de candidatos (ver [`nuvem-supabase.md`](nuvem-supabase.md)).

## Árvore de arquivos

```
/
├── index.html                  Índice do portal (cartões por seção)
├── core.css  core.js  layout.js  ferramentas.js  changelog.js
├── tjpr_logo.js                Logotipo oficial em JPEG/base64 (documentos gerados)
│
├── edital.html                 Gerador do Edital de Abertura  (SPS)
│   ├── edital_logic.js
│   ├── edital_modelos.js       Gerado: parágrafos dos 40 modelos oficiais
│   └── edital_unidades_sei.js  Gerado: sigla SEI → hierarquia da unidade
├── ponto_14.html + ponto14_logic.js     Edital de Ensalamento        (SPS)
├── ponto_18.html + ponto18_logic.js     Convocação para Entrevista   (SPS)
├── ponto_20.html + ponto20_logic.js     Edital de Classificação Final (SPS)
├── ponto_26.html + ponto26_logic.js     Arquivo de importação no Hércules (SPS)
│
├── residencia_convocacao.html    + residencia_convocacao_logic.js     (Residência)
├── residencia_classificacao.html + residencia_classificacao_logic.js  (Residência)
├── residencia_hercules.html      + residencia_hercules_logic.js       (Residência)
├── residencia_ensalamento.html   Página reservada, fora do registro (órfã)
│
├── fluxo.html + fluxo_logic.js                    Editor do Fluxo (nuvem)
├── vagas_consulta.html + vagas_consulta_logic.js  Consulta de Vagas (nuvem)
├── resultado_final.html + resultado_final_logic.js  Tabela de Resultado Final, Unidades Externas (local)
│
├── jogos.html  jogos.js  flappy.html  flappy_logic.js  arkanoia.html   Zona secreta de jogos
│
├── vendor/
│   ├── pdf.min.js  pdf.worker.min.js   pdf.js 3.11.174 (leitura de PDF)
│   └── xlsx.min.js                     SheetJS 0.18.5 (leitura de planilhas)
├── Recursos/                    Bastidores (não são páginas)
│   ├── gerar_edital_unidades_sei.py
│   ├── resultado_final_unidades.sql           DESCONTINUADO (não rodar)
│   ├── resultado_final_unidades_limpeza.sql   rodar uma vez após a v3.24
│   └── vagas_estado.sql
├── deprecados/                  Arquivos tirados de uso (não referenciar). Ver LEIAME.md
│
├── AGENTS.md  .claude/  docs/   Instruções e documentação para IA e pessoas
└── README.md
```

## Ciclo de vida de uma página

1. O HTML traz só os "buracos" `#institutional-placeholder`, `#menu-placeholder` e `#header-title`, o `<main>` com os passos da ferramenta e o rodapé.
2. Os scripts carregam nesta ordem: bibliotecas → `core.js` → dados → `<nome>_logic.js` → `ferramentas.js` → `changelog.js` → `layout.js` (ver [`.claude/rules/paginas-html.md`](../.claude/rules/paginas-html.md)).
3. No `DOMContentLoaded`, o `layout.js`:
   0. troca `#institutional-placeholder` pelo cabeçalho institucional (`institutionalHtml`): "TJPR" em texto, Tribunal, Secretaria, a sigla `SG-SGP-CDHO-DSERFTA` com balão do nome por extenso (`DSERFTA_EXTENSO`) e o botão da versão;
   1. troca `#menu-placeholder` pelo menu (`navHtml`). Cada seção vira um item com submenu, e uma seção com uma única ferramenta vira link direto;
   2. troca `#header-title` pelo cabeçalho da página: selo de emoji, eyebrow e `<h1>` vindos do registro. Também aplica `--accent` (a cor da ferramenta) na `.sheet` e define `document.title`;
   3. no índice, preenche `.tool-sections` com uma seção por bloco (`secaoHtml`) e liga o contador secreto (10 cliques no cartão "Em breve" da SPS levam a `jogos.html`). Em `jogos.html`, preenche a grade de jogos;
   4. cria o **mini-header** fixo, com menu e botão "Topo", que aparece quando o cabeçalho sai da tela;
   5. liga os menus suspensos (clique, Esc, clique fora);
   6. recolhe todo `.step-info` ("Como funciona"), que abre e fecha pelo cabeçalho (`wireStepInfo`);
   7. faz o número da versão abrir o painel do changelog (`wireChangelog`).
4. O `_logic.js` da ferramenta liga seus próprios eventos, em geral no carregamento do script ou guardado por `if(document.getElementById(...))`.

**A página atual é identificada pelo nome do arquivo** (`location.pathname`). Por isso o campo `arquivo` do registro precisa ser idêntico ao nome do `.html`.

## Registro (`ferramentas.js`)

```js
const VERSAO_APP='3.23';
const SECOES=[ { id:"sps", ordem:0, rotulo:"Estágio", emoji:"🗂️", cor:"--teal",
                 eyebrow:"…", titulo:"…", descricao:"…", sufixoTitulo:" — …", emBreve:"…" }, … ];
const FERRAMENTAS=[ { arquivo:"ponto_20.html", secao:"sps", ponto:"20", emoji:"🏅", cor:"--mint",
                      eyebrow:"Ponto 20", titulo:"…", descricao:"…" }, … ];
```

- **Seções atuais:**

  | `id` | Rótulo no menu | Para quem |
  |---|---|---|
  | `sps` | Estágio | Seção de Processo Seletivo |
  | `residencia` | Residência | Residência jurídica |
  | `fluxo` | Fluxo | Mapa do processo seletivo |
  | `gestao` | Divisão de Gestão | Gestão de Estágios, Residência e Voluntariado |
  | `externas` | UE | Unidades externas, que conduzem o próprio processo seletivo |

- **Ordem:** pela `ordem` da seção e, dentro dela, por `ordem` ou pelo número do `ponto`.
- **Rótulo curto:** `rotulo`, ou então "Ponto NN".
- **Funções de apoio:** `secaoDaFerramenta`, `secaoPorId`, `ordemFerramenta`, `ferramentasDaSecao`, `rotuloFerramenta`, `ferramentaPorArquivo`.
- **Jogos:** `jogos.js` tem o mesmo formato (`JOGOS`, `jogoPorArquivo`), sem seção.
- **Changelog:** `changelog.js` contém `CHANGELOG`, da mais recente para a mais antiga. Ver [`processo-de-versao.md`](processo-de-versao.md).

## Bibliotecas (`vendor/`)

| Arquivo | Biblioteca | Global | Uso |
|---|---|---|---|
| `vendor/pdf.min.js` | pdf.js 3.11.174 | `pdfjsLib` | Ler texto de PDFs do SEI (`TJPRCore.pdfToText` e leitores com coordenadas na Residência) |
| `vendor/pdf.worker.min.js` | worker do pdf.js 3.11.174 | `pdfjsWorker` | Carregado como `<script>` comum. O pdf.js então roda o worker na thread principal ("fake worker"), o que **permite funcionar em `file://`** |
| `vendor/xlsx.min.js` | SheetJS 0.18.5 | `XLSX` | Ler `.xlsx`, `.xlsm`, `.xls` e `.csv` da Fábrica de Provas e da planilha de vagas |

Nenhuma biblioteca é usada para **gerar** PDF ou planilha (ver abaixo).

## Persistência: 4 modos

| Modo | Onde | Ferramentas |
|---|---|---|
| **Nenhuma** | tudo se perde ao recarregar | Ponto 20, Ponto 26, Hércules da Residência |
| **Rascunho em arquivo `.json`** (baixar e reabrir) | máquina do usuário | Edital, Ponto 14, Ponto 18, Convocação e Classificação da Residência, cópia de segurança do Fluxo, rascunho do Resultado Final |
| **localStorage** (chaves `tjpr_<ferramenta>_v<n>`) | navegador | recordes do Flappy, cache do Fluxo e de Vagas, rascunho automático do Resultado Final |
| **Supabase** (nuvem, compartilhado) | API REST | Editor do Fluxo e Consulta de Vagas, **nunca dados de candidatos** (ver [`nuvem-supabase.md`](nuvem-supabase.md)) |

O rascunho `.json` segue o formato `{ ferramenta, versao, … }`, com migração de versões antigas na leitura. A referência é o Ponto 18, com `versao:2`.

## Saídas de documentos

- **Blocos para colar no Athos ou no SEI:** HTML com estilos em linha, copiado via `ClipboardItem` (HTML + texto puro), com alternativa por seleção e `execCommand('copy')`. Ver [`dominio.md`](dominio.md) § Athos.
- **Tabela para colar no Word ou Excel:** `TJPRCore.copyTableToClipboard`.
- **PDF por impressão:** a ferramenta abre uma janela, escreve o HTML do documento (`@page A4`) e chama `print()` depois de 300 a 400 ms. O usuário escolhe "Salvar como PDF". É o caso do Edital, dos Pontos 14 e 18, da Residência e do Fluxo.
- **PDF de verdade, sem biblioteca:** só o Resultado Final (`construirPdf`). Monta um PDF 1.4 byte a byte, em A4 paisagem, com Helvetica e o logotipo em JPEG, e baixa direto.
- **CSV:** separador `;`, BOM UTF-8 e CRLF, baixado por `Blob` + `URL.createObjectURL`.

## Exceções à regra "sem rede"

- `fetch` para a API REST do Supabase em `fluxo_logic.js` e `vagas_consulta_logic.js`. O `resultado_final_logic.js` deixou de usar a nuvem na v3.24.
- `arkanoia.html` embute por iframe um jogo Godot hospedado em outro repositório do GitHub Pages.
- Links de texto que só se abrem por clique (Athos, Fábrica de Provas) não são dependências.

O comentário do topo de `core.css` ("100% offline") é anterior a essas exceções.

## Como rodar localmente

- **Mais simples:** dar duplo clique em `index.html` (`file://`). Tudo funciona, menos o que depende de rede (Supabase e Arkanoia).
- **Com servidor local**, na raiz do projeto:
  ```
  python3 -m http.server 8000
  ```
  e abrir `http://localhost:8000/`.
- Para testar, use **arquivos fictícios**. Nunca suba planilhas ou PDFs reais para o repositório.

## Hospedagem

- O portal é servido pelo **GitHub Pages**, a partir de um repositório **público**: tudo o que está no repositório é legível por qualquer pessoa.
- **Sem `.nojekyll`:** o Pages processa o site com o Jekyll. Pastas que começam com ponto (`.claude/`) não são publicadas, e os `.md` são convertidos em páginas.
- **Cuidado com o Liquid nos `.md`:**
  - não escrever a sequência chave + porcentagem, porque um erro de tag derruba a publicação;
  - evitar chaves duplas, porque o texto entre elas some na versão publicada.

## Arquivos gerados

| Arquivo | Como é produzido | Observações |
|---|---|---|
| `edital_unidades_sei.js` | `python3 Recursos/gerar_edital_unidades_sei.py [planilha.xlsx]`. Sem argumento, usa o `Recursos/report*.xlsx` mais recente | Lê só a 1ª aba, colunas `Sigla` e `NomeUnidade` (achadas pelo cabeçalho). Grava `const UNIDADES_SEI={"SIGLA":"NIVEL1\|…\|NIVELN"}`. O nome por extenso é montado em tempo de execução por `nomeUnidadePorExtenso` |
| `edital_modelos.js` | Gerado a partir dos 40 `.docx` oficiais do Edital de Abertura. **O gerador não está no repositório** | `EDITAL_PARAS = [{l, h, c?}]`. Alterar só com revalidação contra o modelo |
| `tjpr_logo.js` | Extraído do PDF-modelo oficial da Convocação | JPEG 208×123 em base64 (`TJPR_LOGO_DATA_URI`) |
| `vendor/*` | Distribuição oficial das bibliotecas | Não editar |
