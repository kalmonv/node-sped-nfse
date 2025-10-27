import { Make, Tools, formatData, zip2xml } from "../dist/index.js"
import fs from "fs";

let myTools = new Tools({ //Configuração de habiente e sistema
    tpAmb: 1,
    versao: '1.00',
    cOrgao: "5106240",
    CNPJ: ""
}, { //Certificado digital
    pfx: '../certificado.pfx', // Buffer | String
    senha: fs.readFileSync('../senha.txt', { encoding: "utf8" }),
});

myTools.enviarEvento({
    chNFSe: "",
    tpEvento: "101101",
    xMotivo: "NOTA FISCAL DE TESTE",
    cMotivo: 9
}).then(res => {
    console.log(res)
}).catch(err => {
    console.log(err)
})