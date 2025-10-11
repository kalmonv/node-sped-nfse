import { Console } from "console";
import { Make, Tools, json2xml, formatData, zip2xml } from "../dist/index.js"
import fs from "fs";

let myTools = new Tools({ //Configuração de habiente e sistema
    tpAmb: 2,
    cOrgao: '5208707',
    versao: '1.00',
}, { //Certificado digital
    pfx: '../certificado.pfx', // Buffer | String
    senha: fs.readFileSync('../senha.txt', { encoding: "utf8" }),
});
myTools.consultaAlicotaHist("120012000").then(res => {
    console.log(res)
}).catch(res => {
    console.log(res)
})