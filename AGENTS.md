# AGENTS.md — Portal de ferramentas da DSERFTA (TJPR)

> Instruções para **qualquer assistente de IA** que trabalhe neste repositório (Claude Code, Codex, Cursor, Copilot, Gemini…).
> **Leia este arquivo inteiro antes de qualquer ação.** A documentação completa está em [`docs/`](docs/README.md).

## O projeto em 30 segundos

- Portal de ferramentas web internas da **DSERFTA** (Divisão de Seleção de Estagiários e Residentes, Formação de Talentos e Ambientação), que fica na SGP/CDHO do **Tribunal de Justiça do Estado do Paraná**.
- Apoia o trabalho operacional dos processos seletivos de **estágio** e **residência**. As ferramentas:
  - leem PDFs do **SEI** e planilhas da **Fábrica de Provas**;
  - cruzam dados de candidatos;
  - geram editais em blocos para colar no **Athos**, PDFs, listas de e-mail e CSVs para importar no **Hércules**.
- **HTML + CSS + JavaScript puros**, sem build, framework ou npm.
  - Cada ferramenta é uma página `.html` + um `<nome>_logic.js`.
  - Todas se apoiam numa base comum: `core.css`, `core.js` (`TJPRCore`), `layout.js` e o registro `ferramentas.js`.
- Publicado pelo **GitHub Pages**, a partir de um **repositório público**. Também precisa funcionar aberto direto do disco (`file://`).
- **Não é sistema oficial do TJPR.** Tudo está "em fase de testes", e quem usa confere os dados antes de lançar em sistemas oficiais.
- Versão atual: `VERSAO_APP` em `ferramentas.js`. Na última revisão destes docs, era a 3.24.

## Protocolo: ler antes de agir

1. Leia [`docs/README.md`](docs/README.md) e siga o **mapa de leitura por tarefa** que está lá.
2. Antes de mexer numa ferramenta, leia a ficha dela em [`docs/catalogo-ferramentas.md`](docs/catalogo-ferramentas.md). Depois leia o `_logic.js` dela, começando pelo cabeçalho, que traz o índice de seções `A) B) C)…`.
3. Antes de escrever qualquer função utilitária, procure em [`docs/core-api.md`](docs/core-api.md). Ela provavelmente já existe em `core.js` ou tem uma **implementação de referência** em outro arquivo.
4. Antes de criar interface, consulte [`docs/componentes-ui.md`](docs/componentes-ui.md) e [`docs/identidade-visual.md`](docs/identidade-visual.md).
5. Antes de corrigir algo, veja se o problema já está em [`docs/backlog-tecnico.md`](docs/backlog-tecnico.md).
6. Para regra de negócio (cotas, desempate, Athos, Hércules, SEI), consulte [`docs/dominio.md`](docs/dominio.md). Se não estiver documentada, **pergunte ao usuário** em vez de supor.

## Regras inegociáveis

1. **Sem build e sem dependências externas em tempo de execução.**
   - Proibido: CDN, Google Fonts, `@import`, npm, SDK carregado por URL, `<img>` ou `<script>` com `http(s)://`.
   - As bibliotecas ficam locais, em `vendor/`.
   - Exceções que já existem e estão documentadas: `fetch` à API REST do Supabase (Editor do Fluxo e Consulta de Vagas) e o iframe do jogo Arkanoia.
   - **Dados de candidatos nunca vão para a nuvem.** O Resultado Final deixou de gravar no Supabase na v3.24 justamente por isso.
2. **Reaproveite antes de criar.**
   - Use `TJPRCore`, as classes do `core.css` e o registro do `ferramentas.js`.
   - Não crie mais uma cópia de um utilitário que já existe: siga a implementação de referência indicada em `docs/core-api.md`.
3. **Nada é corrigido em silêncio.** Todo ajuste automático, valor não reconhecido, linha descartada ou empate resolvido gera **aviso visível**, com o texto exato da linha quando for o caso. Nenhuma operação falha sem mensagem.
4. **Identidade visual do TJPR.**
   - Use só as cores do Manual de Marca (tokens em `:root` do `core.css`, mais as gradações oficiais) e as pilhas de fonte do `core.css`.
   - O cabeçalho institucional é montado pelo `layout.js`.
   - É **proibido** criar logos para setores.
5. **Rodapé padrão em toda página**, com o texto exato que está em [`.claude/rules/paginas-html.md`](.claude/rules/paginas-html.md). O Resultado Final tem uma variante própria do aviso.
6. **Tudo em português do Brasil:** identificadores, comentários, mensagens e textos de interface.
7. **Escape tudo** que vier de arquivo ou do usuário antes de inserir no HTML.
   - `TJPRCore.escapeHtml` serve para texto **e** para valor de atributo: escapa também as aspas desde a v3.24.
   - Os `esc` locais das páginas que não carregam o core (Edital, Fluxo, Vagas, Resultado Final) **não** escapam aspas. Nelas, para atributo, use o `escAttr` da própria página.
8. **Reserva (cota):** reconheça o texto **sempre** com `TJPRCore.reconhecerReserva`, o reconhecimento único do portal. Nunca crie outro mapa de termos numa ferramenta.
9. **Não edite à mão arquivos gerados:** `edital_unidades_sei.js`, `edital_modelos.js`, `vendor/*` e `tjpr_logo.js`. Veja em `docs/arquitetura.md` como cada um é produzido. Arquivos tirados de uso vão para `deprecados/` (com um `LEIAME.md` explicando), e nada pode referenciá-los.
10. **Registro e versão.**
   - Ferramenta nova entra em `FERRAMENTAS`, no `ferramentas.js`.
   - Toda mudança publicada atualiza `VERSAO_APP` e ganha uma entrada **no topo** do `CHANGELOG` (`changelog.js`).
11. **Repositório público.** Nunca grave no repositório, nem nos docs, senhas, PINs, dados reais de candidatos, planilhas reais ou chaves não publicáveis.
12. **Preserve o estilo do arquivo que está editando:** dialeto ES5 ou ES6, aspas, espaçamento e fim de linha (CRLF onde já existe).
13. **Não altere arquivos sem pedido do usuário.** Em mudanças que envolvem regra de negócio ou vários arquivos, apresente um plano antes.

## Fluxo de trabalho

```
ler docs → ler o código envolvido → planejar (perguntar o que for decisão do usuário)
→ implementar reaproveitando → revisar → versionar → atualizar os docs afetados
```

- **Revisar:** checklist em [`.claude/skills/revisar/SKILL.md`](.claude/skills/revisar/SKILL.md). Vale para qualquer IA, não só para o Claude.
- **Versionar:** [`docs/processo-de-versao.md`](docs/processo-de-versao.md).
- **Ferramenta nova:** roteiro e modelos em [`.claude/skills/nova-ferramenta/`](.claude/skills/nova-ferramenta/SKILL.md).
- **Docs desatualizados:** roteiro em [`.claude/skills/atualizar-docs/SKILL.md`](.claude/skills/atualizar-docs/SKILL.md).

## Mapa da documentação

| Documento | Conteúdo |
|---|---|
| [`docs/README.md`](docs/README.md) | Índice e mapa de leitura por tarefa |
| [`docs/arquitetura.md`](docs/arquitetura.md) | Arquivos, montagem das páginas, registro, bibliotecas, persistência, como rodar |
| [`docs/core-api.md`](docs/core-api.md) | API do `TJPRCore` e globais, mais as **implementações de referência** dos utilitários |
| [`docs/componentes-ui.md`](docs/componentes-ui.md) | Catálogo das classes do `core.css`, com trechos de HTML |
| [`docs/catalogo-ferramentas.md`](docs/catalogo-ferramentas.md) | Ficha de cada ferramenta: entradas, saídas, regras e armadilhas |
| [`docs/dominio.md`](docs/dominio.md) | Glossário, fluxo do processo seletivo, cotas, desempate, Athos, Hércules |
| [`docs/identidade-visual.md`](docs/identidade-visual.md) | Manual de Marca do TJPR e como o portal o aplica |
| [`docs/nuvem-supabase.md`](docs/nuvem-supabase.md) | Persistência compartilhada: tabelas, contratos, SQL, cuidados |
| [`docs/estilo-de-codigo.md`](docs/estilo-de-codigo.md) | Convenções de JS, HTML, CSS, comentários e textos |
| [`docs/processo-de-versao.md`](docs/processo-de-versao.md) | Numeração, changelog, publicação por upload no GitHub |
| [`docs/backlog-tecnico.md`](docs/backlog-tecnico.md) | Problemas conhecidos e oportunidades de melhoria |

## Publicação (como o usuário trabalha)

- O usuário **não usa git na linha de comando**. Ele baixa o .zip do GitHub, trabalha localmente e **sobe os arquivos alterados pelo site do GitHub**.
- Ao concluir uma tarefa que altera arquivos, entregue:
  1. a **mensagem de commit** sugerida;
  2. a **lista exata de arquivos** novos ou alterados, com o caminho, para upload;
  3. os arquivos a **excluir** no site, se houver.

  Detalhes em [`docs/processo-de-versao.md`](docs/processo-de-versao.md).
- O usuário alterna entre várias máquinas e não sincroniza sessões de IA. **Todo conhecimento durável vai para `docs/`**, nunca só para a memória local da ferramenta de IA.
