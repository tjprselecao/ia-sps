
(function(){
  const fileBtn1 = document.getElementById('p20FileBtn1');
  const fileInput1 = document.getElementById('p20Tabela1File');
  const fileName1 = document.getElementById('p20FileName1');
  const fileBtn2 = document.getElementById('p20FileBtn2');
  const fileInput2 = document.getElementById('p20Tabela2File');
  const fileName2 = document.getElementById('p20FileName2');
  const maxInput = document.getElementById('p20MaxInput');
  const processBtn = document.getElementById('p20ProcessBtn');
  const resultArea = document.getElementById('p20ResultArea');
  const downloadRow = document.getElementById('p20DownloadRow');
  const copyBtn = document.getElementById('p20CopyBtn');
  const downloadBtn = document.getElementById('p20DownloadBtn');
  const countNote = document.getElementById('p20CountNote');
  const stampWrap = document.getElementById('p20StampWrap');
  const stampBadge = document.getElementById('p20StampBadge');
  const stampText = document.getElementById('p20StampText');

  const OUT_COLS = ["ORDEM","INSCRIÇÃO","NOME","NOTA","RESERVA"];
  // colunas efetivamente exibidas/exportadas — RESERVA é suprimida quando
  // nenhum aprovado é cotista e todos os nomes foram cruzados (ver processFiles)
  let activeCols = OUT_COLS;

  // Cada código de reserva aceita vários rótulos possíveis, porque a Fábrica de
  // Provas nem sempre grava o texto exatamente igual.
  const RESERVA_MAP = [
    { code: '2.1.1', termos: ['PRETO OU PARDO','PRETA OU PARDA','PRETO','PARDO','PRETA','PARDA','NEGRO','NEGRA'] },
    { code: '2.1.2', termos: ['PESSOA COM DEFICIENCIA','PESSOA COM DEFICIENCIA (PCD)','PCD','DEFICIENTE','DEFICIENCIA'] },
    { code: '2.1.3', termos: ['INDIGENA'] },
    { code: '2.1.4', termos: ['VULNERABILIDADE SOCIAL','HIPOSSUFICIENTE','HIPOSSUFICIENCIA'] }
  ];

  // Valores que significam "não é cotista" — ausência de reserva, não erro.
  const SEM_RESERVA = ['-','--','N/A','NA','NAO','NAO SE APLICA','NENHUMA','NENHUM',
                       'AMPLA CONCORRENCIA','AMPLA CONCORRENCIA (AC)','AC'];

  let outputRows = [];

  // Classificação informada manualmente (Passo 1, alternativa à Tabela 1):
  // cada linha = { id, insc, nome, nota, reserva }, na ordem de classificação.
  let modoManual = false;
  let manualRows = [];
  let seqManual = 1;

  fileBtn1.addEventListener('click', () => fileInput1.click());
  fileBtn2.addEventListener('click', () => fileInput2.click());

  fileInput1.addEventListener('change', () => {
    fileName1.textContent = (fileInput1.files && fileInput1.files[0]) ? fileInput1.files[0].name : 'Nenhum arquivo selecionado';
    checkReady();
  });
  fileInput2.addEventListener('change', () => {
    fileName2.textContent = (fileInput2.files && fileInput2.files[0]) ? fileInput2.files[0].name : 'Nenhum arquivo selecionado';
    checkReady();
  });
  maxInput.addEventListener('input', checkReady);

  /* Quantidade em branco significa "todos os classificados" — devolve null.
     Qualquer coisa que não seja um inteiro positivo é entrada inválida, e aí o
     botão continua desabilitado em vez de a ferramenta adivinhar. */
  function limiteInformado(){
    const v = maxInput.value.trim();
    if(v === '') return { vazio:true, valor:null, ok:true };
    const ok = /^\d+$/.test(v) && parseInt(v,10) > 0;
    return { vazio:false, valor: ok ? parseInt(v,10) : null, ok:ok };
  }

  function checkReady(){
    const hasT1 = modoManual ? manualPronta() : (fileInput1.files && fileInput1.files[0]);
    const hasT2 = fileInput2.files && fileInput2.files[0];
    processBtn.disabled = !(hasT1 && hasT2 && limiteInformado().ok);
  }

  function normHeader(h){
    return String(h===undefined||h===null?'':h).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/\s+/g,' ').trim();
  }
  // normName usa o normalizador compartilhado do TJPRCore; o wrapper String(s||'')
  // garante que valores vindos de células de planilha (que podem não ser string)
  // não quebrem a normalização.
  const { escapeHtml, csvEscape } = TJPRCore;
  function normName(s){ return TJPRCore.normName(String(s || '')); }
  function normInscricao(v){
    if(v === null || v === undefined) return '';
    let s = String(v).trim();
    if(s === '') return '';
    s = s.replace(/\.0+$/,'');
    s = s.replace(/[^\d]/g,'');
    return s;
  }
  function findCol(sampleRow, candidates){
    const keys = Object.keys(sampleRow || {});
    for(const cand of candidates){
      const idx = keys.findIndex(k => normHeader(k) === normHeader(cand));
      if(idx !== -1) return keys[idx];
    }
    return null;
  }
  // A célula "Reserva especial" pode trazer MAIS DE UM rótulo separado por
  // vírgula (e às vezes o mesmo rótulo repetido, ex.: "Preto ou pardo, Preto ou
  // pardo"). Por isso a célula é quebrada em partes, cada parte é normalizada e
  // mapeada individualmente, com remoção de duplicatas. Valores que não batem
  // com nenhum termo conhecido são devolvidos em `desconhecidos` para virarem
  // aviso na tela — nunca são descartados em silêncio.
  // Também aceita os próprios códigos (2.1.1 a 2.1.4), inclusive separados só
  // por espaço — é o que se digita na coluna RESERVA da classificação manual.
  function mapReserva(v){
    const partes = [];
    String(v === undefined || v === null ? '' : v)
      .split(/[,;\/|]+/)
      .map(normHeader)
      .filter(p => p !== '')
      .forEach(p => {
        if(/^\d\.\d\.\d(?:\s+\d\.\d\.\d)+$/.test(p)) p.split(/\s+/).forEach(c => partes.push(c));
        else partes.push(p);
      });
    const codes = [];
    const desconhecidos = [];
    partes.forEach(p => {
      if(SEM_RESERVA.indexOf(p) !== -1) return;
      const hit = RESERVA_MAP.find(r => r.code === p || r.termos.indexOf(p) !== -1);
      if(hit){
        if(codes.indexOf(hit.code) === -1) codes.push(hit.code);
      } else if(desconhecidos.indexOf(p) === -1){
        desconhecidos.push(p);
      }
    });
    codes.sort();
    return { code: codes.join(', '), desconhecidos: desconhecidos };
  }
  function formatNota(v){
    if(v === null || v === undefined || String(v).trim()==='') return { ok:true, value:'' };
    const num = parseFloat(String(v).trim().replace(',', '.'));
    if(isNaN(num)) return { ok:false, value:String(v) };
    return { ok:true, value:num.toFixed(2).replace('.', ',') };
  }


  function readWorkbookFile(file){
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = function(e){
        try{
          const data = new Uint8Array(e.target.result);
          const wb = XLSX.read(data, { type: 'array' });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
          resolve(rows);
        } catch(err){
          reject(err);
        }
      };
      reader.onerror = function(){ reject(new Error('Falha ao ler o arquivo.')); };
      reader.readAsArrayBuffer(file);
    });
  }

  processBtn.addEventListener('click', async function(){
    processBtn.disabled = true;
    processBtn.textContent = 'Processando...';
    try{
      await processFiles();
    } finally {
      processBtn.textContent = 'Processar e cruzar tabelas';
      checkReady();
    }
  });

  // Fluxo original: lê o Relatório de Classificação Final (.xlsx) e devolve os
  // classificados (não-REPROVADO) ordenados pela CLASSIFICAÇÃO. Devolve null
  // quando o erro já foi avisado ao usuário.
  async function classificadosDaPlanilha(){
    let t1;
    try{
      t1 = await readWorkbookFile(fileInput1.files[0]);
    } catch(err){
      alert('Não foi possível ler o arquivo da Tabela 1. Verifique se é um arquivo .xlsx/.xls/.csv válido, exportado da Fábrica de Provas (Relatório de Classificação Final).');
      return null;
    }
    if(!t1 || t1.length === 0){
      alert('A Tabela 1 (Classificação Final) está vazia ou não foi possível interpretar nenhuma linha.');
      return null;
    }

    const colClass = findCol(t1[0], ['CLASSIFICAÇÃO','CLASSIFICACAO']);
    const colInsc1 = findCol(t1[0], ['INSCRIÇÃO','INSCRICAO']);
    const colNome1 = findCol(t1[0], ['NOME']);
    const colFinal = findCol(t1[0], ['FINAL']);
    // Opcional: o Relatório de Classificação Final também traz uma coluna
    // RESERVA. Ela é usada como conferência cruzada / rede de segurança.
    const colReserva1 = findCol(t1[0], ['RESERVA']);

    if(!colClass || !colInsc1 || !colNome1 || !colFinal){
      alert('Não foi possível identificar as colunas obrigatórias da Tabela 1 (CLASSIFICAÇÃO, INSCRIÇÃO, NOME, FINAL). Colunas encontradas no arquivo: ' + Object.keys(t1[0]).join(', '));
      return null;
    }

    let reprovadosCount = 0;
    let classErrors = [];
    let filtered = [];

    t1.forEach(r => {
      const classRaw = String(r[colClass]===undefined||r[colClass]===null?'':r[colClass]).trim();
      if(classRaw === '') return; // linha vazia, ignora silenciosamente
      const classNorm = normHeader(classRaw);
      if(classNorm === 'REPROVADO' || classNorm === 'DESCLASSIFICADO' || classNorm === 'ELIMINADO'){
        reprovadosCount++;
        return;
      }
      const classNum = parseInt(classRaw, 10);
      if(isNaN(classNum)){
        classErrors.push(classRaw + ' — ' + (r[colNome1] || '(nome não identificado)'));
        return;
      }
      filtered.push({
        ordem: classNum,
        insc: r[colInsc1],
        nome: r[colNome1],
        final: r[colFinal],
        reserva1: colReserva1 ? r[colReserva1] : ''
      });
    });

    if(filtered.length === 0){
      alert('Nenhum candidato classificado (não-REPROVADO) foi encontrado na Tabela 1. Verifique o arquivo enviado.');
      return null;
    }

    filtered.sort((a,b) => a.ordem - b.ordem);
    return { filtered, reprovadosCount, classErrors };
  }

  // Classificação informada à mão: a ORDEM é a das linhas da tabela. Cada
  // linha é cruzada com a Tabela 2 já aqui (e não no mapeamento final) porque
  // a data de nascimento dela é necessária para o desempate antes do limite.
  function classificadosManuais(t2){
    const info = { inscCompletadas:[], inscDivergencias:[], ordemErros:[],
                   desempates:[], empatesSemData:[], empatesConfirmados:[] };
    const nomeT2 = m => String(m[t2.colNome2] || '').toUpperCase();
    const inscT2 = m => normInscricao(m[t2.colInsc2]);

    const lista = linhasValidas().map(r => {
      const nome = colapsa(r.nome).toUpperCase();
      const inscInf = normInscricao(r.insc);
      const porInsc = inscInf ? (t2.lookupByInsc[inscInf] || null) : null;
      const porNome = t2.lookupByName[normName(nome)] || null;
      let match = null, insc = inscInf;
      if(inscInf){
        if(porInsc && normName(porInsc[t2.colNome2]) === normName(nome)){
          match = porInsc;
        } else if(porInsc && porNome){
          match = porNome; insc = inscT2(porNome);
          info.inscDivergencias.push(nome + ': a inscrição informada (' + inscInf + ') é de ' + nomeT2(porInsc) +
            ' na Tabela 2 — usada a inscrição ' + insc + ', encontrada pelo nome');
        } else if(porInsc){
          match = porInsc;
          info.inscDivergencias.push(nome + ': na Tabela 2, a inscrição ' + inscInf + ' está em nome de ' + nomeT2(porInsc) +
            ' — confira se é a mesma pessoa');
        } else if(porNome){
          match = porNome; insc = inscT2(porNome);
          info.inscDivergencias.push(nome + ': a inscrição informada (' + inscInf + ') não existe na Tabela 2 — usada a inscrição ' +
            insc + ', encontrada pelo nome');
        }
      } else if(porNome){
        match = porNome; insc = inscT2(porNome);
        info.inscCompletadas.push(nome + ' — ' + insc);
      }
      const nasc = (match && t2.colNasc2) ? parseNascimento(match[t2.colNasc2]) : null;
      return { nome, insc, final: parseNota(r.nota), reserva1: r.reserva, match, nasc };
    });

    // A ordem informada é respeitada; só avisa onde ela contraria a nota.
    for(let i = 1; i < lista.length; i++){
      if(lista[i].final > lista[i-1].final && !mesmaNota(lista[i].final, lista[i-1].final)){
        info.ordemErros.push('Linha ' + (i+1) + ' — ' + lista[i].nome + ' (' + fmtNotaNum(lista[i].final) + ') está abaixo de ' +
          lista[i-1].nome + ' (' + fmtNotaNum(lista[i-1].final) + ')');
      }
    }

    // Desempate: em cada bloco de linhas consecutivas com a mesma nota, o mais
    // velho vem primeiro (regra do TJPR). Compara as DATAS, nunca a idade em
    // anos — o resultado não depende do dia em que a ferramenta é usada. Sem
    // data para algum dos empatados, a ordem informada é mantida e vira aviso.
    const descreve = arr => arr.map(c => c.nome + ' (' + (c.nasc ? fmtData(c.nasc) :
      (c.match ? 'sem data de nascimento' : 'sem correspondência na Tabela 2')) + ')').join(', ');
    let i = 0;
    while(i < lista.length){
      let j = i + 1;
      while(j < lista.length && mesmaNota(lista[j].final, lista[i].final)) j++;
      if(j - i > 1){
        const bloco = lista.slice(i, j);
        const notaTxt = 'Nota ' + fmtNotaNum(bloco[0].final) + ': ';
        if(!t2.colNasc2){
          info.empatesSemData.push(notaTxt + bloco.map(c => c.nome).join(', ') +
            ' — o Relatório de inscritos não tem coluna de data de nascimento');
        } else if(bloco.some(c => !c.nasc)){
          info.empatesSemData.push(notaTxt + descreve(bloco));
        } else {
          const ordenado = bloco.map((c,k) => ({c,k}))
            .sort((a,b) => (a.c.nasc - b.c.nasc) || (a.k - b.k))
            .map(x => x.c);
          for(let k = 1; k < ordenado.length; k++){
            if(ordenado[k].nasc.getTime() === ordenado[k-1].nasc.getTime()){
              info.empatesSemData.push(notaTxt + ordenado[k-1].nome + ' e ' + ordenado[k].nome +
                ' nasceram no mesmo dia (' + fmtData(ordenado[k].nasc) + ') — mantida a ordem informada entre os dois');
            }
          }
          const mudou = ordenado.some((c,k) => c !== bloco[k]);
          if(mudou){
            lista.splice(i, j - i, ...ordenado);
            info.desempates.push(notaTxt + 'ordem ajustada para ' + descreve(ordenado));
          } else {
            info.empatesConfirmados.push(notaTxt + descreve(ordenado));
          }
        }
      }
      i = j;
    }

    const filtered = lista.map((c,k) => ({
      ordem: k + 1, insc: c.insc, nome: c.nome, final: c.final, reserva1: c.reserva1, match: c.match
    }));
    return { filtered, reprovadosCount: 0, classErrors: [], info };
  }

  async function processFiles(){
    let base = null;
    if(!modoManual){
      base = await classificadosDaPlanilha();
      if(!base) return;
    } else if(!manualPronta()){
      alert('A classificação manual ainda tem linhas sem nome ou sem nota válida. Complete ou exclua essas linhas antes de processar.');
      return;
    }

    let t2;
    try{
      t2 = await readWorkbookFile(fileInput2.files[0]);
    } catch(err){
      alert('Não foi possível ler o arquivo da Tabela 2. Verifique se é um arquivo .xlsx/.xls/.csv válido, exportado da Fábrica de Provas (Relatório de inscritos).');
      return;
    }
    if(!t2 || t2.length === 0){
      alert('A Tabela 2 (Relatório de inscritos) está vazia ou não foi possível interpretar nenhuma linha.');
      return;
    }

    const colInsc2 = findCol(t2[0], ['INSCRIÇÃO','INSCRICAO']);
    const colNome2 = findCol(t2[0], ['NOME']);
    const colReserva2 = findCol(t2[0], ['RESERVA ESPECIAL']);
    // Só a classificação manual usa a data de nascimento (desempate).
    const colNasc2 = findCol(t2[0], ['NASCIMENTO','DATA DE NASCIMENTO','DATA NASCIMENTO','DT NASCIMENTO','DT. NASCIMENTO']);

    if(!colInsc2 || !colNome2 || !colReserva2){
      alert('Não foi possível identificar as colunas obrigatórias da Tabela 2 (Inscrição, Nome, Reserva especial). Colunas encontradas no arquivo: ' + Object.keys(t2[0]).join(', '));
      return;
    }

    // lookup Tabela 2: por inscrição (chave principal) e por nome normalizado (reserva)
    const lookupByInsc = {};
    const lookupByName = {};
    t2.forEach(r => {
      const insc = normInscricao(r[colInsc2]);
      if(insc && !lookupByInsc[insc]) lookupByInsc[insc] = r;
      const nome = normName(r[colNome2]);
      if(nome && !lookupByName[nome]) lookupByName[nome] = r;
    });

    if(modoManual){
      base = classificadosManuais({ lookupByInsc, lookupByName, colInsc2, colNome2, colNasc2 });
    }
    const filtered = base.filtered;
    // nas mensagens, a "Tabela 1" é a classificação digitada/colada
    const rotT1 = modoManual ? 'classificação manual' : 'Tabela 1';

    // null = quantidade não informada: entram todos os classificados
    const maxNum = limiteInformado().valor;

    let notaErrors = [];
    const totalDisponivel = filtered.length;
    const limited = (maxNum === null) ? filtered.slice() : filtered.slice(0, maxNum);

    let unmatched = [];
    let reservaErrors = [];
    let reservaDivergencias = [];

    outputRows = limited.map(r => {
      // a classificação manual já chega cruzada (ver classificadosManuais)
      let match = ('match' in r) ? r.match : null;
      if(!('match' in r)){
        match = lookupByInsc[normInscricao(r.insc)];
        if(!match) match = lookupByName[normName(r.nome)];
      }
      if(!match) unmatched.push(r.nome);

      const notaResult = formatNota(r.final);
      if(!notaResult.ok) notaErrors.push('Classificação ' + r.ordem + ' (' + r.nome + '): nota "' + notaResult.value + '" não numérica');

      const rotulo = 'Classificação ' + r.ordem + ' (' + r.nome + ')';
      const res2 = match ? mapReserva(match[colReserva2]) : { code:'', desconhecidos:[] };
      const res1 = mapReserva(r.reserva1);

      res2.desconhecidos.forEach(d => reservaErrors.push(rotulo + ': valor de reserva não reconhecido na Tabela 2 — "' + d + '"'));
      res1.desconhecidos.forEach(d => reservaErrors.push(rotulo + ': valor de reserva não reconhecido na ' + rotT1 + ' — "' + d + '"'));

      // Tabela 2 (Relatório de inscritos) é a fonte principal; a Tabela 1 serve
      // de rede de segurança quando a inscrição não foi encontrada ou veio vazia.
      // Na classificação manual, reserva em branco é "completar pela Tabela 2",
      // não "nenhuma" — por isso só há divergência quando algo foi digitado.
      const reserva = res2.code || res1.code;
      const conferir = modoManual ? String(r.reserva1 || '').trim() !== '' : true;
      if(match && conferir && res1.code !== res2.code){
        reservaDivergencias.push(rotulo + ': ' + rotT1 + ' indica "' + (res1.code || '(nenhuma)') +
          '" e Tabela 2 indica "' + (res2.code || '(nenhuma)') + '" — prevaleceu "' + (reserva || '(nenhuma)') + '"');
      }

      return {
        "ORDEM": r.ordem,
        "INSCRIÇÃO": r.insc,
        "NOME": String(r.nome || '').toUpperCase(),
        "NOTA": notaResult.value,
        "RESERVA": reserva,
        "_unmatched": !match
      };
    });

    // A coluna RESERVA só é suprimida quando está comprovadamente vazia: nenhum
    // aprovado cotista, todos os nomes cruzados com a Tabela 2, nenhum rótulo de
    // reserva não reconhecido e nenhuma divergência entre as duas tabelas. Em
    // qualquer dúvida, a coluna PERMANECE — é melhor uma coluna em branco a ser
    // conferida do que uma cota que desaparece do edital.
    const temReserva = outputRows.some(r => r["RESERVA"] !== '');
    const reservaSuprimida = !temReserva && unmatched.length === 0 &&
                             reservaErrors.length === 0 && reservaDivergencias.length === 0;
    activeCols = reservaSuprimida ? OUT_COLS.filter(c => c !== 'RESERVA') : OUT_COLS;

    renderResults({ reprovadosCount: base.reprovadosCount, classErrors: base.classErrors, notaErrors, unmatched,
                    totalDisponivel, maxNum, reservaSuprimida, reservaErrors, reservaDivergencias,
                    rotT1, manual: modoManual ? base.info : null });
  }

  // Lista de avisos no selo: título + até `limite` itens.
  function listaAviso(titulo, itens, limite){
    limite = limite || 8;
    return '<br>' + titulo + '<ul class="warn-list">' + itens.slice(0, limite).map(n => '<li>' + escapeHtml(n) + '</li>').join('') +
      (itens.length > limite ? '<li>… e mais ' + (itens.length - limite) + '</li>' : '') + '</ul>';
  }

  function renderResults(info){
    stampWrap.classList.add('show');
    const m = info.manual;
    const origem = m ? 'da classificação manual' : 'da Tabela 1';
    // Quantidade em branco não é erro, mas pede conferência: a lista saiu com
    // todo mundo, e é fácil não ser essa a intenção.
    const semLimite = info.maxNum === null;
    const avisoSemLimite = '<br><strong>A quantidade não foi informada</strong> — entraram <strong>todos os '
      + info.totalDisponivel + '</strong> candidato(s) classificado(s) ' + origem + '. Confira se é isso mesmo.';
    const temAvisoManual = !!m && (m.inscDivergencias.length > 0 || m.ordemErros.length > 0 ||
                                   m.desempates.length > 0 || m.empatesSemData.length > 0);
    const temAviso = info.unmatched.length > 0 || info.classErrors.length > 0 || info.notaErrors.length > 0 ||
                     info.reservaErrors.length > 0 || info.reservaDivergencias.length > 0 ||
                     (!semLimite && info.totalDisponivel < info.maxNum) || temAvisoManual;

    // Informações da classificação manual que não exigem correção — saem
    // tanto no selo CONFERIDO quanto no REVISAR.
    let infoManual = '';
    if(m){
      if(m.inscCompletadas.length > 0){
        infoManual += listaAviso(m.inscCompletadas.length + ' inscrição(ões) em branco completada(s) pela Tabela 2 (cruzamento pelo nome):', m.inscCompletadas);
      }
      if(m.empatesConfirmados.length > 0){
        infoManual += listaAviso(m.empatesConfirmados.length + ' empate(s) de nota em que a ordem informada já segue o mais velho primeiro:', m.empatesConfirmados);
      }
    }
    const prefixo = m ? '<strong>Classificação informada manualmente.</strong> ' : '';

    if(!temAviso){
      stampBadge.classList.remove('warn');
      stampBadge.textContent = 'CONFERIDO';
      let okHtml = prefixo + '<strong>' + outputRows.length + ' registros</strong> gerados com sucesso. Todos os nomes foram cruzados com a Tabela 2.';
      if(info.reservaSuprimida){
        okHtml += '<br>Nenhum candidato aprovado é cotista — a coluna RESERVA, vazia, foi suprimida da tabela final.';
      }
      if(semLimite) okHtml += avisoSemLimite;
      okHtml += infoManual;
      stampText.innerHTML = okHtml;
    } else {
      stampBadge.classList.add('warn');
      stampBadge.textContent = 'REVISAR';
      let html = prefixo + '<strong>' + outputRows.length + ' registros</strong> gerados';
      if(!semLimite && info.totalDisponivel < info.maxNum){
        html += ' — atenção: a ' + (m ? 'classificação manual' : 'Tabela 1') + ' possui apenas <strong>' + info.totalDisponivel + '</strong> candidato(s) classificado(s)' + (m ? '' : ' (não-REPROVADO)') + ', menos do que os ' + info.maxNum + ' solicitados';
      }
      html += '.';
      if(semLimite) html += avisoSemLimite;
      if(info.reprovadosCount > 0){
        html += '<br>' + info.reprovadosCount + ' candidato(s) marcado(s) como REPROVADO foram excluídos automaticamente.';
      }
      if(info.reservaSuprimida){
        html += '<br>Nenhum candidato aprovado é cotista — a coluna RESERVA, vazia, foi suprimida da tabela final.';
      }
      if(m && m.desempates.length > 0){
        html += listaAviso('<strong style="color:var(--stamp-red)">' + m.desempates.length + ' empate(s) de nota desempatado(s) pelo mais velho</strong> — a ordem informada foi ajustada, confira:', m.desempates);
      }
      if(m && m.empatesSemData.length > 0){
        html += listaAviso('<strong style="color:var(--stamp-red)">' + m.empatesSemData.length + ' empate(s) de nota sem data de nascimento para desempatar</strong> — mantida a ordem informada, conferir manualmente:', m.empatesSemData);
      }
      if(m && m.ordemErros.length > 0){
        html += listaAviso('<strong style="color:var(--stamp-red)">' + m.ordemErros.length + ' ponto(s) em que a ordem informada não segue a nota decrescente</strong> — a ordem informada foi mantida; use “Ordenar por nota” no Passo 1 se for o caso:', m.ordemErros);
      }
      if(m && m.inscDivergencias.length > 0){
        html += listaAviso('<strong style="color:var(--stamp-red)">' + m.inscDivergencias.length + ' inscrição(ões) informada(s) que não batem com a Tabela 2</strong> — conferir manualmente:', m.inscDivergencias);
      }
      if(info.unmatched.length > 0){
        html += listaAviso('<strong style="color:var(--stamp-red)">' + info.unmatched.length + ' candidato(s) sem correspondência</strong> na Tabela 2 (RESERVA deixado em branco, linhas destacadas abaixo):', info.unmatched, 12);
      }
      if(info.classErrors.length > 0){
        html += listaAviso('<strong style="color:var(--stamp-red)">' + info.classErrors.length + ' linha(s) da Tabela 1 com CLASSIFICAÇÃO não reconhecida</strong> e ignorada(s):', info.classErrors);
      }
      if(info.notaErrors.length > 0){
        html += listaAviso('<strong style="color:var(--stamp-red)">' + info.notaErrors.length + ' nota(s) não numérica(s)</strong> — conferir manualmente:', info.notaErrors);
      }
      if(info.reservaErrors.length > 0){
        html += listaAviso('<strong style="color:var(--stamp-red)">' + info.reservaErrors.length + ' rótulo(s) de reserva não reconhecido(s)</strong> — a coluna RESERVA ficou em branco nesses casos, conferir manualmente:', info.reservaErrors);
      }
      if(info.reservaDivergencias.length > 0){
        html += listaAviso('<strong style="color:var(--stamp-red)">' + info.reservaDivergencias.length + ' divergência(s) de reserva entre a ' + info.rotT1 + ' e a Tabela 2</strong> — conferir manualmente:', info.reservaDivergencias);
      }
      html += infoManual;
      stampText.innerHTML = html;
    }

    let html = '<div class="simple-table-wrap"><table class="simple-table"><thead><tr>' +
      activeCols.map(c => '<th>'+escapeHtml(c)+'</th>').join('') +
      '</tr></thead><tbody>';
    outputRows.forEach(r => {
      html += '<tr' + (r._unmatched ? ' class="p20-unmatched"' : '') + '>' +
        activeCols.map(c => '<td>'+escapeHtml(r[c] === undefined || r[c] === null ? '' : r[c])+'</td>').join('') +
        '</tr>';
    });
    html += '</tbody></table></div>';
    resultArea.innerHTML = html;

    downloadRow.style.display = 'flex';
    countNote.textContent = outputRows.length + ' linha(s) na tabela final.';
  }

  // Cópia da tabela (TSV + HTML "limpo" para reconhecimento como tabela no
  // Word/Excel) usa a função genérica do TJPRCore — ver bloco compartilhado
  // no topo do arquivo para detalhes de por que <td> é usado em vez de <th>.
  function getCellValue(r, c){
    return r[c] === undefined || r[c] === null ? '' : r[c];
  }

  copyBtn.addEventListener('click', () => {
    TJPRCore.copyTableToClipboard(activeCols, outputRows, getCellValue, copyBtn);
  });

  downloadBtn.addEventListener('click', function(){
    if(outputRows.length === 0) return;
    const lines = [];
    lines.push(activeCols.map(csvEscape).join(';'));
    outputRows.forEach(r => {
      lines.push(activeCols.map(c => csvEscape(r[c])).join(';'));
    });
    const csvContent = '\uFEFF' + lines.join('\r\n');
    const blob = new Blob([csvContent], {type:'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const now = new Date();
    const stamp = now.toISOString().slice(0,10);
    a.href = url;
    a.download = 'ponto20_classificacao_final_' + stamp + '.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  /* ---- Classificação informada manualmente ---------------------------------
     Para quando a unidade não lança as notas na Fábrica de Provas e manda a
     classificação só por PDF no SEI: o Relatório de Classificação Final (Tabela
     1) é substituído por uma tabela preenchida à mão ou montada a partir de
     texto colado. O texto colado só ALIMENTA a tabela — é sempre ela, conferida
     e ajustada, que vai para o processamento. */

  const NOTA_RE = /^\d{1,3}(?:[.,]\d{1,3})?$/;
  const INSC_RE = /^\d{4,10}$/;
  const ORDINAL_RE = /^\d{1,3}(?:[º°ª]|o|\.|\)|-|–)?$/i;
  const PONTUACAO_RE = /^[-–—|;:]+$/;

  function colapsa(s){ return String(s === undefined || s === null ? '' : s).replace(/\s+/g,' ').trim(); }
  function escAttr(s){ return escapeHtml(s === undefined || s === null ? '' : s).replace(/"/g,'&quot;'); }
  // Nota digitada/colada -> número, ou null se não for uma nota válida.
  function parseNota(v){
    const s = colapsa(v);
    return NOTA_RE.test(s) ? Number(s.replace(',', '.')) : null;
  }
  function fmtNotaNum(n){ return n.toFixed(2).replace('.', ','); }
  function mesmaNota(a, b){ return Math.round(a * 1000) === Math.round(b * 1000); }
  function nomeValido(s){ return /[A-Za-zÀ-ÿ]/.test(s || ''); }

  // Data de nascimento da Tabela 2: dd/mm/aaaa, aaaa-mm-dd ou número de série
  // do Excel (é como o SheetJS entrega uma célula de data) -> Date | null.
  function parseNascimento(v){
    if(v instanceof Date) return isNaN(v) ? null : new Date(v.getFullYear(), v.getMonth(), v.getDate());
    const s = colapsa(v);
    let m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(s);
    if(m) return dataValida(+m[3], +m[2], +m[1]);
    m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
    if(m) return dataValida(+m[1], +m[2], +m[3]);
    if(/^\d{4,6}(?:\.\d+)?$/.test(s)){
      const d = new Date(Math.round((Number(s) - 25569) * 86400000));
      return isNaN(d) ? null : new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
    }
    return null;
  }
  function dataValida(a, me, d){
    const dt = new Date(a, me - 1, d);
    return (dt.getFullYear() === a && dt.getMonth() === me - 1 && dt.getDate() === d) ? dt : null;
  }
  function fmtData(d){
    return String(d.getDate()).padStart(2,'0') + '/' + String(d.getMonth()+1).padStart(2,'0') + '/' + d.getFullYear();
  }

  // Reserva reconhecida vira código (2.1.1...); "-", "AC" etc. viram vazio;
  // texto não reconhecido fica como digitado (vira aviso no processamento).
  function normalizaReserva(txt){
    const t = colapsa(txt);
    if(!t) return '';
    const r = mapReserva(t);
    return r.desconhecidos.length ? t : r.code;
  }

  /* Uma linha colada -> { insc, nome, nota, reserva, extras } | null.
     Não divide por espaçamento "ingênuo": com tabulação (Excel/Word) cada
     célula é um item; sem ela (texto do PDF), cada palavra. Os itens são
     reconhecidos pelo formato — ordinal no início (1, 1º, 1.), inscrição (4 a
     10 dígitos), nota (a ÚLTIMA numérica da linha; as anteriores, como prova
     e entrevista, são ignoradas e listadas) e, depois da nota, a reserva. O
     que sobra antes da nota é o nome. */
  function lerLinhaColada(l){
    let toks = (l.indexOf('\t') !== -1 ? l.split('\t') : l.split(/\s+/))
      .map(colapsa).filter(t => t !== '' && !PONTUACAO_RE.test(t));
    if(toks.length > 2 && ORDINAL_RE.test(toks[0])) toks = toks.slice(1);
    let iNota = -1;
    for(let i = toks.length - 1; i > 0; i--){
      if(NOTA_RE.test(toks[i])){ iNota = i; break; }
    }
    if(iNota < 1) return null;
    const nomePartes = [], extras = [];
    let insc = '';
    toks.slice(0, iNota).forEach(t => {
      if(!insc && INSC_RE.test(t)) insc = t;
      else if(NOTA_RE.test(t)) extras.push(t);
      else nomePartes.push(t);
    });
    const nome = colapsa(nomePartes.join(' ')).toUpperCase();
    if(!nomeValido(nome)) return null;
    return { insc: insc, nome: nome, nota: fmtNotaNum(parseNota(toks[iNota])),
             reserva: normalizaReserva(toks.slice(iNota + 1).join(' ')), extras: extras };
  }

  function lerTextoColado(txt){
    const res = { linhas:[], naoReconhecidas:[], comExtras:[] };
    String(txt || '').replace(/\r\n?/g,'\n').split('\n').forEach(linha => {
      const l = linha.trim();
      if(!l) return;
      // cabeçalho colado junto (ORDEM / INSCRIÇÃO / NOME / NOTA...): sem números
      if(/\bNOME\b/.test(normHeader(l)) && !/\d/.test(l)) return;
      const r = lerLinhaColada(l);
      if(!r){ res.naoReconhecidas.push(l); return; }
      if(r.extras.length) res.comExtras.push(r.nome + ': notas ' + r.extras.concat([r.nota]).join(' · ') + ' — usada ' + r.nota);
      res.linhas.push(r);
    });
    return res;
  }

  function linhaVazia(r){ return !colapsa(r.insc) && !colapsa(r.nome) && !colapsa(r.nota) && !colapsa(r.reserva); }
  // linhas totalmente em branco (ex.: a criada pelo Enter e não usada) não contam
  function linhasValidas(){ return manualRows.filter(r => !linhaVazia(r)); }
  function pendencias(){
    const ativas = linhasValidas();
    return {
      total: ativas.length,
      semNome: ativas.filter(r => !nomeValido(r.nome)).length,
      semNota: ativas.filter(r => parseNota(r.nota) === null).length,
      reservaDesc: ativas.filter(r => mapReserva(r.reserva).desconhecidos.length > 0).length
    };
  }
  function manualPronta(){
    const p = pendencias();
    return p.total > 0 && p.semNome === 0 && p.semNota === 0;
  }

  const p20Passo1Tit = document.getElementById('p20Passo1Tit');
  const p20Passo1Desc = document.getElementById('p20Passo1Desc');
  const p20Passo1DescManual = document.getElementById('p20Passo1DescManual');
  const p20Upload1 = document.getElementById('p20Upload1');
  const p20ManualPergunta = document.getElementById('p20ManualPergunta');
  const btnManual = document.getElementById('p20BtnManual');
  const manualWrap = document.getElementById('p20ManualWrap');
  const btnVerColar = document.getElementById('p20BtnVerColar');
  const btnVerLinhas = document.getElementById('p20BtnVerLinhas');
  const colarWrap = document.getElementById('p20ColarWrap');
  const textoColado = document.getElementById('p20TextoColado');
  const btnLerTexto = document.getElementById('p20BtnLerTexto');
  const avisosColagem = document.getElementById('p20AvisosColagem');
  const tabelaManual = document.getElementById('p20TabelaManual');
  const contagemManual = document.getElementById('p20ContagemManual');

  function linhaPorId(id){ return manualRows.find(r => r.id === id) || null; }
  function indiceDoId(id){ return manualRows.findIndex(r => r.id === id); }
  function novaLinha(){ return { id: seqManual++, insc:'', nome:'', nota:'', reserva:'' }; }

  function campo(f, valor, extraClasse, placeholder, modoTeclado){
    return '<td><input class="p20-in' + (extraClasse ? ' ' + extraClasse : '') + '" data-f="' + f + '" value="' + escAttr(valor) + '"' +
      ' placeholder="' + placeholder + '"' + (modoTeclado ? ' inputmode="' + modoTeclado + '"' : '') + ' autocomplete="off"></td>';
  }

  function renderManual(){
    if(!manualRows.length){
      tabelaManual.innerHTML = '<p class="zona-vazia">nenhum candidato ainda — cole o texto acima e clique em “Ler texto e montar tabela”, ou use “+ Adicionar linha”</p>';
      atualizarManual();
      return;
    }
    let h = '<div class="table-scroll" style="max-height:none;">'
      + '<table class="cv-grade-table" style="white-space:normal;font-family:\'Barlow\',system-ui,sans-serif;font-size:12.5px;">'
      + '<thead><tr><th style="width:30px;"></th><th style="width:34px;">#</th><th style="width:120px;">INSCRIÇÃO</th>'
      + '<th>NOME</th><th style="width:96px;">NOTA</th><th style="width:150px;">RESERVA</th><th style="width:44px;"></th></tr></thead><tbody>';
    manualRows.forEach((r, i) => {
      h += '<tr data-id="' + r.id + '" draggable="false">'
        + '<td style="text-align:center;"><button type="button" class="drag-handle" data-id="' + r.id + '" tabindex="0" '
        + 'title="Arrastar para reordenar (ou Alt+↑ / Alt+↓)" aria-label="Reordenar ' + escAttr(r.nome || 'linha') + '">⠿</button></td>'
        + '<td style="text-align:center;color:var(--ink-soft);">' + (i + 1) + '</td>'
        + campo('insc', r.insc, 'p20-centro', 'pela Tabela 2', 'numeric')
        + campo('nome', r.nome, '', 'obrigatório')
        + campo('nota', r.nota, 'p20-centro', 'obrigatória', 'decimal')
        + campo('reserva', r.reserva, '', 'pela Tabela 2')
        + '<td style="text-align:center;"><button type="button" class="row-del-btn" title="Excluir linha" tabindex="-1">✕</button></td>'
        + '</tr>';
    });
    tabelaManual.innerHTML = h + '</tbody></table></div>';
    atualizarManual();
  }

  // Destaques e contagem, sem redesenhar a tabela — preserva o foco e a
  // navegação por Tab durante a digitação.
  function atualizarManual(){
    Array.prototype.forEach.call(tabelaManual.querySelectorAll('tbody tr[data-id]'), tr => {
      const r = linhaPorId(Number(tr.dataset.id));
      if(!r) return;
      const vazia = linhaVazia(r);
      tr.querySelector('[data-f="nome"]').classList.toggle('p20-vazio', !vazia && !nomeValido(r.nome));
      tr.querySelector('[data-f="nota"]').classList.toggle('p20-vazio', !vazia && parseNota(r.nota) === null);
      tr.querySelector('[data-f="reserva"]').classList.toggle('p20-vazio', mapReserva(r.reserva).desconhecidos.length > 0);
    });
    const p = pendencias();
    let t;
    if(p.total === 0){
      t = 'nenhum candidato na lista';
    } else {
      t = p.total + ' candidato' + (p.total === 1 ? '' : 's') + ' na lista';
      if(p.semNome) t += ' · ' + p.semNome + ' sem nome';
      if(p.semNota) t += ' · ' + p.semNota + ' sem nota válida';
      if(p.reservaDesc) t += ' · ' + p.reservaDesc + ' reserva(s) não reconhecida(s) — sairá aviso no processamento';
      if(p.semNome || p.semNota) t += ' — complete ou exclua a(s) linha(s) para liberar o processamento';
    }
    contagemManual.textContent = t;
    contagemManual.style.color = (p.semNome || p.semNota || p.reservaDesc) ? 'var(--coral)' : 'var(--ink-soft)';
    checkReady();
  }

  function focarCampo(id, f){
    const inp = tabelaManual.querySelector('tr[data-id="' + id + '"] [data-f="' + f + '"]');
    if(inp) inp.focus();
  }
  function adicionarLinha(f){
    const r = novaLinha();
    manualRows.push(r);
    renderManual();
    focarCampo(r.id, f || 'nome');
  }

  function setModoManual(on){
    modoManual = on;
    manualWrap.style.display = on ? '' : 'none';
    p20Upload1.style.display = on ? 'none' : '';
    p20Passo1Desc.style.display = on ? 'none' : '';
    p20Passo1DescManual.style.display = on ? '' : 'none';
    p20Passo1Tit.innerHTML = on ? 'Informe a classificação final <em>(manual)</em>' : 'Envie a Tabela 1 (Classificação Final)';
    p20ManualPergunta.textContent = on ? 'Recebeu o Relatório de Classificação Final em planilha?'
                                       : 'A unidade não lançou as notas e mandou a classificação só por PDF no SEI?';
    btnManual.textContent = on ? 'Voltar a usar a planilha' : 'Informar classificação manualmente';
    checkReady();
  }

  function verColar(on){
    colarWrap.style.display = on ? '' : 'none';
    btnVerColar.classList.toggle('forte', on);
    btnVerLinhas.classList.toggle('forte', !on);
    if(on) textoColado.focus();
    else if(!manualRows.length) adicionarLinha('nome');
  }

  function mostrarAvisoColagem(tipo, html){
    avisosColagem.className = 'notice-banner' + (tipo ? ' ' + tipo : '');
    avisosColagem.innerHTML = html;
    avisosColagem.style.display = '';
  }
  function listaHtml(itens){
    return '<ul class="warn-list">' + itens.map(n => '<li>' + escapeHtml(n) + '</li>').join('') + '</ul>';
  }

  btnManual.addEventListener('click', () => setModoManual(!modoManual));
  btnVerColar.addEventListener('click', () => verColar(true));
  btnVerLinhas.addEventListener('click', () => verColar(false));

  btnLerTexto.addEventListener('click', () => {
    if(!textoColado.value.trim()){
      mostrarAvisoColagem('warn', '<strong>Nada para ler</strong> — cole o texto da tabela no campo acima.');
      return;
    }
    const res = lerTextoColado(textoColado.value);
    if(!res.linhas.length){
      mostrarAvisoColagem('warn', '<strong>Nenhuma linha reconhecida</strong> — cada linha precisa trazer pelo menos o nome e a nota. A tabela não foi alterada. Linhas lidas:'
        + listaHtml(res.naoReconhecidas));
      return;
    }
    const atuais = linhasValidas().length;
    if(atuais && !confirm('A tabela já tem ' + atuais + ' linha(s) preenchida(s). Substituir pelo texto lido?')) return;
    manualRows = res.linhas.map(l => ({ id: seqManual++, insc: l.insc, nome: l.nome, nota: l.nota, reserva: l.reserva }));
    renderManual();

    let html = '<strong>' + res.linhas.length + ' linha(s) lida(s)</strong> — confira a tabela abaixo antes de processar.';
    if(res.naoReconhecidas.length){
      html += '<br><strong>' + res.naoReconhecidas.length + ' linha(s) não reconhecida(s)</strong> — não entraram na tabela; inclua à mão se for o caso:'
        + listaHtml(res.naoReconhecidas);
    }
    if(res.comExtras.length){
      html += '<br><strong>' + res.comExtras.length + ' linha(s) com mais de uma nota</strong> — foi usada a última como NOTA (final); confira:'
        + listaHtml(res.comExtras);
    }
    mostrarAvisoColagem((res.naoReconhecidas.length || res.comExtras.length) ? 'warn' : 'ok', html);
  });

  document.getElementById('p20BtnAddLinha').addEventListener('click', () => adicionarLinha('nome'));

  // Decrescente pela nota, estável; linhas sem nota válida vão para o fim. O
  // desempate pela idade é feito no processamento, com a Tabela 2.
  document.getElementById('p20BtnOrdenarNota').addEventListener('click', () => {
    const comIdx = manualRows.map((r, i) => ({ r, i, n: parseNota(r.nota) }));
    comIdx.sort((a, b) => {
      const va = a.n === null ? -Infinity : a.n, vb = b.n === null ? -Infinity : b.n;
      return (vb - va) || (a.i - b.i);
    });
    manualRows = comIdx.map(x => x.r);
    renderManual();
  });

  document.getElementById('p20BtnLimparTabela').addEventListener('click', () => {
    if(linhasValidas().length && !confirm('Apagar todas as linhas da tabela?')) return;
    manualRows = [];
    renderManual();
  });

  tabelaManual.addEventListener('input', ev => {
    const inp = ev.target.closest('.p20-in');
    if(!inp) return;
    const r = linhaPorId(Number(inp.closest('tr').dataset.id));
    if(!r) return;
    const f = inp.dataset.f;
    let v = inp.value;
    if(f === 'nome') v = v.toUpperCase();
    if(f === 'insc') v = v.replace(/\D/g, '');
    if(v !== inp.value){
      const pos = inp.selectionStart - (inp.value.length - v.length);
      inp.value = v;
      try{ inp.setSelectionRange(pos, pos); }catch(e){}
    }
    r[f] = v;
    atualizarManual();
  });

  // Ao sair do campo: nota no padrão 8,50 e reserva reconhecida como código.
  tabelaManual.addEventListener('focusout', ev => {
    const inp = ev.target.closest('.p20-in');
    if(!inp) return;
    const r = linhaPorId(Number(inp.closest('tr').dataset.id));
    if(!r) return;
    const f = inp.dataset.f;
    if(f === 'nota'){
      const n = parseNota(r.nota);
      if(n !== null) r.nota = fmtNotaNum(n);
    } else if(f === 'reserva'){
      r.reserva = normalizaReserva(r.reserva);
    } else {
      r[f] = colapsa(r[f]);
    }
    if(inp.value !== r[f]) inp.value = r[f];
    atualizarManual();
  });

  tabelaManual.addEventListener('keydown', ev => {
    const h = ev.target.closest('.drag-handle');
    if(h && ev.altKey && (ev.key === 'ArrowUp' || ev.key === 'ArrowDown')){
      ev.preventDefault();
      moverPorTeclado(Number(h.dataset.id), ev.key === 'ArrowUp' ? -1 : 1);
      return;
    }
    const inp = ev.target.closest('.p20-in');
    if(!inp || ev.key !== 'Enter') return;
    ev.preventDefault();
    const i = indiceDoId(Number(inp.closest('tr').dataset.id));
    const f = inp.dataset.f;
    if(i === manualRows.length - 1){
      inp.blur(); // aplica a formatação do campo antes de redesenhar
      adicionarLinha(f);
    } else {
      focarCampo(manualRows[i + 1].id, f);
    }
  });

  tabelaManual.addEventListener('click', ev => {
    const b = ev.target.closest('.row-del-btn');
    if(!b) return;
    const i = indiceDoId(Number(b.closest('tr').dataset.id));
    if(i < 0) return;
    manualRows.splice(i, 1);
    renderManual();
  });

  /* Arrastar e soltar (mesmo comportamento do Ponto 14): o <tr> só fica
     "draggable" enquanto o ponteiro está na alça ⠿, para que selecionar texto
     num campo não comece um arraste de linha por engano. */
  let origemId = null;
  function limparMarcas(manter){
    Array.prototype.forEach.call(tabelaManual.querySelectorAll('tr'), t => {
      t.classList.remove('drop-before', 'drop-after');
      if(!manter) t.classList.remove('row-dragging');
    });
  }
  tabelaManual.addEventListener('mousedown', ev => {
    const h = ev.target.closest('.drag-handle');
    if(h) h.closest('tr').setAttribute('draggable', 'true');
  });
  tabelaManual.addEventListener('mouseup', ev => {
    const h = ev.target.closest('.drag-handle');
    if(h) h.closest('tr').setAttribute('draggable', 'false');
  });
  tabelaManual.addEventListener('dragstart', ev => {
    const tr = ev.target.closest && ev.target.closest('tr[data-id]');
    if(!tr) return;
    origemId = Number(tr.dataset.id);
    tr.classList.add('row-dragging');
    try{
      ev.dataTransfer.effectAllowed = 'move';
      ev.dataTransfer.setData('text/plain', String(origemId));
    }catch(e){}
  });
  tabelaManual.addEventListener('dragend', ev => {
    const tr = ev.target.closest && ev.target.closest('tr[data-id]');
    if(tr) tr.setAttribute('draggable', 'false');
    origemId = null;
    limparMarcas();
  });
  tabelaManual.addEventListener('dragover', ev => {
    if(origemId === null) return;
    const tr = ev.target.closest('tbody tr[data-id]');
    if(!tr) return;
    ev.preventDefault();
    try{ ev.dataTransfer.dropEffect = 'move'; }catch(e){}
    limparMarcas(true);
    const r = tr.getBoundingClientRect();
    tr.classList.add(((ev.clientY - r.top) > r.height / 2) ? 'drop-after' : 'drop-before');
  });
  tabelaManual.addEventListener('drop', ev => {
    const tr = ev.target.closest('tbody tr[data-id]');
    if(!tr || origemId === null) return;
    ev.preventDefault();
    const de = indiceDoId(origemId);
    const alvo = indiceDoId(Number(tr.dataset.id));
    const r = tr.getBoundingClientRect();
    const depois = (ev.clientY - r.top) > r.height / 2;
    origemId = null;
    limparMarcas();
    if(de < 0 || alvo < 0) return;
    mover(de, alvo + (depois ? 1 : 0));
  });

  function mover(de, destino){
    const mov = manualRows[de];
    if(!mov) return;
    if(de < destino) destino--;
    manualRows.splice(de, 1);
    destino = Math.max(0, Math.min(destino, manualRows.length));
    manualRows.splice(destino, 0, mov);
    renderManual();
  }
  function moverPorTeclado(id, passo){
    const i = indiceDoId(id);
    const j = i + passo;
    if(i < 0 || j < 0 || j >= manualRows.length) return;
    const t = manualRows[i]; manualRows[i] = manualRows[j]; manualRows[j] = t;
    renderManual();
    const h = tabelaManual.querySelector('.drag-handle[data-id="' + id + '"]');
    if(h) h.focus();
  }

  renderManual();

  /* ---- Blocos para colar no Athos ----------------------------------------
     Os campos do formulário do Athos são de texto puro: o que vale aqui é
     copiar exatamente a string, sem formatação. */

  // "Copiado!" no próprio botão, como no resto da página.
  function ligarCopiaTexto(btn, obterTexto, msgErro){
    if(!btn) return;
    btn.addEventListener('click', async function(){
      const texto = obterTexto();
      if(!texto) return;
      const original = btn.textContent;
      function copiado(){
        btn.textContent = 'Copiado!';
        setTimeout(() => { btn.textContent = original; }, 1800);
      }
      try{
        await navigator.clipboard.writeText(texto);
        copiado();
      }catch(err){
        alert(msgErro);
      }
    });
  }

  // Sem número informado, o nome do documento sai com a lacuna — nunca com um
  // número inventado ou com o campo vazio, que passaria despercebido no Athos.
  const SEI_LACUNA = '____________________';
  const seiInput = document.getElementById('p20SeiInput');
  const athosNome = document.getElementById('p20AthosNome');

  // Máscara do protocolo SEI: 0000000-00.0000.0.00.0000 (20 dígitos), a mesma
  // dos Pontos 14 e 18.
  function mascaraSei(v){
    const d = String(v == null ? '' : v).replace(/\D/g,'').slice(0,20);
    let out = d.slice(0,7);
    if(d.length>7)  out += '-' + d.slice(7,9);
    if(d.length>9)  out += '.' + d.slice(9,13);
    if(d.length>13) out += '.' + d.slice(13,14);
    if(d.length>14) out += '.' + d.slice(14,16);
    if(d.length>16) out += '.' + d.slice(16,20);
    return out;
  }

  function numeroSei(){
    const v = seiInput ? seiInput.value.trim() : '';
    return v || SEI_LACUNA;
  }
  function nomeDocumento(){
    return 'Edital de Classificação - SEI!TJPR n°' + numeroSei();
  }
  function atualizarBlocosAthos(){
    if(athosNome) athosNome.textContent = nomeDocumento();
  }

  if(seiInput){
    seiInput.addEventListener('input', function(){
      seiInput.value = mascaraSei(seiInput.value);
      atualizarBlocosAthos();
    });
  }
  atualizarBlocosAthos();

  const MSG_COPIA = 'Não foi possível copiar automaticamente. Selecione o texto do bloco e use Ctrl+C.';
  ligarCopiaTexto(document.getElementById('p20AthosNomeBtn'), nomeDocumento, MSG_COPIA);
  ligarCopiaTexto(document.getElementById('p20AthosClassBtn'), () => 'CLASSIFICAÇÃO', MSG_COPIA);

  // ---- Data do próximo dia útil (copiar e colar no Athos) ----
  const MESES_EXTENSO = ['janeiro','fevereiro','março','abril','maio','junho',
    'julho','agosto','setembro','outubro','novembro','dezembro'];

  function proximoDiaUtil(base){
    const d = new Date(base);
    d.setDate(d.getDate() + 1);
    while(d.getDay() === 0 || d.getDay() === 6){
      d.setDate(d.getDate() + 1);
    }
    return d;
  }

  function formatarDataExtenso(d){
    return d.getDate() + ' de ' + MESES_EXTENSO[d.getMonth()] + ' de ' + d.getFullYear();
  }

  const dateText = document.getElementById('p20DateText');
  const dateCopyBtn = document.getElementById('p20DateCopyBtn');
  if(dateText){
    dateText.textContent = formatarDataExtenso(proximoDiaUtil(new Date()));
  }
  if(dateText){
    ligarCopiaTexto(dateCopyBtn, () => dateText.textContent.trim(),
      'Não foi possível copiar automaticamente. Selecione a data e use Ctrl+C.');
  }

  // ---- Bloco de assinatura do chefe da unidade (copiar e colar) ----
  const sigCopyBtn = document.getElementById('p20SigCopyBtn');
  const sigText = document.getElementById('p20SigText');
  if(sigCopyBtn && sigText){
    sigCopyBtn.addEventListener('click', async function(){
      // texto puro: uma linha por item, como será colado no edital
      const lines = sigText.innerText.split('\n').map(s => s.trim()).filter(Boolean);
      const plain = lines.join('\n');
      const html = '<p style="text-align:center;margin:0;"><strong>' + escapeHtml(lines[0]) + '</strong><br>'
        + lines.slice(1).map(escapeHtml).join('<br>') + '</p>';

      function showCopied(){
        const original = sigCopyBtn.textContent;
        sigCopyBtn.textContent = 'Copiado!';
        setTimeout(() => { sigCopyBtn.textContent = original; }, 1800);
      }

      if(navigator.clipboard && window.ClipboardItem){
        try{
          await navigator.clipboard.write([new ClipboardItem({
            'text/html': new Blob([html], {type:'text/html'}),
            'text/plain': new Blob([plain], {type:'text/plain'})
          })]);
          showCopied();
          return;
        }catch(err){ /* segue para o fallback */ }
      }
      try{
        await navigator.clipboard.writeText(plain);
        showCopied();
      }catch(err){
        alert('Não foi possível copiar automaticamente. Selecione o texto da assinatura e use Ctrl+C.');
      }
    });
  }
})();
