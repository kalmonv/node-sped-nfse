# 🧰 Instanciando a classe `Tools`

A classe `Tools` é responsável por operações centrais da NF-e/NFC-e: geração, assinatura, envio e validação de XMLs.

---

## ✨ Sintaxe

```ts
const config = {
  tpAmb: 2, //1-Produçao, 2-Homologação - Obrigatorio
  versao: '1.00', //Obrigatorio
  
  cOrgao: '5106240', //Códigos dos municípios IBGE
  timeout: 60,  //Optativo - Tempo limite de requisição

  xmllint: '/usr/bin/xmllint.exe', //Optativo, caso sistema não tenha declarado nas variaveis.
  openssl: '/usr/bin/openssl.exe', //Optativo, caso sistema não tenha declarado nas variaveis.
};
const certificado = {
  pfx: fs.readFileSync('./certs/empresa.pfx'),  // (Buffer | String path) Obrigatorio, caminho para o arquivo .pfx
  senha: 'minhasenha123'                        //Obrigatorio, senha do certificado digital
};
const myTools = new Tools(config, certificado);
```

## 📥 Método `async consulta({ NSU || DPS || chAcesso }): Promise<string>`
O método `consulta` realiza a **consulta de NSU, DPS ou chAcesso**.
```ts
const resp = await myTools.consulta({ DPS: '000000000000000000000'});

console.log({ // console.log(resp)
  tipoAmbiente: 1,
  versaoAplicativo: 'SefinNacional_1.4.0',
  dataHoraProcessamento: '2025-10-26T17:46:51.7080703-03:00',
  chaveAcesso: '00000000000000000000000000000000000'
})
```

```ts
const resp = await myTools.consulta({ chAcesso: '000000000000000000000'});
console.log({ // console.log(resp);
  tipoAmbiente: 1,
  versaoAplicativo: 'SefinNacional_1.4.0',
  dataHoraProcessamento: '2025-10-26T17:54:43.2025696-03:00',
  chaveAcesso: '0000000000000000000000000000000000',
  nfseXmlGZipB64:'', // Pode ser utilizado o zip2xml; import { zip2xml } from node-sped-nfse;
})
```
Indisponivel ou divergencia na documentação SWAGGER GOV.
```ts
const resp = await myTools.consulta({ NSU: '0'});
console.log({ // console.log(resp);

})
```

## 📥 Método `async DANFSe(chAcesso): Promise<string>`
O método `DANFSe` retorna um PDF atravez da chave de acesso.
```ts
myTools.DANFSe("{chAcesso}").then(pdfBuff => {
    fs.writeFileSync("./testes/DANFSe.pdf", pdfBuff)
}).catch(res => {
    console.log(res)
})
```

## 📥 Método `async xmlSign(chAcesso, tag): Promise<string>`
O método `xmlSign` retorna um XML assinado, por padrão ele ira assinar a infDPS, caso deseje assinar outro bloco, informar segundo parametro.
```ts
myTools.xmlSign("{XML-STRING}").then(xmlSigned => {
    fs.writeFileSync("./testes/xml_signed.pdf", xmlSigned);
}).catch(res => {
    console.log(res)
})
```

## 📥 Método `async enviarDPS(xmlSigned): Promise<string>`
O método `enviarDPS` envia DPS para ser criado a NFSe.
```ts
myTools.enviarDPS("{xmlSigned}").then(resp => {
  console.log({ // console.log(resp)
    tipoAmbiente:1,
    versaoAplicativo:"SefinNacional_1.4.0",
    dataHoraProcessamento:"2025-10-24T08:51:22.410667-03:00",
    idDps:"NFS0000000000000000000000000000",
    chaveAcesso:"0000000000000000000",
    nfseXmlGZipB64:"",
    erros: [] // Se existir erros ira aparecer, caso contrario não ira constar no json.
  })
}).catch(res => {
    console.log(res)
})
```

## 📥 Método `async enviarEvento({ chNFSe, tpEvento, dhEvento, id, xDesc, cMotivo, xMotivo, chSubstituta, CPFAgTrib, nProcAdm, idEvManifRej, xProcAdm, cEvtNFSe, idBloqOfic }): Promise<string>`
O método `enviarEvento` envia um evento para sistema nacional.
```ts
// 101101 — Cancelamento de NFS-e
let ev101101 = {
  chNFSe: "",
  tpEvento: "101101",
  xMotivo: "Motivo do cancelamento",
  cMotivo: 9
};

// 101103 — Solicitação de Análise Fiscal para Cancelamento
let ev101103 = {
  chNFSe: "",
  tpEvento: "101103",
  xMotivo: "Solicito análise fiscal para cancelamento",
  cMotivo: 1
};

// 105102 — Cancelamento por Substituição (informar substituta)
let ev105102 = {
  chNFSe: "",
  tpEvento: "105102",
  chSubstituta: "",
  xMotivo: "Cancelamento por substituição",
  cMotivo: 5
};

// 105104 — Decisão Fiscal (Cancelamento) com processo
let ev105104 = {
  chNFSe: "",
  tpEvento: "105104",
  CPFAgTrib: "",   // CPF do agente tributário
  nProcAdm: "",    // nº do processo administrativo
  cMotivo: 1,
  xMotivo: "Decisão fiscal sobre pedido de cancelamento"
};

// 105105 — Decisão Fiscal (Cancelamento) com processo
let ev105105 = {
  chNFSe: "",
  tpEvento: "105105",
  CPFAgTrib: "",
  nProcAdm: "",
  cMotivo: 2,
  xMotivo: "Decisão fiscal indeferindo/encerrando pedido de cancelamento"
};

// 202201 — Manifestação de Ciência (Prestador)
let ev202201 = {
  chNFSe: "",
  tpEvento: "202201"
};

// 202205 — Manifestação de Rejeição (Prestador)
let ev202205 = {
  chNFSe: "",
  tpEvento: "202205",
  xMotivo: "Rejeição pelo Prestador",
  cMotivo: 1
};

// 203202 — Manifestação de Ciência (Tomador)
let ev203202 = {
  chNFSe: "",
  tpEvento: "203202"
};

// 203206 — Manifestação de Rejeição (Tomador)
let ev203206 = {
  chNFSe: "",
  tpEvento: "203206",
  xMotivo: "Rejeição pelo Tomador",
  cMotivo: 1
};

// 204203 — Manifestação de Ciência (Intermediário)
let ev204203 = {
  chNFSe: "",
  tpEvento: "204203"
};

// 204207 — Manifestação de Rejeição (Intermediário)
let ev204207 = {
  chNFSe: "",
  tpEvento: "204207",
  xMotivo: "Rejeição pelo Intermediário",
  cMotivo: 1
};

// 205204 — Ato do Agente Tributário (ciência/registro)
let ev205204 = {
  chNFSe: "",
  tpEvento: "205204",
  CPFAgTrib: ""   // CPF do agente tributário
};

// 205208 — Ato do Agente Tributário (rejeição vinculada)
let ev205208 = {
  chNFSe: "",
  tpEvento: "205208",
  CPFAgTrib: "",
  idEvManifRej: "", // ID do evento de manifestação de rejeição
  xMotivo: "Justificativa do ato"
};

// 305101 — Processo Administrativo (abertura/associação)
let ev305101 = {
  chNFSe: "",
  tpEvento: "305101",
  CPFAgTrib: "",
  nProcAdm: "",   // número do processo
  xProcAdm: ""    // descrição/assunto do processo
};

// 305102 — Comunicação Administrativa (relativa à NFSe)
let ev305102 = {
  chNFSe: "",
  tpEvento: "305102",
  CPFAgTrib: "",
  xMotivo: "Comunicação administrativa relacionada à NFSe",
  cEvtNFSe: ""    // código/assunto específico do evento administrativo
};

// 305103 — Bloqueio/Ofício Administrativo
let ev305103 = {
  chNFSe: "",
  tpEvento: "305103",
  CPFAgTrib: "",
  idBloqOfic: ""  // identificador do bloqueio/ofício
};

myTools.enviarEvento(ev?).then(resp => { // ev = variavel de evento escolhida
  console.log({ // console.log(resp)
    tipoAmbiente: 1,
    versaoAplicativo: 'SefinNacional_1.4.0',
    dataHoraProcessamento: '2025-10-26T18:25:35.4772793-03:00',
    erro: []
  })
}).catch(res => {
    console.log(res)
})
```
