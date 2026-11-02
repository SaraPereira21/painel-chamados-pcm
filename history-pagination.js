// Histórico enxuto: pesquisa + paginação, sem lista infinita.
(function(){
 let histPage=1,histSize=10,histQuery='';
 function closedRows(){
   const live=(db.calls||[]).filter(c=>c.status==='Encerrado').map(c=>({date:(db.deliveries||[]).find(d=>d.call===c.id)?.date||'—',asset:c.asset,call:c.id,os:c.os||'—',city:c.city||'—',uf:c.uf||'',problem:c.report||'—',status:'Encerrado',live:true}));
   const old=(typeof historicalRecords!=='undefined'?historicalRecords:[]).map(r=>({...r,live:false}));
   const all=[...live,...old]; const seen=new Set();
   return all.filter(r=>{const k=r.call||[r.asset,r.date,r.os].join('|');if(seen.has(k))return false;seen.add(k);return true});
 }
 window.historyView=function(){
   setTimeout(renderClosedHistory,0);
   return `<div class="top"><div><h1>Encerrados / Histórico</h1><div class="muted">Pesquise atendimentos encerrados por equipamento, NS, OS, cidade ou descrição.</div></div></div>
   <div class="card"><div class="history-search"><div class="field"><label>Pesquisar no histórico</label><input id="closedHistorySearch" placeholder="Ex.: EG-169, CH-0153, OS-200157399..." oninput="filterClosedHistory(this.value)"></div><div class="field" style="max-width:150px"><label>Linhas por página</label><select id="closedHistorySize" onchange="changeClosedHistorySize(this.value)"><option>10</option><option>25</option><option>50</option></select></div></div></div><div id="closedHistoryResult" class="section"></div>`;
 };
 window.filterClosedHistory=function(v){histQuery=(v||'').trim().toLowerCase();histPage=1;renderClosedHistory()};
 window.changeClosedHistorySize=function(v){histSize=Math.min(50,Math.max(10,Number(v)||10));histPage=1;renderClosedHistory()};
 window.closedHistoryPage=function(p){histPage=p;renderClosedHistory()};
 window.renderClosedHistory=function(){
   const el=document.getElementById('closedHistoryResult');if(!el)return;
   let rows=closedRows();
   if(histQuery)rows=rows.filter(r=>[r.asset,r.call,r.os,r.city,r.uf,r.problem].join(' ').toLowerCase().includes(histQuery));
   const total=rows.length,pages=Math.max(1,Math.ceil(total/histSize));histPage=Math.min(histPage,pages);const start=(histPage-1)*histSize,shown=rows.slice(start,start+histSize);
   el.innerHTML=`<div class="section-title"><div><h2>Chamados encerrados</h2><div class="small muted">${total?`Mostrando ${start+1}–${Math.min(start+histSize,total)} de ${total}`:'Nenhum registro encontrado'}</div></div><span class="badge ok">${total} encerrado${total===1?'':'s'}</span></div><div class="card scroll"><table class="table"><tr><th>Data</th><th>Equipamento</th><th>NS</th><th>OS Engeman</th><th>Local</th><th>Ocorrência</th><th>Ação</th></tr>${shown.length?shown.map(r=>`<tr><td>${esc(r.date||'—')}</td><td><b>${esc(r.asset||'—')}</b></td><td>${esc(r.call||'—')}</td><td>${esc(r.os||'—')}</td><td>${esc(r.city||'—')}/${esc(r.uf||'')}</td><td>${esc(r.problem||'—')}</td><td>${r.live&&typeof showCompletedReport==='function'&& (db.deliveries||[]).some(d=>d.call===r.call)?`<button class="btn alt" onclick="showCompletedReport('${r.call}')">Relatório</button>`:'<span class="small muted">Histórico</span>'}</td></tr>`).join(''):'<tr><td colspan="7" class="empty">Nenhum chamado encerrado encontrado.</td></tr>'}</table></div>${total>histSize?`<div class="history-pager"><span class="small muted">Página ${histPage} de ${pages}</span><div class="history-pager-controls"><button class="btn alt" ${histPage<=1?'disabled':''} onclick="closedHistoryPage(${histPage-1})">Anterior</button><button class="btn alt" ${histPage>=pages?'disabled':''} onclick="closedHistoryPage(${histPage+1})">Próxima</button></div></div>`:''}`;
 };
})();