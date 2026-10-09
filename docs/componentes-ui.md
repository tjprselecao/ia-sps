# Componentes de interface (`core.css`)

Tudo o que está aqui já tem estilo pronto no `core.css`. **Use estas classes antes de criar CSS novo.**

- Componente exclusivo de uma ferramenta: vai num `<style>` da própria página, com prefixo (`rf-`, `vg-`, `ed-`).
- Componente usado por 2 ou mais ferramentas: vai para o `core.css`.

Regras de cor e fonte: [`identidade-visual.md`](identidade-visual.md).

## Tokens (`:root`)

| Token | Valor | Uso |
|---|---|---|
| `--navy` | `#002a3a` | Primária: cabeçalho, títulos, fundo do menu |
| `--navy-light` | `#0d4658` | Variação do azul |
| `--teal` | `#008c95` | Secundária: links, foco, botões-link, ação principal |
| `--mint` | `#49c5b1` | Destaques sobre o azul, item ativo do menu, sucesso |
| `--gold` | `#eeb134` | Acento de ferramentas; atenção |
| `--coral` | `#eb553b` | Erros, avisos críticos, "Aviso:" do rodapé |
| `--paper` | `#eef1f2` | Fundo da página |
| `--paper-dark` | `#dde4e6` | Divisórias suaves; cor do crédito no rodapé |
| `--ink` | `#14232a` | Texto principal |
| `--ink-soft` | `#4d5e64` | Texto secundário |
| `--line` | `#c7d2d5` | Bordas |
| `--white` | `#ffffff` | Folha |
| `--accent` | definida por página | Cor da ferramenta, vinda do registro (`cor`). Use `var(--accent, var(--teal))` |
| `--seal`, `--seal-light`, `--stamp-red` | apelidos de navy, teal e coral | Legado; aparecem no CSS antigo |

**Fontes:**
- `'Barlow Semi Condensed'`: títulos, botões, menu e números de passo.
- `'Barlow'`: texto.
- `'IBM Plex Mono', 'Consolas', monospace`: eyebrow, tabelas de dados, nomes de arquivo e contadores.

## Moldura (montada pelo `layout.js`; não escrever à mão)

| Classe | O que é |
|---|---|
| `.sheet` | A "folha" branca central (máx. 980px), com a faixa de 5 cores no topo. `body.pagina-larga .sheet` ocupa a largura toda (Fluxo) |
| `.institutional-header`, `.tjpr-fallback`, `.tjpr-name`, `.tjpr-sigla`, `.tjpr-sigla-tip`, `.tjpr-version` | Cabeçalho institucional, balão da sigla e botão da versão |
| `.app-header` (`.rainbow` no índice) | Faixa azul com menu e título, com filete inferior na cor de acento |
| `.tab-nav`, `.tab-btn`, `.tab-group`, `.tab-parent`, `.tab-menu`, `.tab-menu-item`, `.tab-emoji`, `.tab-caret` | Menu com submenus por seção |
| `.page-header`, `.page-emoji`, `.page-title-block`, `.eyebrow`, `h1` | Cabeçalho da página: selo de emoji, eyebrow e título |
| `.mini-header`, `.top-btn` | Cabeçalho fixo reduzido ao rolar a página |
| `.cl-overlay`, `.cl-caixa`… | Painel do histórico de versões |
| `.tool-sections`, `.tool-section`, `.section-head`, `.tool-grid`, `.tool-card` (`.disabled`), `.secret-countdown` | Índice e cartões |

## Passos da ferramenta

```html
<!-- Bloco "Como funciona": o layout.js recolhe sozinho; clicar no cabeçalho abre -->
<div class="step step-info">
  <div class="step-head">
    <span class="step-num">i</span>
    <p class="step-title">Como funciona</p>
  </div>
  <p class="step-desc">Explicação curta, com <strong>termos-chave</strong> em negrito.</p>
  <ol class="step-list"><li>Primeiro…</li><li>Depois…</li></ol>
</div>

<!-- Passo numerado: o conteúdo abaixo do cabeçalho fica recuado 36px -->
<div class="step">
  <div class="step-head">
    <span class="step-num">1</span>
    <p class="step-title">Envie o Relatório de Inscritos</p>
  </div>
  <p class="step-desc">O que enviar e de onde baixar.</p>
  <div class="step-content"> … </div>
</div>
```

## Entrada de arquivos e colagem

```html
<div class="upload-panel">
  <button class="file-btn" id="xxFileBtn" type="button">Escolher arquivo</button>
  <input type="file" id="xxFileInput" accept=".xlsx,.xlsm,.xls,.csv">  <!-- escondido pelo CSS -->
  <span class="file-name" id="xxFileName">Nenhum arquivo selecionado</span>
</div>

<div class="alt-action">
  <span>Se preferir, cole a tabela você mesmo:</span>
  <button type="button" class="link-btn" id="xxBtnColar">Colar tabela manualmente</button>
</div>
<div class="collapse-panel" id="xxColarWrap" style="display:none;">
  <textarea id="xxColar" placeholder="ORDEM	INSCRIÇÃO	NOME	NOTA"></textarea>
</div>
```

- `textarea`: fundo creme e fonte mono, já estilizados.
- `.num-input`: campo numérico curto, recuado.
- `.exemplo-input`: placeholder mais apagado e em itálico, para quando o placeholder é só modelo de preenchimento.

## Avisos e status

```html
<p class="notice-banner">Neutro / em andamento.</p>
<p class="notice-banner ok"><strong>Pronto.</strong> 42 candidatos lidos.</p>
<p class="notice-banner warn"><strong>Atenção:</strong> 3 linhas não reconhecidas.</p>
<ul class="warn-list"><li>linha 12: "texto exato da linha"</li></ul>

<!-- Carimbo de resultado (OK / ATENÇÃO) -->
<div class="stamp-wrap show">
  <div class="stamp">OK</div>          <!-- .stamp.warn para vermelho -->
  <div class="stamp-text"><strong>Tudo cruzado.</strong> 40 de 40 nomes encontrados.</div>
</div>

<p class="empty-hint">A tabela final aparecerá aqui após o processamento.</p>
```

- Aviso flutuante temporário: `.fluxo-aviso`, que recebe `.aparece` para surgir e `.erro` para indicar falha. É controlado por uma função `avisar()` (ver [`core-api.md`](core-api.md)).

## Ações

| Classe | Uso |
|---|---|
| `.run-btn` | Botão principal do fluxo, em largura total ("Processar e cruzar tabelas"). `:disabled` enquanto falta entrada |
| `.link-btn` | Ação secundária com contorno teal. `.link-btn.forte` para a ação que lidera uma barra |
| `.file-btn` | Escolher arquivo |
| `.download-row` + `.download-btn` + `.count-note` | Linha de download (CSV ou PDF) com contagem |
| `.divider` | Separador tracejado entre a entrada e o resultado |
| `.row-del-btn` | Excluir uma linha da grade |
| `.drag-handle` | Alça ⠿ de arrastar a linha |

## Tabelas

```html
<!-- Conferência de dados: mono, cabeçalho fixo, rolagem -->
<div class="table-scroll"><table> <thead><tr><th>…</th></tr></thead> <tbody>…</tbody> </table></div>
<!-- tr.unmatched destaca uma linha sem correspondência no cruzamento -->

<!-- Tabela "limpa" para colar no Word/Excel/Athos: borda 1pt preta -->
<div class="simple-table-wrap"><table class="simple-table">…</table></div>
```

- **Grades editáveis com arrastar e soltar:** `table.cv-grade-table`, `table.rh-edit-table` e `table.fluxo-table`. As marcas `tr.row-dragging`, `tr.drop-before` e `tr.drop-after` já têm estilo para essas três.
  - ⚠ Ao criar uma grade nova, **acrescente o seletor dela** nessas regras do `core.css`. A `rf-tabela` do Resultado Final ficou sem retorno visual por isso.
- **Tabela larga:** com `.fluxo-table`, abaixo de 850px ela ganha `min-width` e passa a rolar.

## Campos de formulário com rótulo em cima (alinhados pela base)

```html
<div class="painel-nova-data">
  <label class="campo-vert">Quantidade <input type="number"></label>
  <label class="campo-vert campo-data">Data <input type="text" class="exemplo-input" placeholder="dd/mm/aaaa"></label>
  <label class="campo-vert campo-hora">Início <input type="text" placeholder="Ex: 14h00min"></label>
  <label class="campo-check"><input type="checkbox"> Reserva</label>
  <button type="button" class="link-btn">Criar data</button>
</div>
```

- `ativarBotaoCalendario` e `ativarBotaoRelogio` embrulham o campo em `.campo-data-wrap` e acrescentam `.date-pick-btn` (ou `.date-pick-btn-mini`, dentro de tabelas).
- O seletor de horário do core usa `.hora-pop`, `.hora-col`, `.hora-lista` e `.hora-item`.

## Blocos de alocação por dia (Ponto 18)

`.bloco-dia` (`.sem-dia` para o bloco "A atribuir"; `.drop-into` ao receber um arrasto), `.bloco-dia-cab`, `.bloco-dia-tit`, `.bloco-dia-qtd`, `.bloco-dia-acoes`, `.bloco-dia-horarios`, `.bloco-dia-corpo`, `.zona-vazia`.

## Documento gerado em blocos (Athos)

```html
<div class="cv-bloco">
  <div class="cv-bloco-head">
    <p class="cv-bloco-tit">Bloco 3 — Numeração</p>
    <button type="button" class="link-btn">Copiar</button>
  </div>
  <div class="cv-bloco-conteudo"> … HTML com estilos em linha … </div>
</div>
```

- O Edital e o Ponto 14 usam uma variante própria, `.ed-bloco` e `.ed-bloco-conteudo`, definida no `<style>` de cada página. O CSS está **duplicado** entre as duas.
- `.sig-block` + `.sig-text`: painel de assinatura com botão de copiar (Ponto 20).

## Caixa flutuante de rascunho

```html
<aside class="float-draft" id="xxDraft">
  <div class="float-draft-head">
    <p class="float-draft-tit">Rascunho</p>
    <button type="button" class="float-draft-toggle" aria-label="Recolher">–</button>
  </div>
  <div class="float-draft-body">
    <button type="button" class="link-btn">Salvar rascunho (.json)</button>
    <button type="button" class="link-btn">Abrir rascunho</button>
    <p class="float-draft-nota">O arquivo fica só no seu computador.</p>
  </div>
</aside>
```

- Fica **fora** da `.sheet`.
- `.collapsed` recolhe a caixa.
- Some na impressão.

## Diversos

| Classe | Uso |
|---|---|
| `.placeholder-panel` + `.placeholder-tag` | Página "Em desenvolvimento" |
| `body.pagina-larga` | Folha em largura total, com a prosa limitada a 980px |
| `.fluxo-*` | Componentes exclusivos do Editor do Fluxo (`contenteditable`, cor por fase, classificações) |
| `@media print` | Já esconde `.float-draft`, `.fluxo-aviso` e `.fluxo-barra`. Ao criar um controle flutuante, esconda-o também |
| `@media (max-width:600px)` | Recuos de 36px zerados e paddings reduzidos. Teste a ferramenta em tela estreita |
