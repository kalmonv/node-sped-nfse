import { Tools } from "../dist/index.js"
import fs from "fs";

let myTools = new Tools({ //Configuração de habiente e sistema
    tpAmb: 1,
    cOrgao: '5106240',
    versao: '1.00',
}, { //Certificado digital
    pfx: '../certificado.pfx', // Buffer | String
    senha: fs.readFileSync('../senha.txt', { encoding: "utf8" }),
});
myTools.DANFSe("{chAcesso}").then(pdfBuff => {
    fs.writeFileSync("./testes/DANFSe.pdf", pdfBuff)
    //console.log(res)
}).catch(res => {
    console.log(res)
})