import { Console } from "console";
import { Make, Tools, json2xml, formatData, zip2xml } from "../dist/index.js"
import fs from "fs";

let myTools = new Tools({ //Configuração de habiente e sistema
    tpAmb: 1,
    cOrgao: '5106240',
    versao: '1.00',
}, { //Certificado digital
    pfx: '../certificado.pfx', // Buffer | String
    senha: fs.readFileSync('../senha.txt', { encoding: "utf8" }),
});

var DPS = new Make();
DPS.tagInfDPS({
    tpAmb: 1,
    dhEmi: formatData(),
    verAplic: "node-sped-nfse_1.0",
    serie: "1",
    nDPS: "4",
    dCompet: "2025-09-29",
    tpEmit: "1",
    cLocEmi: "5106257"
});
DPS.tagPrest({
    CNPJ: "00000000000",
    //CPF: "",
    //NIF: "",
    //cNaoNIF: "",
    //CAEPF: "",
    //IM: "845600",
    //xNome: "Guarix", //O nome ou razão social do prestador não deve ser informado quando o emitente da DPS for o próprio prestador.
})

/*
DPS.tagPrestEnd({
    xLgr: "Av Para",
    nro: "138",
    //xCpl: "",
    xBairro: "Uniao",
    fone: "5566981352912",
    email: "contato@guarix.com.br",
})
*/
DPS.tagPrestRegTrib({
    opSimpNac: "2",
    /*  opSimpNac!=2 ?
        regApTribSN: "1",
    */
    regEspTrib: "0"
})
DPS.tagToma({
    CPF: "000000000000",
    //NIF: "",
    //cNaoNIF: "",
    //CAEPF: "",
    //IM: "",
    xNome: "Programador Bom de Codigo",
})
DPS.tagTomaEnd({
    cMun: "000000",
    CEP: "00000000",
    //cPais: "US",
    //cEndPost: "10001",
    //xCidade: "New York",
    //xEstProvReg: "NY",
    xLgr: "Rua Nodejs",
    nro: "123",
    xBairro: "UNIAO",
    fone: "1140028922",
    email: "pp@gmail.com"
})
DPS.tagServ({
    cLocPrestacao: "000000",
    //cPaisPrestacao: "BR",

    cTribNac: "171001",
    cTribMun: "200",
    xDescServ: "SERVICO DE MANUTENCAO DE COMPUTADORES",
    cNBS: "120012000",
    cIntContrib: "001"
})
DPS.tagVServPrest({
    vServ: "1.00"
})
DPS.tagTribMun({
    tribISSQN: "4",   // tributado
    tpRetISSQN: "1"   // retenção (ajuste conforme o seu caso)
    // BM: "1.00",    // (opcional) Base de cálculo municipal, use se for diferente do vServ
    // tpImunidade: "0", exigSusp: "0", cPaisResult: "1058" // só se aplicarem
});
DPS.tagTotTribPTotTrib({
    pTotTribFed: "0.00",
    pTotTribEst: "0.00",
    pTotTribMun: "0.00"
})

myTools.xmlSign(DPS.xml()).then(xmlSign => {
    fs.writeFileSync("./exemplos/DPS_sign.xml", xmlSign, { endereco: "utf8" });
    console.log("./exemplos/DPS_sign.xml -> SALVO")
    myTools.enviarDPS(xmlSign).then(res => {
        if (res?.erros?.length > 0) { //Erro
            console.info(res.erros);
            return 0;
        }
        
        res.xml = zip2xml(res.nfseXmlGZipB64);
        fs.writeFileSync("./exemplos/gov_resp.json", JSON.stringify(res), { endereco: "utf8" });
        console.log("./exemplos/gov_resp.json -> SALVO");
    }).catch(err => {
        console.log(err)
        fs.writeFileSync("./testes/gov_resp.json", JSON.stringify(err), { endereco: "utf8" });
    })
})