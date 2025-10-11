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
const tools = new Tools(config, certificado);
```

## 📥 Método `xml2json(xml: string): Promise<object>`
## 📥 Método `json2xml(obj: object): Promise<string>`
Converte uma string XML em um objeto JavaScript.
Converte uma string XML em um objeto JavaScript.

### Exemplo entrada ou saida:
```xml
<soapenv:Envelope xmlns:soapenv="http://www.w3.org/2003/05/soap-envelope">
  <soapenv:Body>
    <nfeResultMsg xmlns="http://www.portalfiscal.inf.br/nfe/wsdl/NFeStatusServico4">
      <retConsStatServ xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">
        <tpAmb>0</tpAmb>
        <verAplic>1.00</verAplic>
        <cStat>999</cStat>
        <xMotivo>Rejeicao: Erro nao catalogado</xMotivo>
        <cUF>51</cUF>
      </retConsStatServ>
    </nfeResultMsg>
  </soapenv:Body>
</soapenv:Envelope>
```
```json
{
  "soapenv:Envelope": {
    "@xmlns:soapenv": "http://www.w3.org/2003/05/soap-envelope",
    "soapenv:Body": {
      "nfeResultMsg": {
        "@xmlns": "http://www.portalfiscal.inf.br/nfe/wsdl/NFeStatusServico4",
        "retConsStatServ": {
          "@xmlns": "http://www.portalfiscal.inf.br/nfe",
          "@versao": "4.00",
          "tpAmb": 0,
          "verAplic": "1.00",
          "cStat": 999,
          "xMotivo": "Rejeicao: Erro nao catalogado",
          "cUF": 51
        }
      }
    }
  }
}
```
## 📥 Método `enviarDPS(xml: string }): Promise<string>`
Este método é responsável por enviar DPS. Ele recebe um XML contendo a DPS a ser transmitida.
```ts
let dps = " Conteudo ";
tools.enviarDPS(xml);
```

## 📥 Método `async xmlSign(xmlJSON: string, data: any = { tag: "infNFe" }): Promise<string>`
Este método é responsável por **assinar digitalmente** o XML da NF-e ou NFC-e utilizando o certificado digital A1 (formato `.pfx`). A assinatura segue o padrão exigido pela SEFAZ e é essencial para a validação do documento fiscal.
```ts
let xml = "Conteudo da NFCe/NFe".
const xmlAssinado = await tools.xmlSign(xml, {
    tag: "infNFe" //Tag que vai ser usada para gerar assinatura.
});
```

## 📥 Método `getCertificado: Promise<object>`
Este método retorna, de forma assíncrona, o conteúdo do certificado digital **A1 (.pfx)** carregado na instância da classe `Tools`.
```ts
const certificado = await tools.getCertificado();
console.log(certificado) //{ca,key,cert}
```

## 📥 Método `async consultarNFe(chNFe: string): Promise<string>`
O método `consultarNFe` realiza a **consulta de uma NF-e ou NFC-e na SEFAZ** utilizando a chave de acesso completa da nota e retorna o status dela em xml.
```ts
const xmlStatus = await tools.consultarNFe("CHAVE DA NFE");
```

## 📥 Método `async sefazStatus(): Promise<string>`
O método `sefazStatus` realiza a **consulta ao servidor da SEFAZ** utilizando a UF de inicializaçao.
```ts
const xmlStatus = await tools.sefazStatus();
```

## 📥 Método `async sefazEvento({ chNFe, tpEvento, nProt , justificativa, textoCorrecao, sequencial }): Promise<string>`
O método `sefazEvento` realiza a **Manifesto de uma NFe**.
```ts
// 1. Manifestação - Confirmação
tools.sefazEvento({ chNFe: "351701...", tpEvento: "210200" }).then(res => {
    console.log(res) //Xml da sefaz
}).catch(err=>{
    console.error(err)
});

//EXEMPLOS ADICIONAIS
// 2. Cancelamento
//await myTools.sefazEvento({ chNFe: "351701...", tpEvento: "110111", nProt: "135230000000000", justificativa: "Cancelamento por erro na emissão." });

// 3. Carta de Correção
//await myTools.sefazEvento({ chNFe: "351701...", tpEvento: "110110", textoCorrecao: "Corrigir a descrição do produto." });

// 4. Operação Não Realizada
//await myTools.sefazEvento({ chNFe: "351701...", tpEvento: "210240", justificativa: "Entrega não realizada por recusa do destinatário." });
```


## 📥 Método `async sefazDistDFe({ultNSU}): Promise<string>`
O método `sefazDistDFe` realiza a **consulta ded NFe/NFCe** emitidas contra o CNPJ.
```ts
const xmlDocs = await tools.sefazDistDFe({ultNSU:"0"});
```