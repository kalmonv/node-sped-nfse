import { Tools } from "../dist/index.js"
import fs from "fs";

let myTools = new Tools({ //Configuração de habiente e sistema
    tpAmb: 1,
    versao: '1.00',
}, { //Certificado digital
    pfx: '../certificado.pfx', // Buffer | String
    senha: fs.readFileSync('../senha.txt', { encoding: "utf8" }),
});

//consulta({NSU, DPS, chAcesso }) Somente 1 por vez
myTools.consulta({ DPS: "510625724750630600018800001000000000000005" }).then(res => {
    console.log(res)
}).catch(res => {
    console.log(res)
})