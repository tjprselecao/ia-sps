---
name: tjpr-ferramentas-html
description: "Use ao criar, revisar, depurar ou versionar ferramentas HTML internas da DSERFTA/Seção de Processo Seletivo do TJPR (portal de ferramentas: Edital de Abertura, Ponto 14, Ponto 18, Ponto 20, Ponto 26, Residência, Fluxo, Consulta de Vagas, Resultado Final), ou ao tratar CSV/planilhas da Fábrica de Provas, PDFs do SEI, blocos para o Athos, CSV de importação no Hércules, cruzamento de candidatos por nome, cotas/reservas e desempate, ou ao aplicar a identidade visual do TJPR a uma página ou documento. Não use para programação genérica sem relação com essas ferramentas."
---

# Ferramentas HTML da DSERFTA/TJPR

## 0. Primeiro: há repositório?

- **Com o repositório `ia-sps` disponível** (Claude Code, projeto anexado, arquivos enviados): leia e siga o `AGENTS.md` da raiz e os docs de `docs/`. **Eles prevalecem sobre esta skill.** Este arquivo é só um resumo para quando o repositório não está à mão.
- **Sem o repositório:** produza código **compatível com o portal** (seção 1) ou, se o usuário pedir explicitamente uma ferramenta **avulsa**, um arquivo único autocontido a partir de `starter-tjpr.html` (seção 2).

## 1. Como o portal é construído (padrão desde a v2.0)

- **Tecnologia:** site estático em **HTML + CSS + JS puros**, sem build, framework, npm ou CDN. Publicado no GitHub Pages e capaz de rodar em `file://`.
- **Arquivos por ferramenta:** cada ferramenta é `<nome>.html` + `<nome>_logic.js`. Na SPS, por ponto: `ponto_NN.html` + `pontoNN_logic.js`.
- **Base comum:**
  - `core.css`: identidade e componentes;
  - `core.js`: `window.TJPRCore`, com `escapeHtml`, `csvEscape`, `normName`, `parseCSV`, `copyTableToClipboard`, `pdfToText`, `seletorHora`…;
  - `ferramentas.js`: registro único de seções e ferramentas, mais `VERSAO_APP`;
  - `changelog.js`: `CHANGELOG`;
  - `layout.js`: monta o cabeçalho institucional, o menu, o título e o índice **a partir do registro**.
- **Esqueleto da página:**
  - `.sheet` > `#institutional-placeholder` + `.app-header` (com `#menu-placeholder` e `#header-title`) + `main` + `footer`;
  - em `main`, um bloco `.step.step-info` "Como funciona" e passos `.step` numerados.
- **Ordem dos scripts:** `vendor/pdf.min.js` e `vendor/pdf.worker.min.js` (pdf.js 3.11.174) e/ou `vendor/xlsx.min.js` (SheetJS 0.18.5) → `core.js` → dados (`tjpr_logo.js`, `edital_unidades_sei.js`) → `<nome>_logic.js` → `ferramentas.js` → `changelog.js` → `layout.js`.
- **`_logic.js`:**
  - IIFE com `'use strict'`;
  - cabeçalho com o índice de seções `A) B) C)…`;
  - funções puras separadas da ligação com o DOM;
  - identificadores e comentários em pt-BR, explicando o **porquê**.
- **Ferramenta nova:** página + lógica + um objeto em `FERRAMENTAS` (`arquivo`, `secao`, `rotulo` ou `ponto`, `ordem`, `emoji`, `cor`, `eyebrow`, `titulo`, `descricao`). Toda mudança publicada atualiza `VERSAO_APP` e uma entrada no topo do `CHANGELOG`.
- **Exceções de rede:** só `fetch` REST ao Supabase (Editor do Fluxo e Consulta de Vagas) e o iframe de um jogo. **Dados de candidatos nunca vão para a nuvem:** o Resultado Final ficou 100% local na v3.24.

## 2. Ferramenta avulsa (só quando pedida)

- Arquivo único `.html`, com CSS e JS embutidos e **nenhuma dependência externa**: sem Google Fonts, CDN ou imagens por URL.
- Logo: só o arquivo oficial embutido (base64). Nunca redesenhado.
- Partir de `starter-tjpr.html` (asset desta skill), que replica o visual do portal.
- Nome do arquivo: descritivo em minúsculas com `_` (ex.: `ponto_30_agrupador.html`), e versão no rodapé ou no título, se o usuário quiser.

## 3. Identidade visual (Manual de Uso da Marca TJPR, Res. 227/2019)

| Token | HEX | Pantone | Uso no portal |
|---|---|---|---|
| `--navy` | `#002a3a` | 303 C | Primária: cabeçalho, títulos |
| `--teal` | `#008c95` | 321 C | Secundária: links, foco, ações |
| `--mint` | `#49c5b1` | 3258 C | Destaques sobre o azul; sucesso |
| `--gold` | `#eeb134` | 116 C | Atenção; acento |
| `--coral` | `#eb553b` | 2026 C | Erro; "Aviso:" do rodapé |

- **Tons auxiliares:** só as **gradações oficiais** do manual (p. 22). Exemplos: navy `#526a74` `#b7c1c6` `#e7eaec`; teal `#8ec5c9` `#e9f5f6`; mint `#b2dad4` `#f0f8f8`; gold `#f8e0ae` `#fdf7ea`; coral `#f39989` `#fdeeeb`.
- **Neutros do portal:** `--paper #eef1f2`, `--ink #14232a`, `--ink-soft #4d5e64`, `--line #c7d2d5`.
- **Fonte oficial:** URW DIN, paga. O portal usa `'Barlow Semi Condensed'` (títulos e botões), `'Barlow'` (texto) e `'IBM Plex Mono'` (dados), sempre com fallback `system-ui` e **sem CDN**.
- **Marca:**
  - proibido criar logo de setor, seção ou divisão;
  - não distorcer, rotacionar ou recolorir;
  - em fundo claro, a versão azul-escura; em fundo escuro, a branca.
- **Visual do portal:** faixa de 5 cores no topo, cabeçalho navy com eyebrow mono em `--mint`, cantos retos, traço fino e uma cor de acento por ferramenta.
- **Cores restritas da CEVID** (rosa e roxo): não usar.

## 4. Rodapé obrigatório (texto exato)

> **Aviso:** esta ferramenta está em fase de testes e não é um sistema oficial do Tribunal de Justiça do Estado do Paraná (TJPR). É de responsabilidade do(a) utilizador(a) conferir integralmente os dados gerados antes de qualquer lançamento no Hércules.

E, em texto discreto (9,5px, cor `--paper-dark`):

> elaborado com o uso de ia por igor pankiewicz

## 5. Padrões de dados

- **Nada é corrigido em silêncio.** Todo ajuste, descarte, reserva não reconhecida ou empate desfeito vira aviso visível, com o texto original da linha.
- **Planilhas da Fábrica de Provas:**
  - localizar colunas **pelo nome do cabeçalho**, sem acento e em maiúsculas;
  - datas podem vir como número de série do Excel;
  - o CPF perde o zero à esquerda (recompor para 11 dígitos).
- **CSV de entrada:** detectar `,` ou `;`. **CSV de saída:** `;` + BOM UTF-8 + CRLF.
- **Números e datas:** nota com vírgula e 2 casas (`7,75`); datas `dd/mm/aaaa` ou por extenso ("9 de outubro de 2026"); horário `14h00min`; SEI `0000000-00.0000.8.16.6000`.
- **Colagem de PDF, Word ou Excel:** reconhecer por padrão ou regex, ancorando nos campos numéricos das pontas. Nunca usar `split` ingênuo por espaços. Listar as linhas não reconhecidas com o texto exato.
- **Cruzamento por nome:** sem acento, MAIÚSCULAS, espaços colapsados. Por inscrição quando houver. Sinalizar o que não cruzou.
- **Reservas:** no portal, reconhecer **sempre** com `TJPRCore.reconhecerReserva(texto)` (devolve `{ codigos, desconhecidos, semReserva }`), nunca com mapa próprio.

  | Código | Grupo | Coluna do Hércules |
  |---|---|---|
  | 2.1.1 | pretos/pardos | AFRO |
  | 2.1.2 | PcD | PNE |
  | 2.1.3 | indígenas | INDÍGENA |
  | 2.1.4 | vulnerabilidade social | VS (não se aplica na Residência) |

- **Desempate:** maior nota; no empate, o **mais velho**, comparando datas de nascimento. Sem data, manter a ordem e avisar.
- **Hércules (CSV):** `Classificação;CPF;Nome do candidato;Nota final;E-mail;Telefone celular;Telefone fixo;PNE;VS;AFRO;INDÍGENA`, com S/N nas cotas.
- **Athos:**
  - colar bloco a bloco: nome, preâmbulo, numeração, conteúdo, data, assinatura;
  - o Athos descarta `style` (usar `align`, `<b>` e estilos em linha);
  - o modelo já acrescenta "EDITAL DE", "SEI!TJPR N°", a cidade e o ponto final da data (não duplicar).
- **Escape:** `TJPRCore.escapeHtml` escapa `& < > " '` desde a v3.24 e serve para texto e atributo. Em código sem o core, escape também as aspas nos atributos.

## 6. Checklist antes de entregar

1. Sem internet, tudo funciona (exceto a nuvem, se for o caso)?
2. Esqueleto, ordem dos scripts e registro no portal (ou starter, se avulsa)?
3. Caminhos de erro testados (arquivo vazio, coluna faltando, linha irreconhecível), sem falha silenciosa?
4. Rodapé e crédito com o texto exato?
5. Só cores da paleta e das gradações oficiais, e fontes sem CDN?
6. Nenhum dado real em exemplos ou placeholders?
7. Versão e changelog atualizados (portal), e mensagem de commit e lista de arquivos para upload no GitHub?
