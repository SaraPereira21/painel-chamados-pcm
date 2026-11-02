// Pesquisa dos chamados ativos. Carregado por ultimo para preservar o fluxo atual.
(function(){
  function getAllCalls(){
    const all=[...db.calls];
    if(typeof routeEligibleCalls==='function'){
      routeEligibleCalls().forEach(c=>{if(!all.some(x=>x.id===c.id))all.push(c)});
    }
    return all;
  }
  function activeCalls(){
    return getAllCalls().filter(c=>c.status!=='Encerrado'&&!['Novo','Aguardando PCM'].includes(c.status));
  }
  function engemanReleased(c){
    return ['CH-0153','CH-0154'].includes(c.id)&&c.status!=='Encerrado';
  }
  function activeCard(c){
    const real=db.calls.some(x=>x.id===c.id);
    if(!real && typeof demoCallCard==='function') return demoCallCard(c);
    const ms=(c.maintainers||[]).map(mById).filter(Boolean);
    const released=engemanReleased(c);
    const os=c.os&&String(c.os).replace('OS-DEMO-','OS-');
    return `<div class="card call ${c.priority}">${badge(c.priority)} <span class="badge info">${esc(c.status)}</span>${released?'<span class="badge high">ENGEMAN · OS LIBERADA</span>':''}<h3>${esc(c.id)} · ${esc(c.asset)}</h3><div class="small muted">${esc(c.city)}/${esc(c.uf)} · ${esc(c.contract)}</div><p>${esc(c.report)}</p>${released?`<div class="box small"><b>${esc(os||'OS Engeman')}</b><br>Mecânico liberou a OS para encerramento. <b>Ação do PCM pendente.</b></div>`:`<div class="box small"><b>Mantenedores:</b> ${ms.length?ms.map(m=>esc(m.name)).join('<br>'):'Nenhum alocado'}</div>`}<div class="actions">${released?`<button class="btn blue" onclick="openEngemanClosure('${c.id}')">Analisar OS e encerrar</button>`:`<button class="btn alt" onclick="openCall('${c.id}')">Acompanhar</button>`}</div></div>`;
  }
  window.filterActiveCalls=function(){
    const q=(document.getElementById('callsSearch')?.value||'').trim().toLowerCase();
    const status=document.getElementById('callsStatus')?.value||'';
    let rows=activeCalls();
    if(q) rows=rows.filter(c=>[c.asset,c.id,c.os,c.city,c.uf,c.contract,c.report,c.status].some(v=>String(v||'').toLowerCase().includes(q)));
    if(status) rows=rows.filter(c=>c.status===status);
    const el=document.getElementById('activeCallResults');
    const count=document.getElementById('activeCallCount');
    if(count) count.textContent=rows.length;
    if(el) el.innerHTML=rows.length?rows.map(activeCard).join(''):'<div class="card empty">Nenhum chamado em acompanhamento encontrado.</div>';
  };
  callsView=function(){
    const active=activeCalls();
    const statuses=[...new Set(active.map(c=>c.status).filter(Boolean))].sort();
    return `<div class="top"><div><h1>Chamados</h1><div class="muted">Atendimentos já tratados pelo PCM para acompanhamento até a finalização</div></div><button class="btn blue" onclick="go('notify')">+ Nova NS</button></div>
    <div class="card section"><div class="history-search"><div class="field"><label>Pesquisar chamado</label><input id="callsSearch" placeholder="Equipamento, NS, OS, cidade, contrato ou problema" oninput="filterActiveCalls()"></div><div class="field"><label>Status</label><select id="callsStatus" onchange="filterActiveCalls()"><option value="">Todos os status</option>${statuses.map(s=>`<option>${esc(s)}</option>`).join('')}</select></div><button class="btn blue" onclick="filterActiveCalls()">Pesquisar</button></div></div>
    <div class="section-title"><div><h2>Chamados em acompanhamento</h2><div class="small muted">Programados, em deslocamento, em atendimento e OS liberadas no Engeman. Ao encerrar, o chamado sai desta lista e passa para Encerrados / Histórico.</div></div><span id="activeCallCount" class="badge info">${active.length}</span></div>
    <div id="activeCallResults" class="callgrid">${active.length?active.map(activeCard).join(''):'<div class="card empty">Nenhum chamado em acompanhamento.</div>'}</div>`;
  };
})();
