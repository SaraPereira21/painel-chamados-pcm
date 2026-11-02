// Central de Despacho — mapa real e roteirização demonstrativa
// Coordenadas abaixo representam pontos operacionais DEMO por cidade/contrato.
const dispatchLocations={
 'Contrato PI Norte':{name:'Contrato PI Norte',city:'Piripiri',uf:'PI',lat:-4.2734,lng:-41.7769},
 'Contrato PI Sul':{name:'Contrato PI Sul',city:'Teresina',uf:'PI',lat:-5.0919,lng:-42.8034},
 'Contrato MA 01':{name:'Contrato MA 01',city:'Imperatriz',uf:'MA',lat:-5.5264,lng:-47.4917},
 'Contrato MA 02':{name:'Contrato MA 02',city:'São Luís',uf:'MA',lat:-2.5307,lng:-44.3068},
 'Contrato BA 01':{name:'Contrato BA 01',city:'Camaçari',uf:'BA',lat:-12.6975,lng:-38.3242},
 'Contrato BA 02':{name:'Contrato BA 02',city:'Feira de Santana',uf:'BA',lat:-12.2664,lng:-38.9663},
 'Contrato CE 01':{name:'Contrato CE 01',city:'São Gonçalo do Amarante',uf:'CE',lat:-3.6051,lng:-38.9726},
 'Contrato CE 02':{name:'Contrato CE 02',city:'Maracanaú',uf:'CE',lat:-3.8767,lng:-38.6255},
 'Matriz':{name:'Matriz',city:'Fortaleza',uf:'CE',lat:-3.7820,lng:-38.5267}
};
const maintainerPoints={
 1:{lat:-3.7820,lng:-38.5267},2:{lat:-3.7750,lng:-38.5400},3:{lat:-3.8767,lng:-38.6255},4:{lat:-3.6051,lng:-38.9726},5:{lat:-3.7327,lng:-38.6536},
 6:{lat:-5.0919,lng:-42.8034},7:{lat:-4.2734,lng:-41.7769},8:{lat:-5.5264,lng:-47.4917},9:{lat:-2.5307,lng:-44.3068},10:{lat:-12.6975,lng:-38.3242},11:{lat:-12.2664,lng:-38.9663}
};
let dispatchMap=null,dispatchRoute=null,dispatchCallId=null;
function mapView(){
 const treated=db.calls.filter(c=>!['Novo'].includes(c.status));
 setTimeout(initDispatchMap,60);
 return `<div class="top"><div><h1>Mapa Operacional</h1><div class="muted">Central de despacho, localização e roteirização dos atendimentos</div></div></div>
 <div class="dispatch-layout"><div class="card dispatch-map-card"><div id="realDispatchMap"></div><div class="map-note">Mapa real • pontos de contrato e mantenedores desta versão são dados demonstrativos</div></div>
 <aside class="dispatch-panel"><div class="card"><h2>Planejar atendimento</h2><div class="field"><label>Solicitação tratada</label><select id="dispatchCall" onchange="selectDispatchCall(this.value)"><option value="">Selecione...</option>${treated.map(c=>`<option value="${c.id}">${c.id} · ${c.asset} · ${c.city}/${c.uf}</option>`).join('')}</select></div><div id="dispatchInfo" class="dispatch-empty">Selecione um chamado para localizar o equipamento e comparar os mantenedores disponíveis.</div></div><div id="dispatchSuggestions"></div></aside></div>`;
}
function initDispatchMap(){
 const el=document.getElementById('realDispatchMap'); if(!el||typeof L==='undefined')return;
 if(dispatchMap){try{dispatchMap.remove()}catch(e){}}
 dispatchMap=L.map(el,{zoomControl:true}).setView([-7.2,-41.5],5);
 L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap contributors'}).addTo(dispatchMap);
 db.calls.filter(c=>!['Novo'].includes(c.status)).forEach(c=>{const p=dispatchLocations[c.contract];if(!p)return;L.circleMarker([p.lat,p.lng],{radius:7,color:c.priority==='URGENTE'?'#b94b4b':'#557db7',fillOpacity:.9}).addTo(dispatchMap).bindPopup(`<b>${c.id} · ${c.asset}</b><br>${esc(c.contract)}<br>${esc(c.report)}`)});
 db.maintainers.forEach(m=>{const p=maintainerPoints[m.id];if(!p)return;L.circleMarker([p.lat,p.lng],{radius:5,color:'#368b69',fillOpacity:.9}).addTo(dispatchMap).bindPopup(`<b>${esc(m.name)}</b><br>${esc(m.role)}<br>${esc(m.status)}`)});
}
function selectDispatchCall(id){
 dispatchCallId=id; const c=db.calls.find(x=>x.id===id),info=document.getElementById('dispatchInfo'),sug=document.getElementById('dispatchSuggestions');
 if(!c){info.innerHTML='Selecione um chamado.';sug.innerHTML='';return} const p=dispatchLocations[c.contract];
 if(!p){info.innerHTML='<span class="badge high">Local sem coordenadas cadastradas</span>';sug.innerHTML='';return}
 info.innerHTML=`<div class="dispatch-call"><b>${c.asset}</b> · ${badge(c.priority)}<div class="small muted">${esc(c.contract)} · ${p.city}/${p.uf}</div><p>${esc(c.report)}</p></div>`;
 if(dispatchMap){dispatchMap.setView([p.lat,p.lng],9)}
 rankMaintainers(c,p);
}
async function rankMaintainers(c,dest){
 const sug=document.getElementById('dispatchSuggestions'); const candidates=db.maintainers.filter(m=>m.status==='Disponível'||c.maintainers.includes(m.id));
 sug.innerHTML='<div class="card route-loading">Calculando rotas rodoviárias...</div>';
 const results=await Promise.all(candidates.map(async m=>{const o=maintainerPoints[m.id];if(!o)return null;try{const u=`https://router.project-osrm.org/route/v1/driving/${o.lng},${o.lat};${dest.lng},${dest.lat}?overview=false`;const r=await fetch(u);const j=await r.json();const x=j.routes&&j.routes[0];if(!x)throw 0;return {m,o,km:x.distance/1000,min:x.duration/60}}catch(e){return {m,o,km:null,min:null}}}));
 const valid=results.filter(Boolean).sort((a,b)=>(a.min??999999)-(b.min??999999));
 sug.innerHTML=`<div class="card"><div class="section-title"><h2>Mantenedores sugeridos</h2><span class="badge info">por tempo de rota</span></div>${valid.length?valid.map((x,i)=>`<div class="mechanic-suggestion ${i===0?'recommended':''}"><div><b>${esc(x.m.name)}</b>${i===0&&x.min!=null?' <span class="badge ok">Recomendado</span>':''}<div class="small muted">${esc(x.m.role)} · ${esc(x.m.skills)}</div></div><div class="route-metrics">${x.km==null?'<span>Rota indisponível</span>':`<b>${x.km.toFixed(1)} km</b><span>≈ ${Math.round(x.min)} min</span>`}</div><button class="btn alt" onclick="drawDispatchRoute(${x.m.id})">Ver rota</button></div>`).join(''):'<div class="empty">Nenhum mantenedor disponível.</div>'}<div class="small muted route-disclaimer">Sugestão inicial por tempo de deslocamento. A decisão do PCM deve considerar também especialidade, criticidade e disponibilidade operacional.</div></div>`;
}
async function drawDispatchRoute(mid){
 const c=db.calls.find(x=>x.id===dispatchCallId),m=mById(mid);if(!c||!m)return;const d=dispatchLocations[c.contract],o=maintainerPoints[mid];if(!d||!o)return;
 try{const u=`https://router.project-osrm.org/route/v1/driving/${o.lng},${o.lat};${d.lng},${d.lat}?overview=full&geometries=geojson`;const r=await fetch(u),j=await r.json(),x=j.routes&&j.routes[0];if(!x)throw 0;if(dispatchRoute)dispatchMap.removeLayer(dispatchRoute);dispatchRoute=L.geoJSON(x.geometry,{style:{color:'#557db7',weight:5,opacity:.85}}).addTo(dispatchMap);dispatchMap.fitBounds(dispatchRoute.getBounds(),{padding:[30,30]});toast(`${m.name}: ${ (x.distance/1000).toFixed(1)} km · aproximadamente ${Math.round(x.duration/60)} min`)}catch(e){toast('Não foi possível calcular a rota agora. Tente novamente.')}
}
