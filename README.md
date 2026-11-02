# Painel de Chamados para Manutenção Externa — V1

Protótipo demonstrativo funcional para gestão do ciclo de manutenção de campo.

## Executar
Abra `index.html` no navegador ou publique a pasta em GitHub Pages/Vercel como site estático.

## Fluxos implementados
- Painel de Controle com chamados e mantenedores em campo.
- Cadastro de ativos, edição, importação CSV e QR Code único.
- Base fictícia de mantenedores em CE, PI, MA e BA.
- Notificação de Serviço via QR/simulação com triagem adaptativa local.
- Regra de criticidade: impossibilitado de operar = URGENTE; operando com limitações/iminência de parada = ALTA.
- Tratativa PCM: prioridade, mantenedores, HH e ferramentas.
- OS Engeman demonstrativa (mock claramente identificado).
- Status de deslocamento/atendimento e linha do tempo.
- Entrega ao cliente com diagnóstico, causa, solução, HH, teste de liberação e potencial avaria.
- Histórico e auditoria.
- Persistência local via `localStorage`.

## Importação CSV
Cabeçalhos suportados: `prefixo,tipo,marca,modelo,uf,cidade,contrato,local_sap,status`.

## Limites deliberados do protótipo
- Engeman/SAP: integração simulada; nenhuma API corporativa é chamada.
- Mapa: demonstrativo, sem GPS/roteirização real.
- Triagem: motor local por regras para a demo. Não é diagnóstico e não usa RAG/LLM externo.
- QR Code usa a biblioteca QRCode.js via CDN; com internet indisponível, o link de notificação continua sendo exibido.

## Produção futura
Uma implantação corporativa exigirá backend, autenticação/perfis, banco de dados, APIs reais, segurança/LGPD, homologação, cadastros/migração, treinamento e observabilidade.
