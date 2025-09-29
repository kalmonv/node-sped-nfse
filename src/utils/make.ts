
import { XMLParser, XMLBuilder, XMLValidator } from "fast-xml-parser";
import { urlEventos } from "./eventos.js"
import { cUF2UF } from "./extras.js"

//Classe da nota fiscal
class Make {
    #DPS: {
        [key: string]: any;
        infDPS: { [key: string]: any }
    } = {
            "@xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
            //"@xsi:schemaLocation": "http://www.sped.fazenda.gov.br/nfse DPS_v1.00.xsd",
            "@xmlns": "http://www.sped.fazenda.gov.br/nfse",
            "@versao": "1.00",
            infDPS: {
                //"@xmlns": "http://www.portalfiscal.inf.br/nfe",
            }
        };
    #ICMSTot: Record<string, number> = {
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
    };

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
    tagInfDPS(obj: any) {
        Object.keys(obj).forEach(key => {
            this.#DPS.infDPS[key] = obj[key];
        });
    }

    //chSubstda, cMotivo, xMotivo
    tagSubst(obj: any) {
        this.#DPS.infDPS.subst = new Object();
        Object.keys(obj).forEach(key => {
            this.#DPS.infDPS.subst[key] = obj[key];
        });
    }

    //CNPJ/CPF, IM, fone, email,  
    tagPrest(obj: any) {
        this.#DPS.infDPS.prest = new Object();
        Object.keys(obj).forEach(key => {
            this.#DPS.infDPS.prest[key] = obj[key];
            if (false && key == "xFant") { //Em analise
                this.#DPS.infDPS.emit.enderEmit = {};
            }
        });
    }

    //cMun, CEP, xLgr, nro, xCpl, xBairro
    tagPrestEnd(obj: any) {
        this.#DPS.infDPS.prest.end = new Object();
        Object.keys(obj).forEach(key => {
            if (["cMun", "CEP"].includes(key)) {
                if (typeof this.#DPS.infDPS.prest.end.endNac == "undefined")
                    this.#DPS.infDPS.prest.end.endNac = new Object();
                this.#DPS.infDPS.prest.end.endNac[key] = obj[key];

            } else if (["cPais", "cEndPost", "xCidade", "xEstProvReg"].includes(key)) {
                if (typeof this.#DPS.infDPS.prest.end.endExt == "undefined")
                    this.#DPS.infDPS.prest.end.endExt = new Object();
                this.#DPS.infDPS.prest.end.endExt[key] = obj[key];

            } else if (["xLgr", "nro", "xCpl", "xBairro"].includes(key)) {
                this.#DPS.infDPS.prest.end[key] = obj[key];

            } else { //["fone", "email", etc]
                this.#DPS.infDPS.prest[key] = obj[key];
            }
        });
    }

    //opSimpNac, regApTribSN, regEspTrib
    tagPrestRegTrib(obj: any) {
        this.#DPS.infDPS.prest.regTrib = new Object();
        Object.keys(obj).forEach(key => {
            this.#DPS.infDPS.prest.regTrib[key] = obj[key];
        });
    }

    //CNPJ/CNPJ, NIF, cNaoNIF, CAEPF, IM, xNome
    tagToma(obj: any) {
        this.#DPS.infDPS.toma = new Object();
        Object.keys(obj).forEach(key => {
            this.#DPS.infDPS.toma[key] = obj[key];
            if (key == "xNome") this.#DPS.infDPS.toma.end = { endNac: {} };
        });
    }

    //cMun, CEP, xLgr, nro, xCpl, xBairro, fone, email
    tagTomaEnd(obj: any) {
        this.#DPS.infDPS.toma.end = new Object();
        Object.keys(obj).forEach(key => {
            if (["cMun", "CEP"].includes(key)) {
                if (typeof this.#DPS.infDPS.toma.end.endNac == "undefined")
                    this.#DPS.infDPS.toma.end.endNac = new Object();
                this.#DPS.infDPS.toma.end.endNac[key] = obj[key];

            } else if (["cPais", "cEndPost", "xCidade", "xEstProvReg"].includes(key)) {
                if (typeof this.#DPS.infDPS.toma.end.endExt == "undefined")
                    this.#DPS.infDPS.toma.end.endExt = new Object();
                this.#DPS.infDPS.toma.end.endExt[key] = obj[key];

            } else if (["xLgr", "nro", "xCpl", "xBairro"].includes(key)) {
                this.#DPS.infDPS.toma.end[key] = obj[key];

            } else {
                this.#DPS.infDPS.toma[key] = obj[key];
            }
        });
    }

    //CNPJ/CNPJ, NIF, cNaoNIF, CAEPF, IM, xNome
    tagInterm(obj: any) {
        this.#DPS.infDPS.interm = new Object();
        Object.keys(obj).forEach(key => {
            this.#DPS.infDPS.interm[key] = obj[key];
            if (key == "xNome") this.#DPS.infDPS.interm.end = { endNac: {} };
        });
    }

    //cMun, CEP, xLgr, nro, xCpl, xBairro, fone, email
    tagIntermEnd(obj: any) {
        this.#DPS.infDPS.interm.end = new Object();
        Object.keys(obj).forEach(key => {
            if (["cMun", "CEP"].includes(key)) {
                if (typeof this.#DPS.infDPS.interm.end.endNac == "undefined")
                    this.#DPS.infDPS.interm.end.endNac = new Object();
                this.#DPS.infDPS.interm.end.endNac[key] = obj[key];

            } else if (["cPais", "cEndPost", "xCidade", "xEstProvReg"].includes(key)) {
                if (typeof this.#DPS.infDPS.interm.end.endExt == "undefined")
                    this.#DPS.infDPS.interm.end.endExt = new Object();
                this.#DPS.infDPS.interm.end.endExt[key] = obj[key];

            } else if (["xLgr", "nro", "xCpl", "xBairro"].includes(key)) {
                this.#DPS.infDPS.interm.end[key] = obj[key];

            } else {
                this.#DPS.infDPS.interm[key] = obj[key];
            }
        });
    }

    //cLocPrestacao, cTribNac, xDescServ, cIntContrib
    tagServ(obj: any) { //locPrest +comExt
        this.#DPS.infDPS.serv = new Object();
        Object.keys(obj).forEach(key => {
            if (["cLocPrestacao", "cPaisPrestacao"].includes(key)) {
                if (typeof this.#DPS.infDPS.serv.locPrest == "undefined")
                    this.#DPS.infDPS.serv.locPrest = new Object();
                this.#DPS.infDPS.serv.locPrest[key] = obj[key];

            } else {
                if (typeof this.#DPS.infDPS.serv.cServ == "undefined")
                    this.#DPS.infDPS.serv.cServ = new Object();
                this.#DPS.infDPS.serv.cServ[key] = obj[key];

            }
        });
    }

    tagServComExt(obj: any) {
        if (typeof this.#DPS.infDPS.serv.comExt == "undefined")
            this.#DPS.infDPS.serv.comExt = new Object();
        Object.keys(obj).forEach(key => {
            this.#DPS.infDPS.serv.comExt[key] = obj[key];
        });
    }

    tagServLsadppu(obj: any) {
        if (typeof this.#DPS.infDPS.serv.lsadppu == "undefined")
            this.#DPS.infDPS.serv.lsadppu = new Object();
        Object.keys(obj).forEach(key => {
            this.#DPS.infDPS.serv.lsadppu[key] = obj[key];
        });
    }

    tagServObra(obj: any) {
        if (typeof this.#DPS.infDPS.serv.obra == "undefined")
            this.#DPS.infDPS.serv.obra = new Object();
        Object.keys(obj).forEach(key => {
            if (["inscImobFisc", "cObra"].includes(key)) {
                this.#DPS.infDPS.serv.obra[key] = obj[key];
            } else if (["CEP", "endExt", "xLgr", "nro", "xCpl", "xBairro"].includes(key)) {
                if (typeof this.#DPS.infDPS.serv.obra.end == "undefined")
                    this.#DPS.infDPS.serv.obra.end = new Object();
                this.#DPS.infDPS.serv.obra[key] = obj[key];
            } else if (["cEndPost", "xCidade", "xEstProvReg"].includes(key)) {
                if (typeof this.#DPS.infDPS.serv.obra.end.endExt == "undefined")
                    this.#DPS.infDPS.serv.obra.end.endExt = new Object();
                this.#DPS.infDPS.serv.obra.end.endExt[key] = obj[key];
            }
        });
    }

    tagServAtvEvento(obj: any) {
        if (typeof this.#DPS.infDPS.serv.atvEvento == "undefined")
            this.#DPS.infDPS.serv.atvEvento = new Object();
        Object.keys(obj).forEach(key => {
            if (["xNome", "dtIni", "dtFim", "idAtvEvt"].includes(key)) {
                this.#DPS.infDPS.serv.atvEvento[key] = obj[key];
            } else if (["CEP", "endExt", "xLgr", "nro", "xCpl", "xBairro"].includes(key)) {
                if (typeof this.#DPS.infDPS.serv.atvEvento.end == "undefined")
                    this.#DPS.infDPS.serv.atvEvento.end = new Object();
                this.#DPS.infDPS.serv.atvEvento[key] = obj[key];
            } else if (["cEndPost", "xCidade", "xEstProvReg"].includes(key)) {
                if (typeof this.#DPS.infDPS.serv.atvEvento.end.endExt == "undefined")
                    this.#DPS.infDPS.serv.atvEvento.end.endExt = new Object();
                this.#DPS.infDPS.serv.atvEvento.end.endExt[key] = obj[key];
            }
        });
    }

    tagServExplRod(obj: any) {
        if (typeof this.#DPS.infDPS.serv.explRod == "undefined")
            this.#DPS.infDPS.serv.explRod = new Object();
        Object.keys(obj).forEach(key => {
            this.#DPS.infDPS.serv.explRod[key] = obj[key];
        });
    }

    tagServInfoCompl(obj: any) {
        if (typeof this.#DPS.infDPS.serv.infoCompl == "undefined")
            this.#DPS.infDPS.serv.infoCompl = new Object();
        Object.keys(obj).forEach(key => {
            this.#DPS.infDPS.serv.infoCompl[key] = obj[key];
        });
    }

    tagVServPrest(obj: any) {
        if (typeof this.#DPS.infDPS.valores == "undefined")
            this.#DPS.infDPS.valores = new Object();
        this.#DPS.infDPS.valores.vServPrest = new Object();
        Object.keys(obj).forEach(key => {
            this.#DPS.infDPS.valores.vServPrest[key] = obj[key];
        });
    }

    tagVDescCondIncond(obj: any) {
        if (typeof this.#DPS.infDPS.valores == "undefined")
            this.#DPS.infDPS.valores = new Object();
        this.#DPS.infDPS.valores.vDescCondIncond = new Object();
        Object.keys(obj).forEach(key => {
            this.#DPS.infDPS.valores.vDescCondIncond[key] = obj[key];
        });
    }

    tagVDedRed(obj: any) {
        if (typeof this.#DPS.infDPS.valores == "undefined")
            this.#DPS.infDPS.valores = new Object();
        this.#DPS.infDPS.valores.vDedRed = new Object();
        Object.keys(obj).forEach(key => {
            this.#DPS.infDPS.valores.vDedRed[key] = obj[key];
        });
    }

    tagVDedRedDoc(obj: any) {
        if (typeof this.#DPS.infDPS.valores == "undefined")
            this.#DPS.infDPS.valores = new Object();
        if (typeof this.#DPS.infDPS.valores.vDedRed.docDedRed == "undefined")
            this.#DPS.infDPS.valores.vDedRed.docDedRed = new Array();
        this.#DPS.infDPS.valores.vDedRed.docDedRed.push(obj);
    }

    tagVDedRedDocNFSeMun(obj: any) {
        //!FALTA
    }

    tagTribMun(obj: any) {
        if (typeof this.#DPS.infDPS.valores == "undefined")
            this.#DPS.infDPS.valores = new Object();

        if (typeof this.#DPS.infDPS.valores.trib == "undefined")
            this.#DPS.infDPS.valores.trib = new Object();

        Object.keys(obj).forEach(key => {
            if (["tribISSQN", "cPaisResult", "pAliq", "tpRetISSQN"].includes(key)) {
                if (typeof this.#DPS.infDPS.valores.trib.tribMun == "undefined")
                    this.#DPS.infDPS.valores.trib.tribMun = new Object();
                this.#DPS.infDPS.valores.trib.tribMun[key] = obj[key];

            } else if (["nBM", "vRedBCBM", "pRedBCBM"].includes(key)) {
                if (typeof this.#DPS.infDPS.valores.trib.tribMun.BM == "undefined")
                    this.#DPS.infDPS.valores.trib.tribMun.BM = new Object();
                this.#DPS.infDPS.valores.trib.tribMun.BM[key] = obj[key];

            } else if (["tpSusp", "nProcesso", "tpImunidade", "pAliq", " tpRetISSQN"].includes(key)) {
                if (typeof this.#DPS.infDPS.valores.trib.tribMun.exigSusp == "undefined")
                    this.#DPS.infDPS.valores.trib.tribMun.exigSusp = new Object();
                this.#DPS.infDPS.valores.trib.tribMun.exigSusp[key] = obj[key];
            }
        });
    }

    tagTotTribPTotTrib(obj: any) {
        if (typeof this.#DPS.infDPS.valores == "undefined")
            this.#DPS.infDPS.valores = new Object();

        if (typeof this.#DPS.infDPS.valores.trib == "undefined")
            this.#DPS.infDPS.valores.trib = new Object();

        this.#DPS.infDPS.valores.trib.totTrib = new Object();
        this.#DPS.infDPS.valores.trib.totTrib.pTotTrib = new Object();
        Object.keys(obj).forEach(key => {
            this.#DPS.infDPS.valores.trib.totTrib.pTotTrib[key] = obj[key];
        });
    }

    //Sistema gera a chave da nota fiscal
    #gerarChaveNFe() {
        if (!this.#DPS?.infDPS) {
            throw new Error("Estrutura inválida: this.#DPS.infDPS não encontrado.");
        }

        const onlyDigits = (v: any) => String(v ?? "").replace(/\D+/g, "");
        const pad = (v: string, len: number) => v.padStart(len, "0");

        // Município (IBGE 7 dígitos)
        const cMunRaw = this.#DPS.infDPS.cLocEmi ?? this.#DPS.infDPS.cMun;
        const cMun = pad(String(cMunRaw ?? ""), 7);
        if (!/^\d{7}$/.test(cMun)) {
            throw new Error("cMun/cLocEmi inválido: preencha o código IBGE (7 dígitos).");
        }

        // Documento do prestador (CNPJ/CPF) e tipo de inscrição
        const cnpj = onlyDigits(this.#DPS.infDPS.prest?.CNPJ);
        const cpf = onlyDigits(this.#DPS.infDPS.prest?.CPF);
        const tipoInscricao = cnpj ? "2" : (cpf ? "1" : "");
        if (!tipoInscricao) {
            throw new Error("Informe CNPJ (prest.CNPJ) ou CPF (prest.CPF) do prestador.");
        }
        const doc14 = pad(cnpj || cpf, 14);

        // Série (5 dígitos) e Número (15 dígitos)
        const serie = pad(onlyDigits(this.#DPS.infDPS.serie), 5);
        const numero = pad(onlyDigits(this.#DPS.infDPS.nDPS ?? this.#DPS.infDPS.nDps), 15);
        if (!/^\d{5}$/.test(serie)) {
            throw new Error("Série inválida: use apenas dígitos; será zero-padded para 5 posições.");
        }
        if (!/^\d{15}$/.test(numero)) {
            throw new Error("Número inválido: use apenas dígitos; será zero-padded para 15 posições.");
        }

        return `${cMun}${tipoInscricao}${doc14}${serie}${numero}`
    }

    xml() {
        if (this.#DPS.infDPS[`@Id`] == null) this.#DPS.infDPS[`@Id`] = `DPS${this.#gerarChaveNFe()}`;
        let tempBuild = new XMLBuilder({
            ignoreAttributes: false,
            attributeNamePrefix: "@"
        });
        return `<?xml version="1.0" encoding="UTF-8"?>`+tempBuild.build({ DPS: this.#DPS });
    }

    //Obtem os dados de importo e soma no total, utlizado sempre que for setado algum imposto.
    #calICMSTot(obj: any) {
        Object.keys(obj).map(key => {
            if (this.#ICMSTot[key] !== undefined) {
                this.#ICMSTot[key] += (obj[key]) * 1;
            }
        });

    }
}


export { Make }
export default { Make }