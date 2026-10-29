# Processo de versão e publicação

## Onde fica a versão

- **`VERSAO_APP`** em `ferramentas.js` é a versão exibida no canto do cabeçalho (botão "v. x.y.z").
- **`CHANGELOG`** em `changelog.js` é o histórico exibido ao clicar na versão. A **primeira** entrada deve ter `v` igual a `VERSAO_APP`, e o cabeçalho marca essa entrada como "em uso".

## Numeração (deduzida do histórico)

| Tipo | Quando | Exemplos do histórico |
|---|---|---|
| **patch** `x.y.z` | correção, ajuste de texto, layout ou leitura; nada novo para o usuário aprender | 3.22.1 (Bloco 3 só com o número), 3.20.1–3.20.3 (leitura do PDF do Ponto 26) |
| **minor** `x.y` | funcionalidade nova numa ferramenta, ou ferramenta nova | 3.22 (classificação manual no Ponto 20), 3.15 (Consulta de Vagas) |
| **major** `x` | reorganização do portal ou marco. **Só com confirmação do usuário** | 2.0 (portal em seções), 3.0 (gerador do ensalamento) |

- Um minor sem patch é escrito `3.23`, e não `3.23.0`. Algumas versões antigas usaram `.0`; não repita.
- Várias mudanças pequenas publicadas juntas formam **uma** entrada, com vários itens.

## Como escrever a entrada do changelog

```js
const CHANGELOG = [
  { v:"3.24", data:"AAAA-MM-DD", titulo:"Ferramenta: o que mudou, em uma linha",
    itens:["Frase completa, voltada a quem usa a ferramenta.",
           "Rótulos da interface entre aspas: o botão \"Copiar tabela\" passa a…"] },
  …entradas anteriores…
];
```

- **`titulo`:** "Nome curto da ferramenta: mudança". Exemplos: "Ponto 20: …", "Edital de Abertura: …", "Convocação da Residência: …".
- **`itens`:** opcional, mas recomendado.
  - Descreve **o que muda para o usuário**, e não detalhes de código.
  - Tempo presente ou "passa a…".
  - Menciona avisos novos e o comportamento antigo que foi mantido.
- **`data`:** `AAAA-MM-DD`, a data da publicação. O painel exibe `DD/MM/AAAA` sem passar por `Date()`, para evitar o fuso.
- **Fim de linha:** `changelog.js` está em **CRLF**. Mantenha.

## Mensagem de commit

O usuário publica pelo site do GitHub. Na caixa "Commit changes", use:

```
v3.24 - Ponto 20: o que mudou, em uma linha

- item 1 do changelog
- item 2 do changelog
```

O título do commit reproduz o `titulo` do changelog, precedido da versão.

## Publicação pelo site do GitHub (sem git local)

1. **Lista de arquivos alterados.** Se não houver lista da sessão, um bom indício é a data de modificação: os arquivos extraídos do .zip têm todos a mesma data, e o que foi editado depois fica mais novo. No macOS/Linux:
   ```
   find . -type f -newer index.html -not -path './.git/*'
   ```
   Se o próprio `index.html` foi alterado, use outro arquivo não tocado como referência. **Arquivo movido** mantém a data antiga e não aparece nessa busca: liste-o à mão, como upload no caminho novo e exclusão no antigo.
2. No GitHub, abra o repositório e use **Add file → Upload files**. Arraste os arquivos ou **pastas**: arrastar uma pasta mantém a estrutura, o que vale para `docs/` e `.claude/`. Arquivos com o mesmo caminho são **substituídos**.
3. **Exclusões não acontecem por upload.** Abra o arquivo no site e use o menu "…" → **Delete file**, um a um.
4. Preencha a mensagem de commit (modelo acima) e confirme na branch principal.
5. Espere o GitHub Pages republicar (alguns minutos, acompanhando a aba **Actions**, se estiver visível). Depois abra o portal, force a atualização (Ctrl+F5) e confira a versão no cabeçalho.
6. **Pastas ocultas:** no Finder e no Explorer, `.claude/` não aparece por padrão. No macOS, use Cmd+Shift+. para exibir.

## Antes de publicar

- [ ] `/revisar` (ou o checklist em `.claude/skills/revisar/SKILL.md`) passou.
- [ ] `VERSAO_APP` é igual a `CHANGELOG[0].v`.
- [ ] A `descricao` da ferramenta no registro ainda corresponde ao que ela faz.
- [ ] Os docs afetados foram atualizados (`/atualizar-docs`).
- [ ] Nenhum arquivo de dados reais (planilha, PDF, backup .json) vai junto no upload.
