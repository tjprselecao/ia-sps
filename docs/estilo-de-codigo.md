# Estilo de código e convenções

O código foi escrito ao longo de muitas sessões e nem tudo é uniforme. A regra de ouro é **imitar o arquivo que você está editando**. Em código novo, siga as convenções abaixo, que refletem o padrão mais recente (Residência, Resultado Final, Fluxo).

## Idioma

- **Português do Brasil** em tudo: identificadores (`lerPlanilha`, `estado`, `avisar`, `gravarNaNuvem`), comentários, mensagens e textos de interface.
- **Exceções herdadas** (não "traduzir"):
  - nomes em inglês no `core.js` (`pdfToText`, `buildTSV`) e no `layout.js` (`wireDropdowns`);
  - o `flappy_logic.js`;
  - partes do Ponto 20 e do Ponto 26 (`processFiles`, `checkReady`);
  - as chaves do formato gravado do Fluxo (`phase`, `activity`…), que são contrato.

## Arquivos e nomes

| Item | Convenção | Exemplos |
|---|---|---|
| Ferramenta da SPS por ponto | `ponto_NN.html` + `pontoNN_logic.js` (o JS **perde** o sublinhado) | `ponto_20.html`, `ponto20_logic.js` |
| Demais ferramentas | `<nome>.html` + `<nome>_logic.js`, em minúsculas com `_` | `residencia_hercules.html` |
| Dados e recursos de uma ferramenta | `<ferramenta>_<o_que>.js` | `edital_modelos.js` |
| IDs no HTML | prefixo curto da ferramenta + camelCase | `p20ProcessBtn`, `cvTabela`, `rfSei` |
| Classes exclusivas | prefixo + kebab-case | `rf-campo`, `vg-chip`, `ed-bloco` |
| Chave de localStorage | `tjpr_<ferramenta>_v<n>` (troque o `n` para invalidar caches antigos) | `tjpr_vagas_consulta_v1` |
| Rascunho `.json` | `{ ferramenta:'<id>', versao:<n>, … }` | `{ferramenta:'ponto18', versao:2, …}` |
| Objeto de depuração | `window.<NomeEmPascalCase>` | `window.ResultadoFinal` |

## Estrutura de um `_logic.js`

```js
/* Nome da ferramenta — Seção (TJPR)

   O que faz, em 2–4 linhas. Entradas e saídas.
   100% client-side. Depende de: core.js, vendor/xlsx.min.js (locais).

   Estrutura do arquivo:
     A) utilidades
     B) leitura dos arquivos
     C) estado da ferramenta
     D) …
     Z) ligação com a página
*/
(function(){
'use strict';

const C = window.TJPRCore;

/* ===================== A) utilidades ===================== */
…
/* ============ Z) ligação com a página ============ */
if(document.getElementById('xxAlgumId')){ … ligar eventos … }

window.NomeDaFerramenta = { /* funções puras expostas para depuração/testes */ };
})();
```

- **Funções puras** (parse, cruzamento, cálculo, montagem de texto ou HTML) ficam **separadas** da ligação com o DOM. Assim podem ser testadas no console ou em Node.
- **Estado** num objeto único (`estado`). A tela é redesenhada a partir dele.
- **Ao editar uma tabela**, não redesenhe a cada tecla: isso destrói o foco e quebra o Tab. Redesenhe ao confirmar, ao sair do campo ou ao reordenar.

## Dialeto e formatação

| Aspecto | Regra |
|---|---|
| Versão de JS | ES6+ (`const`, `let`, arrow functions) em código novo. **Exceção:** `ponto14_logic.js` e `ponto18_logic.js` são ES5 (`var`, `function`); mantenha ES5 ao editá-los |
| Indentação | 2 espaços, sem tabs. Nas IIFEs com `'use strict'`, o corpo pode ficar na coluna 0 (padrão de vários arquivos) |
| Aspas | Simples nos `_logic.js`. Duplas nos arquivos de dados e registro (`ferramentas.js`, `jogos.js`, `changelog.js`, `edital_*.js`) |
| Ponto e vírgula | Sempre |
| Concatenação | Predomina `+`. Template literals são aceitos (o `layout.js` usa) |
| Espaçamento | Há arquivos "compactos" (`layout.js`, `ferramentas.js`, `ponto18_logic.js`) e "espaçados" (`core.js`, Residência). Siga o arquivo |
| Fim de linha | LF, **exceto** `changelog.js` e `ponto26_logic.js`, que estão em CRLF |
| Codificação | UTF-8. Escreva acentos diretamente (não use `ç` em texto) |

## Comentários: o tom do projeto

- Os comentários explicam **o porquê**, não o quê. Costumam registrar:
  - a decisão de produto ou de UX ("redesenhar no meio do Tab destrói o foco");
  - o **incidente real** que motivou a regra (um processo em que o endereço veio cortado, a borda de 0,5pt que sumia no PDF, a faixa cinza ao colar no SEI);
  - a compatibilidade com Word, Athos, SEI, Excel ou Chrome no Windows;
  - o que **não** fazer, e por quê.
- **Tom:** didático e conversacional, em frases completas. Expressões recorrentes: "nada é corrigido em silêncio", "nunca inventa desempate sem dado", "duplicado de propósito".
- **Ao remover um comportamento**, deixe um comentário curto explicando a remoção, se ela não for óbvia.

## Princípios de comportamento

1. **Nada em silêncio.** Toda correção automática, descarte ou suposição gera aviso visível, com o texto original.
2. **O dado do usuário não sai da máquina.** As exceções são as ferramentas com nuvem, e isso precisa ficar claro na interface.
3. **Mesmo arquivo, mesmo resultado.** Nada de aleatoriedade nem dependência de horário, exceto a data do documento, que é sempre editável.
4. **Conferência antes da publicação.** Ofereça prévia, edição e avisos antes de gerar o documento final.
5. **Tolerância na entrada, rigor na saída.** Aceite variações de cabeçalho, acento, separador e formato de data. Gere saída no formato exato exigido (Athos, Hércules, edital).

## Textos de interface

- **Bloco de ajuda:** "Como funciona" (`.step-info`, com `step-num` "i"). Passos com títulos curtos no imperativo ("Envie o Relatório de Inscritos") ou nominais ("Dados do edital").
- **Rótulos de botão:** "Escolher arquivo", "Processar e cruzar tabelas", "Copiar", "Copiar tudo", "Baixar CSV (UTF-8)", "Salvar em PDF", "Colar tabela manualmente", "Salvar rascunho".
- **Placeholders:** usam dados **fictícios** (ex.: "MARIA DA SILVA", "FULANO DE TAL", `1111111`). Nunca use dados reais.
- **Avisos:** "**Atenção:** …", com o que fazer a seguir.
- **Nomes de sistemas:** sempre com a grafia oficial: SEI, Athos, Hércules, Fábrica de Provas.

## Testes

- **Não há suíte automatizada.** Alguns arquivos exportam funções (`module.exports`, `window.__ED_TEST__`) e os comentários citam testes em Node ou jsdom, mas esses testes não estão no repositório.
- **Validação mínima:** `node --check <arquivo>.js`, quando houver Node.
- **Teste manual:** abrir a página (`file://` ou `python3 -m http.server`) com arquivos **fictícios** e cobrir três caminhos: o feliz, o de erro (arquivo vazio, coluna faltando, linha irreconhecível) e o de borda (empate, cota desconhecida, nome com acento ou apóstrofo).
