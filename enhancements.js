// Melhorias de apresentação da versão Demo
const historicalRecords=[
 {date:'18/09/2026',asset:'EG-151',call:'CH-0108',os:'OS-200154821',city:'Pecém',uf:'CE',problem:'Vazamento hidráulico durante operação',diagnosis:'Mangueira hidráulica danificada',cause:'Falha de componente',status:'Encerrado'},
 {date:'04/08/2026',asset:'EG-151',call:'CH-0072',os:'OS-200151443',city:'Pecém',uf:'CE',problem:'Implemento com movimentos lentos',diagnosis:'Baixa pressão no circuito hidráulico',cause:'Falha hidráulica',status:'Encerrado'},
 {date:'21/06/2026',asset:'EG-151',call:'CH-0041',os:'OS-200148206',city:'Fortaleza',uf:'CE',problem:'Ruído anormal na região inferior',diagnosis:'Folga em componente de rodagem',cause:'Desgaste natural',status:'Encerrado'},
 {date:'11/10/2026',asset:'EG-169',call:'CH-0134',os:'OS-200156884',city:'Imperatriz',uf:'MA',problem:'Perda de força em operação',diagnosis:'Filtro de combustível saturado',cause:'Condição operacional',status:'Encerrado'}
];

// Menu operacional enxuto: auditoria continua registrada internamente e a base técnica fica nos bastidores.
function renderNav(){
 const visible=navItems.filter(x=>!['audit','base'].includes(x[0]));
 document.getElementById('nav').innerHTML=`<div class="nav">${visible.map(x=>`<button class="${current===x[0]?'active':''}" onclick="go('${x[0]}')">${x[1]}</button>`).join('')}</div>`;
}

function historyView(assetId=''){
 const options=db.assets.map(a=>`<option value="${a.id}" ${a.id===assetId?'selected':''}>${a.id} — ${esc(a.type)}</option>`).join('');
 return `<div class="top"><div><h1>Histórico de Equipamentos</h1><div class="muted">Consulte o prontuário de manutenção por prefixo do equipamento</div></div></div>
 <div class="card"><div class="history-search"><div class="field"><label>Pesquisar equipamento</label><select id="historyAsset"><option value="">Selecione o prefixo...</option>${options}</select></div><button class="btn blue" onclick="searchHistory()">Pesquisar</button></div></div>
 <div id="historyResult">${assetId?historyResultHTML(assetId):'<div class="card section empty">Selecione um equipamento para visualizar todos os seus atendimentos.</div>'}</div>`;
}
function searchHistory(){const id=document.getElementById('historyAsset').value;document.getElementById('historyResult').innerHTML=id?historyResultHTML(id):'<div class="card section empty">Selecione um equipamento.</div>'}
function historyResultHTML(id){
 const a=aById(id); if(!a)return '<div class="card section empty">Equipamento não encontrado.</div>';
 const currentRows=db.calls.filter(c=>c.asset===id).map(c=>{const d=db.deliveries.find(x=>x.call===c.id);return {date:'02/11/2026',asset:id,call:c.id,os:c.os||'—',city:c.city,uf:c.uf,problem:c.report,diagnosis:d?.diag||'Em diagnóstico / não concluído',cause:d?.cause||'—',status:c.status,live:true}});
 const rows=[...currentRows,...historicalRecords.filter(r=>r.asset===id)].sort((x,y)=>y.date.split('/').reverse().join('').localeCompare(x.date.split('/').reverse().join('')));
 return `<div class="asset-head"><div><h2>${a.id} · ${esc(a.type)}</h2><div class="muted small">${esc(a.brand)} ${esc(a.model)} · Local atual: ${esc(a.city)}/${esc(a.uf)} · ${esc(a.contract)}</div></div><span class="badge info">${rows.length} ocorrência${rows.length===1?'':'s'}</span></div>
 <div class="card scroll"><table class="table"><tr><th>Data</th><th>NS / Chamado</th><th>OS Engeman</th><th>Local</th><th>Problema relatado</th><th>Diagnóstico / causa</th><th>Status</th></tr>${rows.length?rows.map(r=>`<tr class="${r.live?'rowclick':''}" ${r.live?`onclick="openCall('${r.call}')"`:''}><td>${r.date}</td><td><b>${r.call}</b></td><td>${r.os}</td><td>${esc(r.city)}/${esc(r.uf)}</td><td>${esc(r.problem)}</td><td>${esc(r.diagnosis)}${r.cause!=='—'?`<div class="small muted">${esc(r.cause)}</div>`:''}</td><td><span class="badge ${r.status==='Encerrado'?'ok':'info'}">${esc(r.status)}</span></td></tr>`).join(''):'<tr><td colspan="7" class="empty">Nenhuma ocorrência registrada.</td></tr>'}</table></div>`;
}

renderNav();
if(current==='history')render('history');