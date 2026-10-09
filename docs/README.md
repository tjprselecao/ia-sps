# Documentação do portal de ferramentas da DSERFTA (TJPR)

> **Base revisada em 2026-10-09, contra a versão 3.24** (`VERSAO_APP` em `ferramentas.js`).
> Se a versão atual for bem mais nova, rode `/atualizar-docs` (Claude Code) ou siga `.claude/skills/atualizar-docs/SKILL.md` antes de confiar em detalhes.

Esta pasta é a **memória do projeto**. O portal é mantido com apoio de IA, a partir de várias máquinas e sem sessões sincronizadas. Por isso, tudo o que uma pessoa ou IA precisa saber para continuar o trabalho com segurança está aqui, e não na cabeça de quem fez nem na memória local de uma ferramenta.

- Ponto de entrada para IAs: [`../AGENTS.md`](../AGENTS.md), com as regras inegociáveis.
- Claude Code: [`../.claude/CLAUDE.md`](../.claude/CLAUDE.md), mais as regras em `.claude/rules/` e as skills em `.claude/skills/`.

## Ordem de leitura para quem chega agora

1. [`arquitetura.md`](arquitetura.md): como o portal é montado.
2. [`dominio.md`](dominio.md): o vocabulário do processo seletivo.
3. [`catalogo-ferramentas.md`](catalogo-ferramentas.md): o que cada ferramenta faz.
4. [`core-api.md`](core-api.md): o que já existe para reaproveitar.
5. Os demais, conforme a tarefa (tabela abaixo).

## Mapa de leitura por tarefa

| Vou… | Leia antes |
|---|---|
| **Criar uma ferramenta nova** | `arquitetura.md` → `core-api.md` → `componentes-ui.md` → `identidade-visual.md` → `estilo-de-codigo.md` → skill `.claude/skills/nova-ferramenta/` |
| **Corrigir ou alterar uma ferramenta** | a ficha dela em `catalogo-ferramentas.md` → `dominio.md` (regras envolvidas) → `backlog-tecnico.md` (o problema já é conhecido?) → o `_logic.js` inteiro |
| **Mudar o texto de um edital ou documento** | `dominio.md` § Athos e documentos → ficha da ferramenta → confirmar a redação com o usuário |
| **Mexer em leitura de PDF ou planilha** | `core-api.md` § Planilhas e PDFs → `dominio.md` § Fábrica de Provas / SEI |
| **Mexer em cotas, reservas, desempate ou Hércules** | `dominio.md` § Reservas e § Desempate → `core-api.md` § Reservas (há vocabulários divergentes) |
| **Mexer no visual ou criar componente** | `identidade-visual.md` → `componentes-ui.md` → `.claude/rules/estilo-visual.md` |
| **Mexer em Fluxo, Vagas ou Resultado Final (nuvem)** | `nuvem-supabase.md` → ficha da ferramenta |
| **Levar utilitários duplicados para o `core.js`** | `core-api.md` § Implementações de referência → `backlog-tecnico.md` → `estilo-de-codigo.md` |
| **Publicar uma versão** | `processo-de-versao.md` (ou skill `/versionar`) |
| **Revisar antes de entregar** | `.claude/skills/revisar/SKILL.md` |

## Índice

| Documento | Conteúdo |
|---|---|
| [`arquitetura.md`](arquitetura.md) | Árvore de arquivos, montagem das páginas pelo `layout.js`, registro, bibliotecas, persistência, PDF, hospedagem, como rodar localmente, arquivos gerados |
| [`core-api.md`](core-api.md) | API do `TJPRCore`, globais do layout e do registro, e **implementações de referência** dos utilitários espalhados pelos `_logic.js` |
| [`componentes-ui.md`](componentes-ui.md) | Tokens e classes do `core.css`, com trechos de HTML prontos |
| [`catalogo-ferramentas.md`](catalogo-ferramentas.md) | Ficha de cada página: arquivos, prefixo, entradas, saídas, regras, persistência e armadilhas |
| [`dominio.md`](dominio.md) | Glossário (SEI, Athos, Hércules, Fábrica de Provas, Ponto XX), fluxo do processo seletivo, reservas, desempate, formatos, blocos do Athos |
| [`identidade-visual.md`](identidade-visual.md) | Manual de Marca do TJPR (cores, gradações, tipografia, logo, ícones) e como o portal o aplica |
| [`nuvem-supabase.md`](nuvem-supabase.md) | Tabelas, padrão de acesso REST, contratos de dados, SQL, segurança e LGPD |
| [`estilo-de-codigo.md`](estilo-de-codigo.md) | Convenções de JS, HTML, CSS, nomes, comentários e textos de interface |
| [`processo-de-versao.md`](processo-de-versao.md) | Numeração, changelog, mensagem de commit e upload pelo site do GitHub |
| [`backlog-tecnico.md`](backlog-tecnico.md) | Bugs latentes, duplicações, inconsistências e melhorias sugeridas (nada aplicado ainda) |
| [`skill-claude-ai/`](skill-claude-ai/tjpr-ferramentas-html/SKILL.md) | Versão atualizada da skill `tjpr-ferramentas-html`, para reenviar à conta do claude.ai |

## Como manter estes documentos

- **Quando atualizar:** sempre que uma mudança no código alterar algo descrito aqui (ferramenta nova, entrada ou saída, regra, função do core, classe do CSS). No Claude Code, a skill `/atualizar-docs` faz a auditoria.
- **Referências:** cite **arquivo + nome da função ou constante**, e não número de linha, que envelhece a cada edição.
- **Repositório público:** sem senhas, PIN, chaves, dados de candidatos nem nomes de servidores. A única exceção é o crédito exigido no rodapé.
- **GitHub Pages / Jekyll:** os `.md` desta pasta passam pelo processador Liquid do Pages.
  - **Não escreva chave + porcentagem** (a sequência que abre uma tag Liquid). Um erro de tag derruba a publicação do site inteiro.
  - **Evite chaves duplas** (`{` `{`): o texto entre elas some na versão publicada.
- **Idioma:** português do Brasil, tom direto. Use tabelas para listas de referência.
- **Backlog:** itens resolvidos saem de `backlog-tecnico.md` e vão para a seção "Resolvidos", com a versão em que foram corrigidos.

## Skill do claude.ai

A pasta [`skill-claude-ai/tjpr-ferramentas-html/`](skill-claude-ai/tjpr-ferramentas-html/SKILL.md) traz a versão atualizada da skill homônima da conta do claude.ai, usada em conversas fora deste repositório.

Para atualizar a conta:
1. Compacte a pasta `tjpr-ferramentas-html` em um `.zip`.
2. Envie o arquivo na área de Skills do claude.ai, substituindo a versão antiga.

Dentro deste repositório, a skill da conta **não** prevalece sobre `AGENTS.md`, `.claude/` e `docs/`.
