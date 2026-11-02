// Fluxo demonstrativo de encerramento PCM / Engeman.
(function(){
  const demoEngemanResult={
    call:'CH-0154',asset:'ED-108',os:'OS-200157400',releasedAt:'02/11/2026 10:55',
    mechanicNote:'verificado circ partida, mau contato terminal rele. limp terminais, reaperto conexoes e subst rele partida. testado 5x ok maq liberada',
    hh:'2,2',parts:'Relé de partida',technicians:'Manuel Silva — Mecânico III',
    diag:'Após análise do sistema de partida, foi identificado mau contato e oxidação nos terminais do relé de partida, causando falha intermitente no acionamento do motor de arranque.',
    cause:'Falha elétrica',reason:'Oxidação e mau contato nos terminais do circuito de partida.',
    solution:'Realizada limpeza dos terminais, reaperto das conexões elétricas e substituição do relé de partida. Conexões revisadas e protegidas após a intervenção.',
    test:'Equipamento submetido a testes de partida e funcionamento após o reparo. Foram realizados cinco ciclos de partida sem reincidência da falha. Equipamento liberado para operação.',damage:'Não'
  };

  function allCallsForList(){
    const real=[...db.calls];
    if(typeof routeEligibleCalls!=='function')return real;
    routeEligibleCalls().forEach(c=>{if(!real.some(x=>x.id===c.id))real.push(c)});
    return real;
  }

  callsView=function(){
    const all=allCallsForList();
    return `<div class="top"><div><h1>Chamados</h1><div class="muted">Notificações de Serviço e ciclo operacional</div></div><button class="btn blue" onclick="go('notify')">+ Nova NS</button></div><div class="callgrid">${all.map(demoCallCard).join('')}</div>`;
  };

  window.openEngemanClosure=function(){
    let c=db.calls.find(x=>x.id===demoEngemanResult.call);
    if(!c){toast('NS demonstrativa não encontrada.');return}
    const a=aById(c.asset)||{};
    document.getElementById('view').innerHTML=`<div class="top"><div><h1>Encerramento do atendimento</h1><div class="muted">OS liberada pelo mecânico no Engeman para análise e encerramento pelo PCM.</div></div><button class="btn alt" onclick="go('delivery')">Voltar</button></div>
    <div class="card section"><div class="section-title"><div><h2>${esc(c.asset)} · ${esc(c.id)}</h2><div class="muted small">${esc(a.type||'Equipamento')} · ${esc(c.city)}/${esc(c.uf)} · ${esc(c.contract)}</div></div><span class="badge high">OS LIBERADA PARA ENCERRAMENTO</span></div>
    <div class="report-grid"><p><span>OS Engeman</span><b>${esc(demoEngemanResult.os)}</b></p><p><span>Liberada pelo mecânico</span><b>${esc(demoEngemanResult.releasedAt)}</b></p><p><span>Técnico</span><b>${esc(demoEngemanResult.technicians)}</b></p><p><span>HH apontado</span><b>${esc(demoEngemanResult.hh)} h</b></p><p><span>Peça substituída</span><b>${esc(demoEngemanResult.parts)}</b></p><p><span>Status Engeman</span><b>Aguardando encerramento PCM</b></p></div></div>
    <div class="card section"><h3>Apontamento original do mecânico no Engeman</h3><div class="box small">${esc(demoEngemanResult.mechanicNote)}</div><p class="small muted">Na integração real, este conteúdo e os campos estruturados serão importados da OS. O texto abaixo é editável pelo PCM antes da emissão do relatório.</p></div>
    <div class="card section"><h3>Revisão do PCM para o relatório ao cliente</h3><div class="field"><label>Diagnóstico técnico</label><textarea id="pcmDiag" rows="3">${esc(demoEngemanResult.diag)}</textarea></div><div class="grid2"><div class="field"><label>Causa</label><input id="pcmCause" value="${esc(demoEngemanResult.cause)}"></div><div class="field"><label>HH realizado</label><input id="pcmHH" value="${esc(demoEngemanResult.hh)}"></div></div><div class="field"><label>Motivo / causa técnica</label><textarea id="pcmReason" rows="2">${esc(demoEngemanResult.reason)}</textarea></div><div class="field"><label>Serviço executado</label><textarea id="pcmSolution" rows="4">${esc(demoEngemanResult.solution)}</textarea></div><div class="field"><label>Teste e condição final</label><textarea id="pcmTest" rows="3">${esc(demoEngemanResult.test)}</textarea></div><div class="field"><label>Indícios de mau uso / avaria</label><select id="pcmDamage"><option>Não</option><option>Sim</option><option>Inconclusivo</option></select></div><div class="actions"><button class="btn blue" onclick="finishEngemanClosure()">Encerrar atendimento e gerar relatório</button></div></div>`;
  };

  window.finishEngemanClosure=function(){
    const c=db.calls.find(x=>x.id===demoEngemanResult.call);if(!c)return;
    c.os=demoEngemanResult.os;c.status='Encerrado';
    c.timeline=c.timeline||[];
    if(!c.timeline.some(t=>String(t[1]).includes('liberou a OS')))c.timeline.push(['10:55','Mecânico liberou a OS para encerramento no Engeman']);
    c.timeline.push(['11:10','PCM analisou os apontamentos e encerrou a OS no Engeman'],['11:12','Atendimento finalizado e relatório preparado para o cliente']);
    const d={call:c.id,date:'02/11/2026 11:12',hh:document.getElementById('pcmHH').value,diag:document.getElementById('pcmDiag').value,cause:document.getElementById('pcmCause').value,reason:document.getElementById('pcmReason').value,solution:document.getElementById('pcmSolution').value,test:document.getElementById('pcmTest').value,damage:document.getElementById('pcmDamage').value};
    db.deliveries=db.deliveries||[];db.deliveries=db.deliveries.filter(x=>x.call!==c.id);db.deliveries.push(d);save();
    document.getElementById('view').innerHTML=`<div class="top"><div><h1>Relatório pronto para envio</h1><div class="muted">Atendimento encerrado pelo PCM após análise da OS Engeman.</div></div><button class="btn alt" onclick="go('delivery')">Voltar</button></div>${reportHTML(d,c)}`;
  };

  deliveryView=function(){
    const pending=db.calls.filter(c=>['Serviço concluído','Aguardando entrega'].includes(c.status));
    const demo=db.calls.find(c=>c.id===demoEngemanResult.call);
    const completed=db.deliveries||[];
    return `<div class="top"><div><h1>Entrega ao Cliente</h1><div class="muted">Atendimentos liberados no Engeman, revisão do PCM e emissão do relatório ao cliente</div></div></div>
    ${demo&&demo.status!=='Encerrado'?`<div class="card section"><div class="section-title"><div><h2>${esc(demo.asset)} · ${esc(demo.id)}</h2><div class="muted small">${esc(demo.os||demoEngemanResult.os)} · ${esc(demo.city)}/${esc(demo.uf)} · ${esc(demo.contract)}</div></div><span class="badge high">Aguardando encerramento PCM</span></div><p>O mecânico já liberou a OS no Engeman. Analise os apontamentos, ajuste o texto do relatório se necessário e encerre o atendimento.</p><div class="actions"><button class="btn blue" onclick="openEngemanClosure()">Analisar e encerrar</button></div></div>`:''}
    ${pending.map(c=>`<div class="card section"><div class="section-title"><div><h3>${esc(c.asset)} · ${esc(c.id)}</h3><div class="muted small">${esc(c.os||'OS aguardando sincronização')} · ${esc(c.city)}/${esc(c.uf)}</div></div><span class="badge info">${esc(c.status)}</span></div><button class="btn alt" onclick="deliveryForm('${c.id}')">Abrir entrega</button></div>`).join('')}
    ${completed.length?`<div class="section"><div class="section-title"><h2>Relatórios concluídos</h2><span class="badge ok">${completed.length}</span></div><div class="card scroll"><table class="table"><tr><th>NS</th><th>Equipamento</th><th>OS</th><th>Data</th><th>Status</th></tr>${completed.map(d=>{const c=db.calls.find(x=>x.id===d.call);return c?`<tr><td>${esc(c.id)}</td><td><b>${esc(c.asset)}</b></td><td>${esc(c.os||'—')}</td><td>${esc(d.date||'—')}</td><td><span class="badge ok">Encerrado</span></td></tr>`:''}).join('')}</table></div></div>`:''}`;
  };
})();