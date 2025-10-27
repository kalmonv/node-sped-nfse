var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Make_instances, _Make_DPS, _Make_ICMSTot, _Make_gerarChaveNFe, _Make_calICMSTot;
import { XMLBuilder } from "fast-xml-parser";
//Classe da nota fiscal
class Make {
    constructor() {
        _Make_instances.add(this);
        _Make_DPS.set(this, {
            "@xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
            //"@xsi:schemaLocation": "http://www.sped.fazenda.gov.br/nfse DPS_v1.00.xsd",
            "@xmlns": "http://www.sped.fazenda.gov.br/nfse",
            "@versao": "1.00",
            infDPS: {
            //"@xmlns": "http://www.portalfiscal.inf.br/nfe",
            }
        });
        _Make_ICMSTot.set(this, {
            vBC: 0,
            vICMS: 0,
            vICMSDeson: 0,
            vFCP: 0,
            vBCST: 0,
            vST: 0,
            vFCPST: 0,
            vFCPSTRet: 0,
            vProd: 0,
            vFrete: 0,
            vSeg: 0,
            vDesc: 0,
            vII: 0,
            vIPI: 0,
            vIPIDevol: 0,
            vPIS: 0,
            vCOFINS: 0,
            vOutro: 0,
            vNF: 0
        });
    }
    formatData(dataUsr = new Date()) {
        const ano = dataUsr.getFullYear();
        const mes = String(dataUsr.getMonth() + 1).padStart(2, '0'); // Adiciona 1 porque os meses começam do 0
        const dia = String(dataUsr.getDate()).padStart(2, '0');
        const horas = String(dataUsr.getHours()).padStart(2, '0');
        const minutos = String(dataUsr.getMinutes()).padStart(2, '0');
        const segundos = String(dataUsr.getSeconds()).padStart(2, '0');
        const fusoHorario = -dataUsr.getTimezoneOffset() / 60; // Obtém o fuso horário em horas
        const formatoISO = `${ano}-${mes}-${dia}T${horas}:${minutos}:${segundos}${fusoHorario >= 0 ? '+' : '-'}${String(Math.abs(fusoHorario)).padStart(2, '0')}:00`;
        return formatoISO;
    }
    //Optativa
    //tpAmb, dhEmi, verAplic, serie, nDPS, dCompet, tpEmit, cLocEmi
    tagInfDPS(obj) {
        Object.keys(obj).forEach(key => {
            __classPrivateFieldGet(this, _Make_DPS, "f").infDPS[key] = obj[key];
        });
    }
    //chSubstda, cMotivo, xMotivo
    tagSubst(obj) {
        __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.subst = new Object();
        Object.keys(obj).forEach(key => {
            __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.subst[key] = obj[key];
        });
    }
    //CNPJ/CPF, IM, fone, email,  
    tagPrest(obj) {
        __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.prest = new Object();
        Object.keys(obj).forEach(key => {
            __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.prest[key] = obj[key];
            if (false && key == "xFant") { //Em analise
                __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.emit.enderEmit = {};
            }
        });
    }
    //cMun, CEP, xLgr, nro, xCpl, xBairro
    tagPrestEnd(obj) {
        __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.prest.end = new Object();
        Object.keys(obj).forEach(key => {
            if (["cMun", "CEP"].includes(key)) {
                if (typeof __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.prest.end.endNac == "undefined")
                    __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.prest.end.endNac = new Object();
                __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.prest.end.endNac[key] = obj[key];
            }
            else if (["cPais", "cEndPost", "xCidade", "xEstProvReg"].includes(key)) {
                if (typeof __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.prest.end.endExt == "undefined")
                    __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.prest.end.endExt = new Object();
                __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.prest.end.endExt[key] = obj[key];
            }
            else if (["xLgr", "nro", "xCpl", "xBairro"].includes(key)) {
                __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.prest.end[key] = obj[key];
            }
            else { //["fone", "email", etc]
                __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.prest[key] = obj[key];
            }
        });
    }
    //opSimpNac, regApTribSN, regEspTrib
    tagPrestRegTrib(obj) {
        __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.prest.regTrib = new Object();
        Object.keys(obj).forEach(key => {
            __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.prest.regTrib[key] = obj[key];
        });
    }
    //CNPJ/CNPJ, NIF, cNaoNIF, CAEPF, IM, xNome
    tagToma(obj) {
        __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.toma = new Object();
        Object.keys(obj).forEach(key => {
            __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.toma[key] = obj[key];
            if (key == "xNome")
                __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.toma.end = { endNac: {} };
        });
    }
    //cMun, CEP, xLgr, nro, xCpl, xBairro, fone, email
    tagTomaEnd(obj) {
        __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.toma.end = new Object();
        Object.keys(obj).forEach(key => {
            if (["cMun", "CEP"].includes(key)) {
                if (typeof __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.toma.end.endNac == "undefined")
                    __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.toma.end.endNac = new Object();
                __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.toma.end.endNac[key] = obj[key];
            }
            else if (["cPais", "cEndPost", "xCidade", "xEstProvReg"].includes(key)) {
                if (typeof __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.toma.end.endExt == "undefined")
                    __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.toma.end.endExt = new Object();
                __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.toma.end.endExt[key] = obj[key];
            }
            else if (["xLgr", "nro", "xCpl", "xBairro"].includes(key)) {
                __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.toma.end[key] = obj[key];
            }
            else {
                __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.toma[key] = obj[key];
            }
        });
    }
    //CNPJ/CNPJ, NIF, cNaoNIF, CAEPF, IM, xNome
    tagInterm(obj) {
        __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.interm = new Object();
        Object.keys(obj).forEach(key => {
            __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.interm[key] = obj[key];
            if (key == "xNome")
                __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.interm.end = { endNac: {} };
        });
    }
    //cMun, CEP, xLgr, nro, xCpl, xBairro, fone, email
    tagIntermEnd(obj) {
        __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.interm.end = new Object();
        Object.keys(obj).forEach(key => {
            if (["cMun", "CEP"].includes(key)) {
                if (typeof __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.interm.end.endNac == "undefined")
                    __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.interm.end.endNac = new Object();
                __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.interm.end.endNac[key] = obj[key];
            }
            else if (["cPais", "cEndPost", "xCidade", "xEstProvReg"].includes(key)) {
                if (typeof __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.interm.end.endExt == "undefined")
                    __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.interm.end.endExt = new Object();
                __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.interm.end.endExt[key] = obj[key];
            }
            else if (["xLgr", "nro", "xCpl", "xBairro"].includes(key)) {
                __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.interm.end[key] = obj[key];
            }
            else {
                __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.interm[key] = obj[key];
            }
        });
    }
    //cLocPrestacao, cTribNac, xDescServ, cIntContrib
    tagServ(obj) {
        __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.serv = new Object();
        Object.keys(obj).forEach(key => {
            if (["cLocPrestacao", "cPaisPrestacao"].includes(key)) {
                if (typeof __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.serv.locPrest == "undefined")
                    __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.serv.locPrest = new Object();
                __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.serv.locPrest[key] = obj[key];
            }
            else {
                if (typeof __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.serv.cServ == "undefined")
                    __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.serv.cServ = new Object();
                __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.serv.cServ[key] = obj[key];
            }
        });
    }
    tagServComExt(obj) {
        if (typeof __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.serv.comExt == "undefined")
            __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.serv.comExt = new Object();
        Object.keys(obj).forEach(key => {
            __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.serv.comExt[key] = obj[key];
        });
    }
    tagServLsadppu(obj) {
        if (typeof __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.serv.lsadppu == "undefined")
            __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.serv.lsadppu = new Object();
        Object.keys(obj).forEach(key => {
            __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.serv.lsadppu[key] = obj[key];
        });
    }
    tagServObra(obj) {
        if (typeof __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.serv.obra == "undefined")
            __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.serv.obra = new Object();
        Object.keys(obj).forEach(key => {
            if (["inscImobFisc", "cObra"].includes(key)) {
                __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.serv.obra[key] = obj[key];
            }
            else if (["CEP", "endExt", "xLgr", "nro", "xCpl", "xBairro"].includes(key)) {
                if (typeof __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.serv.obra.end == "undefined")
                    __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.serv.obra.end = new Object();
                __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.serv.obra[key] = obj[key];
            }
            else if (["cEndPost", "xCidade", "xEstProvReg"].includes(key)) {
                if (typeof __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.serv.obra.end.endExt == "undefined")
                    __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.serv.obra.end.endExt = new Object();
                __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.serv.obra.end.endExt[key] = obj[key];
            }
        });
    }
    tagServAtvEvento(obj) {
        if (typeof __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.serv.atvEvento == "undefined")
            __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.serv.atvEvento = new Object();
        Object.keys(obj).forEach(key => {
            if (["xNome", "dtIni", "dtFim", "idAtvEvt"].includes(key)) {
                __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.serv.atvEvento[key] = obj[key];
            }
            else if (["CEP", "endExt", "xLgr", "nro", "xCpl", "xBairro"].includes(key)) {
                if (typeof __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.serv.atvEvento.end == "undefined")
                    __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.serv.atvEvento.end = new Object();
                __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.serv.atvEvento[key] = obj[key];
            }
            else if (["cEndPost", "xCidade", "xEstProvReg"].includes(key)) {
                if (typeof __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.serv.atvEvento.end.endExt == "undefined")
                    __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.serv.atvEvento.end.endExt = new Object();
                __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.serv.atvEvento.end.endExt[key] = obj[key];
            }
        });
    }
    tagServExplRod(obj) {
        if (typeof __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.serv.explRod == "undefined")
            __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.serv.explRod = new Object();
        Object.keys(obj).forEach(key => {
            __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.serv.explRod[key] = obj[key];
        });
    }
    tagServInfoCompl(obj) {
        if (typeof __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.serv.infoCompl == "undefined")
            __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.serv.infoCompl = new Object();
        Object.keys(obj).forEach(key => {
            __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.serv.infoCompl[key] = obj[key];
        });
    }
    tagVServPrest(obj) {
        if (typeof __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.valores == "undefined")
            __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.valores = new Object();
        __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.valores.vServPrest = new Object();
        Object.keys(obj).forEach(key => {
            __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.valores.vServPrest[key] = obj[key];
        });
    }
    tagVDescCondIncond(obj) {
        if (typeof __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.valores == "undefined")
            __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.valores = new Object();
        __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.valores.vDescCondIncond = new Object();
        Object.keys(obj).forEach(key => {
            __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.valores.vDescCondIncond[key] = obj[key];
        });
    }
    tagVDedRed(obj) {
        if (typeof __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.valores == "undefined")
            __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.valores = new Object();
        __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.valores.vDedRed = new Object();
        Object.keys(obj).forEach(key => {
            __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.valores.vDedRed[key] = obj[key];
        });
    }
    tagVDedRedDoc(obj) {
        if (typeof __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.valores == "undefined")
            __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.valores = new Object();
        if (typeof __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.valores.vDedRed.docDedRed == "undefined")
            __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.valores.vDedRed.docDedRed = new Array();
        __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.valores.vDedRed.docDedRed.push(obj);
    }
    tagVDedRedDocNFSeMun(obj) {
        //!FALTA
    }
    tagTribMun(obj) {
        if (typeof __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.valores == "undefined")
            __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.valores = new Object();
        if (typeof __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.valores.trib == "undefined")
            __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.valores.trib = new Object();
        Object.keys(obj).forEach(key => {
            if (["tribISSQN", "cPaisResult", "pAliq", "tpRetISSQN"].includes(key)) {
                if (typeof __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.valores.trib.tribMun == "undefined")
                    __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.valores.trib.tribMun = new Object();
                __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.valores.trib.tribMun[key] = obj[key];
            }
            else if (["nBM", "vRedBCBM", "pRedBCBM"].includes(key)) {
                if (typeof __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.valores.trib.tribMun.BM == "undefined")
                    __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.valores.trib.tribMun.BM = new Object();
                __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.valores.trib.tribMun.BM[key] = obj[key];
            }
            else if (["tpSusp", "nProcesso", "tpImunidade", "pAliq", " tpRetISSQN"].includes(key)) {
                if (typeof __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.valores.trib.tribMun.exigSusp == "undefined")
                    __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.valores.trib.tribMun.exigSusp = new Object();
                __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.valores.trib.tribMun.exigSusp[key] = obj[key];
            }
        });
    }
    tagTotTribPTotTrib(obj) {
        if (typeof __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.valores == "undefined")
            __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.valores = new Object();
        if (typeof __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.valores.trib == "undefined")
            __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.valores.trib = new Object();
        __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.valores.trib.totTrib = new Object();
        __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.valores.trib.totTrib.pTotTrib = new Object();
        Object.keys(obj).forEach(key => {
            __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.valores.trib.totTrib.pTotTrib[key] = obj[key];
        });
    }
    xml() {
        if (__classPrivateFieldGet(this, _Make_DPS, "f").infDPS[`@Id`] == null)
            __classPrivateFieldGet(this, _Make_DPS, "f").infDPS[`@Id`] = `DPS${__classPrivateFieldGet(this, _Make_instances, "m", _Make_gerarChaveNFe).call(this)}`;
        let tempBuild = new XMLBuilder({
            ignoreAttributes: false,
            attributeNamePrefix: "@"
        });
        return `<?xml version="1.0" encoding="utf-8" ?>` + tempBuild.build({ DPS: __classPrivateFieldGet(this, _Make_DPS, "f") });
    }
}
_Make_DPS = new WeakMap(), _Make_ICMSTot = new WeakMap(), _Make_instances = new WeakSet(), _Make_gerarChaveNFe = function _Make_gerarChaveNFe() {
    if (!__classPrivateFieldGet(this, _Make_DPS, "f")?.infDPS) {
        throw new Error("Estrutura inválida: this.#DPS.infDPS não encontrado.");
    }
    const onlyDigits = (v) => String(v ?? "").replace(/\D+/g, "");
    const pad = (v, len) => v.padStart(len, "0");
    // Município (IBGE 7 dígitos)
    const cMunRaw = __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.cLocEmi ?? __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.cMun;
    const cMun = pad(String(cMunRaw ?? ""), 7);
    if (!/^\d{7}$/.test(cMun)) {
        throw new Error("cMun/cLocEmi inválido: preencha o código IBGE (7 dígitos).");
    }
    // Documento do prestador (CNPJ/CPF) e tipo de inscrição
    const cnpj = onlyDigits(__classPrivateFieldGet(this, _Make_DPS, "f").infDPS.prest?.CNPJ);
    const cpf = onlyDigits(__classPrivateFieldGet(this, _Make_DPS, "f").infDPS.prest?.CPF);
    const tipoInscricao = cnpj ? "2" : (cpf ? "1" : "");
    if (!tipoInscricao) {
        throw new Error("Informe CNPJ (prest.CNPJ) ou CPF (prest.CPF) do prestador.");
    }
    const doc14 = pad(cnpj || cpf, 14);
    // Série (5 dígitos) e Número (15 dígitos)
    const serie = pad(onlyDigits(__classPrivateFieldGet(this, _Make_DPS, "f").infDPS.serie), 5);
    const numero = pad(onlyDigits(__classPrivateFieldGet(this, _Make_DPS, "f").infDPS.nDPS ?? __classPrivateFieldGet(this, _Make_DPS, "f").infDPS.nDps), 15);
    if (!/^\d{5}$/.test(serie)) {
        throw new Error("Série inválida: use apenas dígitos; será zero-padded para 5 posições.");
    }
    if (!/^\d{15}$/.test(numero)) {
        throw new Error("Número inválido: use apenas dígitos; será zero-padded para 15 posições.");
    }
    return `${cMun}${tipoInscricao}${doc14}${serie}${numero}`;
}, _Make_calICMSTot = function _Make_calICMSTot(obj) {
    Object.keys(obj).map(key => {
        if (__classPrivateFieldGet(this, _Make_ICMSTot, "f")[key] !== undefined) {
            __classPrivateFieldGet(this, _Make_ICMSTot, "f")[key] += (obj[key]) * 1;
        }
    });
};
export { Make };
export default { Make };
