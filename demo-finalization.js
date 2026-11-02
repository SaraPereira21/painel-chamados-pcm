// Exemplo preenchido de encerramento PCM para demonstração do relatório/PDF.
// Esta camada é apenas de demonstração até a integração real com o Engeman.
(function(){
  const originalDeliveryView = typeof deliveryView === 'function' ? deliveryView : null;

  window.openDemoFinalReport = function(){
    const base = db.calls.find(c=>c.id==='CH-0154') || db.calls.find(c=>c.os) || db.calls[0];
    if(!base){ toast('Nenhuma NS disponível para demonstração.'); return; }

    const c = {
      ...base,
      id:'CH-0154',
      asset:'ED-108',
      city:'Fortaleza',
      uf:'CE',
      contract:'Matriz',
      report:'Painel acende, porém o equipamento não dá partida. Operador informou falha ocorrida no início do turno.',
      condition:'Impossibilitado de operar',
      priority:'URGENTE',
      system:'Elétrico / Partida',
      maintainers:[1],
      hh:3,
      tools:['Multímetro','Ferramental elétrico'],
      os:'OS-200157400',
      timeline:[
        ['07:30','NS aberta pelo operador'],
        ['07:38','PCM analisou e programou o atendimento'],
        ['08:10','Mantenedor alocado'],
        ['08:42','Atendimento iniciado conforme OS Engeman'],
        ['10:55','Mecânico liberou a OS para encerramento'],
        ['11:10','PCM analisou os apontamentos e encerrou a OS'],
        ['11:12','Relatório de atendimento preparado para envio ao cliente']
      ]
    };

    const d = {
      call:c.id,
      date:'02/11/2026 11:12',
      hh:'2,2',
      diag:'Após análise do sistema de partida, foi identificado mau contato e oxidação nos terminais do relé de partida, causando falha intermitente no acionamento do motor de arranque.',
      cause:'Falha elétrica',
      reason:'Oxidação e mau contato nos terminais do circuito de partida.',
      solution:'Realizada limpeza dos terminais, reaperto das conexões elétricas e substituição do relé de partida. Conexões revisadas e protegidas após a intervenção.',
      test:'Equipamento submetido a testes de partida e funcionamento após o reparo. Foram realizados cinco ciclos de partida sem reincidência da falha. Equipamento liberado para operação.',
      damage:'Não'
    };

    if(typeof clientByContract!=='undefined') clientByContract['Matriz']='Cliente Demonstração — Unidade Fortaleza';
    document.getElementById('view').innerHTML = `<div class="top"><div><h1>Prévia do relatório final</h1><div class="muted">Exemplo preenchido com dados que futuramente poderão ser importados dos apontamentos da OS no Engeman e revisados pelo PCM.</div></div><button class="btn alt" onclick="go('delivery')">Voltar</button></div><div class="card section"><div class="badge info">EXEMPLO DEMONSTRATIVO</div><p class="small muted">Os dados abaixo simulam uma OS já liberada pelo mecânico, analisada e encerrada pelo PCM.</p></div>${reportHTML(d,c)}`;
  };

  if(originalDeliveryView){
    deliveryView = function(){
      const normal = originalDeliveryView.apply(this,arguments);
      return `<div class="card" style="margin-bottom:16px"><div class="section-title"><div><h2>Exemplo de encerramento</h2><div class="muted small">Visualize um relatório completo antes da integração com o Engeman.</div></div><button class="btn blue" onclick="openDemoFinalReport()">Gerar relatório de exemplo</button></div><div class="small muted">Simula: mecânico libera a OS → PCM analisa/encerra → dados da OS alimentam o relatório → PCM revisa → PDF para o cliente.</div></div>${normal}`;
    };
  }
})();