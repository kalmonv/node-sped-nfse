import { Make, Tools, formatData, zip2xml } from "../dist/index.js"
import fs from "fs";

let myTools = new Tools({ //Configuração de habiente e sistema
    tpAmb: 1,
    versao: '1.00',
}, { //Certificado digital
    pfx: '../certificado.pfx', // Buffer | String
    senha: fs.readFileSync('../senha.txt', { encoding: "utf8" }),
});

var DPS = new Make();
DPS.tagInfDPS({
    tpAmb: 1,
    dhEmi: formatData(),
    verAplic: "1.0",
    serie: "1",
    nDPS: "6",
    dCompet: "2025-10-24",
    tpEmit: "1",
    cLocEmi: "5106257"
});
DPS.tagPrest({
    CNPJ: "00000000000",
    //CPF: "",
    //NIF: "",
    //cNaoNIF: "",
    //CAEPF: "",
    //IM: "",
    //xNome: "TESTE", //O nome ou razão social do prestador não deve ser informado quando o emitente da DPS for o próprio prestador.
})

/*
DPS.tagPrestEnd({
    xLgr: "Av Node",
    nro: "38",
    //xCpl: "",
    xBairro: "github",
    fone: "556640028922",
    email: "pp@teste.com.br",
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
    CPF: "00000000000",
    //NIF: "",
    //cNaoNIF: "",
    //CAEPF: "",
    //IM: "",
    xNome: "node-sped-nfse",
})
DPS.tagTomaEnd({
    cMun: "0000000",
    CEP: "00000000",
    //cPais: "US",
    //cEndPost: "10001",
    //xCidade: "New York",
    //xEstProvReg: "NY",
    xLgr: "Av Nodejs",
    nro: "13",
    xBairro: "GITHUB",
    fone: "40028922",
    email: "exemplo@gmail.com"
})
DPS.tagServ({
    cLocPrestacao: "5106240",
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
    fs.writeFileSync("./testes/DPS_sign.xml", xmlSign, { endereco: "utf8" });
    console.log("./testes/DPS_sign.xml -> SALVO");

    myTools.enviarDPS(xmlSign).then(res => {
        if (res?.erros?.length > 0) { //Erro
            console.info(res.erros);
            return 0;
        }

        res.xml = zip2xml(res.nfseXmlGZipB64);
        fs.writeFileSync("./testes/gov_resp.json", JSON.stringify(res), { endereco: "utf8" });
        console.log("./testes/gov_resp.json -> SALVO");
    }).catch(err => {
        console.log(err)
        fs.writeFileSync("./testes/gov_resp.json", JSON.stringify(err), { endereco: "utf8" });
    })
})