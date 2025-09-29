var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Tools_instances, _Tools_cert, _Tools_pem, _Tools_config, _Tools_getSignature, _Tools_gerarQRCodeNFCe, _Tools_descEvento, _Tools_xmlValido, _Tools_certTools, _Tools_limparSoap;
import { XMLBuilder } from "fast-xml-parser";
import https from "https";
import { spawnSync } from "child_process";
import tmp from "tmp";
import crypto from "crypto";
import { urlEventos } from "./eventos.js";
import fs from "fs";
import path from 'path';
import { fileURLToPath } from 'url';
import pem from 'pem';
import { cUF2UF, json2xml, xml2json, formatData, UF2cUF } from "./extras.js";
import { SignedXml } from 'xml-crypto';
import zlib from 'zlib';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
class Tools {
    constructor(config = { mod: "", xmllint: 'xmllint', UF: '', tpAmb: 2, CSC: "", CSCid: "", versao: "4.00", timeout: 30, openssl: null, CPF: "", CNPJ: "" }, certificado = { pfx: "", senha: "" }) {
        _Tools_instances.add(this);
        _Tools_cert.set(this, void 0);
        _Tools_pem.set(this, {
            key: "", // A chave privada extraída do PKCS#12, em formato PEM
            cert: "", // O certificado extraído, em formato PEM
            ca: [] // Uma lista de certificados da cadeia (se houver), ou null
        });
        _Tools_config.set(this, void 0);
        if (typeof config != "object")
            throw "Tools({config},{}): Config deve ser um objecto!";
        if (typeof config.UF == "undefined")
            throw "Tools({...,UF:?},{}): UF não definida!";
        if (typeof config.tpAmb == "undefined")
            throw "Tools({...,tpAmb:?},{}): tpAmb não definida!";
        if (typeof config.versao == "undefined")
            throw "Tools({...,versao:?},{}): versao não definida!";
        //Default do sistema
        if (typeof config.timeout == "undefined")
            config.timeout = 30;
        if (typeof config.xmllint == "undefined")
            config.xmllint = 'xmllint';
        if (typeof config.openssl == "undefined")
            config.openssl = null;
        //Configurar certificado
        __classPrivateFieldSet(this, _Tools_config, config, "f");
        __classPrivateFieldSet(this, _Tools_cert, certificado, "f");
    }
    async enviarDPS2(xmlDPS) {
        await __classPrivateFieldGet(this, _Tools_instances, "m", _Tools_certTools).call(this); // carrega pfx, passphrase, etc.
        const base = __classPrivateFieldGet(this, _Tools_config, "f").tpAmb === 1
            ? 'https://adn.nfse.gov.br/contribuintes'
            : 'https://adn.producaorestrita.nfse.gov.br/contribuintes';
        const url = `${base}/nfse`;
        return new Promise(async (resolve, reject) => {
            try {
                const req = https.request(url, {
                    ...{
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/xml; charset=utf-8',
                            'Accept': 'application/xml' // retorno é a NFSe XML (muitas vezes GZip+B64 no payload do JSON só em outras APIs)
                        },
                        timeout: 60000,
                    },
                    ...(await __classPrivateFieldGet(this, _Tools_instances, "m", _Tools_certTools).call(this)) // pfx, passphrase, ca, etc.
                }, (res) => {
                    let data = '';
                    res.on('data', (chunk) => (data += chunk));
                    res.on('end', () => resolve({ status: res.statusCode ?? 0, body: data }));
                });
                req.on('error', reject);
                req.write(xmlDPS); // XML puro, sem gzip/base64
                req.end();
            }
            catch (e) {
                reject(e);
            }
        });
    }
    gzipB64(xml) {
        const gz = zlib.gzipSync(Buffer.from(xml, 'utf-8'));
        return gz.toString('base64');
    }
    normalizeUtf8Xml(xml) {
        // remove BOM
        if (xml.charCodeAt(0) === 0xFEFF)
            xml = xml.slice(1);
        // força header UTF-8 (insere se não existir)
        if (/^<\?xml/i.test(xml)) {
            xml = xml.replace(/<\?xml[^>]*\?>/i, '<?xml version="1.0" encoding="UTF-8"?>');
        }
        else {
            xml = '<?xml version="1.0" encoding="UTF-8"?>\n' + xml;
        }
        return xml;
    }
    async checkConvenio(codigoMunicipio) {
        return new Promise(async (resolve, reject) => {
            //this.#config?.tpAmb 1
            const req = https.request(urlEventos?.gov?.[1 == 1 ? 'producao' : 'homologacao']?.ParamConvenio.replace("{codigoMunicipio}", codigoMunicipio), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Accept': 'application/json',
                },
                // ideal: true em produção; você havia desativado a verificação
                rejectUnauthorized: false,
                ...(await __classPrivateFieldGet(this, _Tools_instances, "m", _Tools_certTools).call(this)) // mTLS: cert/ key ou pfx/passphrase
            }, (res) => {
                let data = '';
                res.on('data', (chunk) => (data += chunk));
                res.on('end', () => {
                    // tente parsear JSON; se falhar, devolve string
                    try {
                        resolve(JSON.parse(data));
                    }
                    catch {
                        resolve(data);
                    }
                });
            });
            req.on('timeout', () => req.destroy(new Error('Timeout')));
            req.on('error', reject);
            req.end();
        });
    }
    async enviarDPS(xml) {
        const isLote = Array.isArray(xml);
        //xml = this.normalizeUtf8Xml(xml)
        // >>> IMPORTANTÍSSIMO: deixe NFSeEnvio apontar pro SEFIN (não pro ADN)
        // Ex.: this.urlEventos.gov.homologacao.NFSeEnvio = 'https://sefin.nfse.gov.br/sefinnacional/nfse'
        const url = isLote
            ? (urlEventos?.gov?.[__classPrivateFieldGet(this, _Tools_config, "f")?.tpAmb == 1 ? 'producao' : 'homologacao']?.LoteEnvio)
            : (urlEventos?.gov?.[__classPrivateFieldGet(this, _Tools_config, "f")?.tpAmb == 1 ? 'producao' : 'homologacao']?.NFSeEnvio);
        const body = isLote
            ? { LoteXmlGZipB64: xml.map(this.gzipB64) }
            : { dpsXmlGZipB64: this.gzipB64(xml) };
        const payload = JSON.stringify(body);
        return new Promise(async (resolve, reject) => {
            const req = https.request(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Accept': 'application/json',
                    'Content-Length': Buffer.byteLength(payload).toString()
                },
                // ideal: true em produção; você havia desativado a verificação
                rejectUnauthorized: false,
                ...(await __classPrivateFieldGet(this, _Tools_instances, "m", _Tools_certTools).call(this)) // mTLS: cert/ key ou pfx/passphrase
            }, (res) => {
                let data = '';
                res.on('data', (chunk) => (data += chunk));
                res.on('end', () => {
                    // tente parsear JSON; se falhar, devolve string
                    try {
                        resolve(JSON.parse(data));
                    }
                    catch {
                        resolve(data);
                    }
                });
            });
            req.setTimeout(__classPrivateFieldGet(this, _Tools_config, "f").timeout * 1000, () => {
                reject({
                    name: 'TimeoutError',
                    message: 'The operation was aborted due to timeout'
                });
                req.destroy(); // cancela a requisição
            });
            req.on('timeout', () => req.destroy(new Error('Timeout')));
            req.on('error', reject);
            req.write(payload);
            req.end();
        });
    }
    async xmlSign(xmlJSON, data = { tag: "infDPS" }) {
        return new Promise(async (resvol, reject) => {
            if (data.tag === undefined)
                data.tag = "infDPS";
            var xml = await this.xml2json(xmlJSON);
            if (data.tag == "infDPS") {
                xml.DPS = {
                    ...xml.DPS,
                    ...await xml2json(await __classPrivateFieldGet(this, _Tools_instances, "m", _Tools_getSignature).call(this, xmlJSON, data.tag))
                };
            }
            else if (data.tag == "infEvento") {
                xml.envEvento.evento = {
                    ...xml.envEvento.evento,
                    ...(await xml2json(await __classPrivateFieldGet(this, _Tools_instances, "m", _Tools_getSignature).call(this, xmlJSON, data.tag)))
                };
            }
            resvol(await json2xml(xml));
        });
    }
    async xml2json(xml) {
        return new Promise((resvol, reject) => {
            xml2json(xml).then(resvol).catch(reject);
        });
    }
    async json2xml(obj) {
        return new Promise((resvol, reject) => {
            json2xml(obj).then(resvol).catch(reject);
        });
    }
    //Obter certificado 
    async getCertificado() {
        return new Promise(async (resvol, reject) => {
            __classPrivateFieldGet(this, _Tools_instances, "m", _Tools_certTools).call(this).then(resvol).catch(reject);
        });
    }
    //Consulta NFe
    consultarNFe(chNFe) {
        return new Promise(async (resolve, reject) => {
            if (!chNFe || chNFe.length !== 44) {
                return reject("consultarNFe(chNFe) -> chave inválida!");
            }
            let cUF = `${chNFe}`.substring(0, 2);
            let UF = cUF2UF[cUF];
            let mod = `${chNFe}`.substring(20, 22);
            if (typeof __classPrivateFieldGet(this, _Tools_config, "f").tpAmb === "undefined")
                throw "consultarNFe({...tpAmb}) -> não definido!";
            let consSitNFe = {
                "@xmlns": "http://www.portalfiscal.inf.br/nfe",
                "@versao": "4.00",
                "tpAmb": __classPrivateFieldGet(this, _Tools_config, "f").tpAmb,
                "xServ": "CONSULTAR",
                "chNFe": chNFe
            };
            let xmlObj = {
                "soap:Envelope": {
                    "@xmlns:soap": "http://www.w3.org/2003/05/soap-envelope",
                    "@xmlns:nfe": "http://www.portalfiscal.inf.br/nfe/wsdl/NFeConsultaProtocolo4",
                    "soap:Body": {
                        "nfe:nfeDadosMsg": {
                            "consSitNFe": consSitNFe
                        }
                    }
                }
            };
            try {
                const builder = new XMLBuilder({
                    ignoreAttributes: false,
                    attributeNamePrefix: "@"
                });
                // Validação do XML interno (opcional)
                await __classPrivateFieldGet(this, _Tools_instances, "m", _Tools_xmlValido).call(this, builder.build({ consSitNFe }), `consSitNFe_v${__classPrivateFieldGet(this, _Tools_config, "f").versao}`).catch(reject);
                ;
                const xml = builder.build(xmlObj);
                let tempUF = "";
                const url = "";
                const req = https.request(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/soap+xml; charset=utf-8',
                        'Content-Length': xml.length,
                    },
                    rejectUnauthorized: false,
                    ...await __classPrivateFieldGet(this, _Tools_instances, "m", _Tools_certTools).call(this)
                }, (res) => {
                    let data = '';
                    res.on('data', (chunk) => data += chunk);
                    res.on('end', async () => {
                        try {
                            resolve(await __classPrivateFieldGet(this, _Tools_instances, "m", _Tools_limparSoap).call(this, data));
                        }
                        catch (error) {
                            resolve(data);
                        }
                    });
                });
                req.setTimeout(__classPrivateFieldGet(this, _Tools_config, "f").timeout * 1000, () => {
                    reject({
                        name: 'TimeoutError',
                        message: 'The operation was aborted due to timeout'
                    });
                    req.destroy(); // cancela a requisição
                });
                req.on('error', (err) => reject(err));
                req.write(xml);
                req.end();
            }
            catch (err) {
                reject(err);
            }
        });
    }
    async sefazEvento({ chNFe = "", tpEvento = "", nProt = "", xJust = "", nSeqEvento = 1, dhEvento = formatData() }) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!chNFe)
                    throw "sefazEvento({chNFe}) -> não definido!";
                if (!tpEvento)
                    throw "sefazEvento({tpEvento}) -> não definido!";
                if (!__classPrivateFieldGet(this, _Tools_config, "f").CNPJ && !__classPrivateFieldGet(this, _Tools_config, "f").CPF)
                    throw "new Tools({CNPJ|CPF}) -> não definido!";
                const geradorLote = function () {
                    const agora = new Date();
                    const ano = agora.getFullYear().toString().slice(2); // Só os 2 últimos dígitos do ano
                    const mes = String(agora.getMonth() + 1).padStart(2, '0');
                    const dia = String(agora.getDate()).padStart(2, '0');
                    const hora = String(agora.getHours()).padStart(2, '0');
                    const minuto = String(agora.getMinutes()).padStart(2, '0');
                    const segundo = String(agora.getSeconds()).padStart(2, '0');
                    // Junta tudo
                    let idLote = `${ano}${mes}${dia}${hora}${minuto}${segundo}`;
                    // Se ainda tiver menos de 15 dígitos, adiciona um número aleatório no final
                    while (idLote.length < 15) {
                        idLote += Math.floor(Math.random() * 10); // Adiciona dígitos aleatórios
                    }
                    return idLote;
                };
                let detEvento = {
                    "@versao": "1.00",
                    "descEvento": __classPrivateFieldGet(this, _Tools_instances, "m", _Tools_descEvento).call(this, `${tpEvento}`)
                };
                const cOrgao = !['210200', '210210', '210220', '210240'].includes(tpEvento) ? chNFe.substring(0, 2) : '91';
                // Adicionar campos específicos por tipo de evento
                if (tpEvento === "110111") { // Cancelamento
                    if (!nProt)
                        throw "sefazEvento({nProt}) obrigatório para Cancelamento!";
                    if (!xJust)
                        throw "sefazEvento({xJust}) obrigatório para Cancelamento!";
                    detEvento["nProt"] = nProt;
                    detEvento["xJust"] = xJust;
                }
                else if (tpEvento === "110110") { // Carta de Correção
                    if (!xJust)
                        throw "sefazEvento({xJust}) obrigatório para Carta de Correção!";
                    detEvento["xCorrecao"] = xJust;
                    detEvento["xCondUso"] = "A Carta de Correcao e disciplinada pelo paragrafo 1o-A do art. 7o do Convenio S/N, de 15 de dezembro de 1970 e pode ser utilizada para regularizacao de erro ocorrido na emissao de documento fiscal, desde que o erro nao esteja relacionado com: I - as variaveis que determinam o valor do imposto tais como: base de calculo, aliquota, diferenca de preco, quantidade, valor da operacao ou da prestacao; II - a correcao de dados cadastrais que implique mudanca do remetente ou do destinatario; III - a data de emissao ou de saida.";
                }
                else if (tpEvento === "210240") { // Operação não realizada
                    if (!xJust)
                        throw "sefazEvento({xJust}) obrigatório para Operação não realizada!";
                    detEvento["xJust"] = xJust;
                }
                // Ciência (210210), Confirmação (210200), Desconhecimento (210220) não precisam de campos extras
                const tempUF = "urlEventos(cUF2UF[cOrgao], this.#config.versao)";
                const evento = {
                    "envEvento": {
                        "@xmlns": "http://www.portalfiscal.inf.br/nfe",
                        "@versao": "1.00",
                        "idLote": "250429141621528",
                        "evento": {
                            "@xmlns": "http://www.portalfiscal.inf.br/nfe",
                            "@versao": "1.00",
                            "infEvento": {
                                "@Id": `ID${tpEvento}${chNFe}${nSeqEvento.toString().padStart(2, '0')}`,
                                cOrgao,
                                "tpAmb": __classPrivateFieldGet(this, _Tools_config, "f").tpAmb,
                                "CNPJ": __classPrivateFieldGet(this, _Tools_config, "f").CNPJ,
                                "chNFe": chNFe,
                                dhEvento,
                                "tpEvento": tpEvento,
                                "nSeqEvento": nSeqEvento,
                                "verEvento": "1.00",
                                "detEvento": detEvento
                            }
                        }
                    }
                };
                let xmlSing = await json2xml(evento);
                xmlSing = await this.xmlSign(xmlSing, { tag: "infEvento" }); //Assinado
                await __classPrivateFieldGet(this, _Tools_instances, "m", _Tools_xmlValido).call(this, xmlSing, `envEvento_v1.00`).catch(reject); //Validar corpo
                xmlSing = await json2xml({
                    "soap:Envelope": {
                        "@xmlns:soap": "http://www.w3.org/2003/05/soap-envelope",
                        "@xmlns:nfe": "http://www.portalfiscal.inf.br/nfe/wsdl/NFeRecepcaoEvento4",
                        "soap:Body": {
                            "nfe:nfeDadosMsg": {
                                ...await xml2json(xmlSing),
                                "@xmlns": "http://www.portalfiscal.inf.br/nfe/wsdl/NFeRecepcaoEvento4"
                            }
                        }
                    }
                });
                try {
                    const req = https.request("tempUF[`mod${chNFe.substring(20, 22)}`][(this.#config.tpAmb == 1 ? )].NFeRecepcaoEvento", {
                        ...{
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/soap+xml; charset=utf-8',
                                'Content-Length': xmlSing.length,
                            },
                            rejectUnauthorized: false,
                        },
                        ...await __classPrivateFieldGet(this, _Tools_instances, "m", _Tools_certTools).call(this)
                    }, (res) => {
                        let data = '';
                        res.on('data', (chunk) => {
                            data += chunk;
                        });
                        res.on('end', async () => {
                            try {
                                resolve(await __classPrivateFieldGet(this, _Tools_instances, "m", _Tools_limparSoap).call(this, data));
                            }
                            catch (error) {
                                resolve(data);
                            }
                        });
                    });
                    req.setTimeout(__classPrivateFieldGet(this, _Tools_config, "f").timeout * 1000, () => {
                        reject({
                            name: 'TimeoutError',
                            message: 'The operation was aborted due to timeout'
                        });
                        req.destroy(); // cancela a requisição
                    });
                    req.on('error', (erro) => {
                        reject(erro);
                    });
                    req.write(xmlSing);
                    req.end();
                }
                catch (erro) {
                    reject(erro);
                }
            }
            catch (erro) {
                reject(erro);
            }
        });
    }
    async sefazDistDFe({ ultNSU = undefined, chNFe = undefined }) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!chNFe && !ultNSU)
                    throw "sefazDistDFe({chNFe|ultNSU})";
                if (!__classPrivateFieldGet(this, _Tools_config, "f").CNPJ)
                    throw "CNPJ não definido!";
                if (__classPrivateFieldGet(this, _Tools_config, "f").CNPJ.length !== 14)
                    throw "CNPJ inválido!";
                // Gera o XML da consulta
                // Prepara o SOAP
                var xmlSing = await json2xml({
                    "distDFeInt": {
                        "@xmlns": "http://www.portalfiscal.inf.br/nfe",
                        "@versao": "1.01",
                        "tpAmb": 1, // 1 = produção, 2 = homologação
                        "cUFAutor": UF2cUF[__classPrivateFieldGet(this, _Tools_config, "f").UF], // "AN" - Ambiente Nacional
                        "CNPJ": __classPrivateFieldGet(this, _Tools_config, "f").CNPJ,
                        ...(typeof ultNSU != "undefined" ?
                            { "distNSU": { "ultNSU": `${ultNSU}`.padStart(15, '0') } } :
                            {}),
                        ...(typeof chNFe != "undefined" ?
                            { "consChNFe": { "chNFe": chNFe } } :
                            {})
                    }
                });
                await __classPrivateFieldGet(this, _Tools_instances, "m", _Tools_xmlValido).call(this, xmlSing, `distDFeInt_v1.01`).catch(reject); //Validar corpo
                const tempUF = "urlEventos(`AN`, this.#config.versao)";
                xmlSing = await json2xml({
                    "soap:Envelope": {
                        "@xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
                        "@xmlns:xsd": "http://www.w3.org/2001/XMLSchema",
                        "@xmlns:soap": "http://www.w3.org/2003/05/soap-envelope",
                        "soap:Body": {
                            "nfeDistDFeInteresse": {
                                "@xmlns": "http://www.portalfiscal.inf.br/nfe/wsdl/NFeDistribuicaoDFe",
                                "nfeDadosMsg": {
                                    ...{ "@xmlns": "http://www.portalfiscal.inf.br/nfe/wsdl/NFeDistribuicaoDFe" },
                                    ...await xml2json(xmlSing)
                                }
                            }
                        }
                    }
                });
                // HTTPS Request
                const req = https.request("tempUF[`mod${this.#config.mod}`][(this.#config.tpAmb == 1 ? )].NFeDistribuicaoDFe", {
                    ...{
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/soap+xml; charset=utf-8',
                            'Content-Length': xmlSing.length,
                        },
                        rejectUnauthorized: false
                    },
                    ...await __classPrivateFieldGet(this, _Tools_instances, "m", _Tools_certTools).call(this)
                }, (res) => {
                    let data = '';
                    res.on('data', (chunk) => {
                        data += chunk;
                    });
                    res.on('end', async () => {
                        try {
                            resolve(await __classPrivateFieldGet(this, _Tools_instances, "m", _Tools_limparSoap).call(this, data));
                        }
                        catch (error) {
                            resolve(data);
                        }
                    });
                });
                req.setTimeout(__classPrivateFieldGet(this, _Tools_config, "f").timeout * 1000, () => {
                    reject({
                        name: 'TimeoutError',
                        message: 'The operation was aborted due to timeout'
                    });
                    req.destroy(); // cancela a requisição
                });
                req.on('error', (erro) => {
                    reject(erro);
                });
                req.write(xmlSing);
                req.end();
            }
            catch (erro) {
                reject(erro);
            }
        });
    }
    //Consulta status sefaz
    async sefazStatus() {
        return new Promise(async (resolve, reject) => {
            if (typeof __classPrivateFieldGet(this, _Tools_config, "f").UF == "undefined")
                throw "sefazStatus({...UF}) -> não definido!";
            if (typeof __classPrivateFieldGet(this, _Tools_config, "f").tpAmb == "undefined")
                throw "sefazStatus({...tpAmb}) -> não definido!";
            if (typeof __classPrivateFieldGet(this, _Tools_config, "f").mod == "undefined")
                throw "sefazStatus({...mod}) -> não definido!";
            let tempUF = "urlEventos(this.#config.UF, this.#config.versao)";
            //Separado para validar o corpo da consulta
            let consStatServ = {
                "@versao": "4.00",
                "@xmlns": "http://www.portalfiscal.inf.br/nfe",
                "tpAmb": __classPrivateFieldGet(this, _Tools_config, "f").tpAmb,
                "cUF": "tempUF.cUF",
                "xServ": "STATUS"
            };
            let xmlObj = {
                "soap:Envelope": {
                    "@xmlns:soap": "http://www.w3.org/2003/05/soap-envelope",
                    "@xmlns:nfe": "http://www.portalfiscal.inf.br/nfe/wsdl/NFeStatusServico4",
                    "soap:Body": {
                        "nfe:nfeDadosMsg": {
                            consStatServ
                        }
                    }
                }
            };
            try {
                let tempBuild = new XMLBuilder({
                    ignoreAttributes: false,
                    attributeNamePrefix: "@"
                });
                //Validação
                await __classPrivateFieldGet(this, _Tools_instances, "m", _Tools_xmlValido).call(this, tempBuild.build({ consStatServ }), `consStatServ_v${__classPrivateFieldGet(this, _Tools_config, "f").versao}`).catch(reject);
                let tempUF = "urlEventos(this.#config.UF, this.#config.versao)";
                let xml = tempBuild.build(xmlObj);
                const req = https.request("tempUF[`mod${this.#config.mod}`][(this.#config.tpAmb == 1 ? )].NFeStatusServico", {
                    ...{
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/soap+xml; charset=utf-8',
                            'Content-Length': xml.length,
                        },
                        rejectUnauthorized: false
                    },
                    ...await __classPrivateFieldGet(this, _Tools_instances, "m", _Tools_certTools).call(this)
                }, (res) => {
                    let data = '';
                    res.on('data', (chunk) => {
                        data += chunk;
                    });
                    res.on('end', async () => {
                        try {
                            resolve(await __classPrivateFieldGet(this, _Tools_instances, "m", _Tools_limparSoap).call(this, data));
                        }
                        catch (error) {
                            resolve(data);
                        }
                    });
                });
                req.setTimeout(__classPrivateFieldGet(this, _Tools_config, "f").timeout * 1000, () => {
                    reject({
                        name: 'TimeoutError',
                        message: 'The operation was aborted due to timeout'
                    });
                    req.destroy(); // cancela a requisição
                });
                req.on('error', (erro) => {
                    reject(erro);
                });
                req.write(xml);
                req.end();
            }
            catch (erro) {
                reject(erro);
            }
        });
    }
    async validarXML(xml, el = "DPS") {
        return new Promise((resolve, reject) => {
            __classPrivateFieldGet(this, _Tools_instances, "m", _Tools_xmlValido).call(this, xml, `${el}_v${__classPrivateFieldGet(this, _Tools_config, "f").versao}`).then(resolve).catch(reject);
        });
    }
}
_Tools_cert = new WeakMap(), _Tools_pem = new WeakMap(), _Tools_config = new WeakMap(), _Tools_instances = new WeakSet(), _Tools_getSignature = 
//Responsavel por gerar assinatura
async function _Tools_getSignature(xmlJSON, tag) {
    return new Promise(async (resvol, reject) => {
        let tempPem = await __classPrivateFieldGet(this, _Tools_instances, "m", _Tools_certTools).call(this);
        const sig = new SignedXml({
            privateKey: tempPem.key,
            canonicalizationAlgorithm: 'http://www.w3.org/TR/2001/REC-xml-c14n-20010315',
            signatureAlgorithm: 'http://www.w3.org/2000/09/xmldsig#rsa-sha1',
            publicCert: tempPem.pem,
            getKeyInfoContent: (args) => {
                const cert = tempPem.cert
                    .toString()
                    .replace('-----BEGIN CERTIFICATE-----', '')
                    .replace('-----END CERTIFICATE-----', '')
                    .replace(/\r?\n|\r/g, '');
                return `<X509Data><X509Certificate>${cert}</X509Certificate></X509Data>`;
            }
        });
        sig.addReference({
            xpath: `//*[local-name(.)='${tag}']`,
            transforms: [
                'http://www.w3.org/2000/09/xmldsig#enveloped-signature',
                'http://www.w3.org/TR/2001/REC-xml-c14n-20010315'
            ],
            digestAlgorithm: 'http://www.w3.org/2000/09/xmldsig#sha1'
        });
        sig.computeSignature(xmlJSON, {
            location: {
                reference: `//*[local-name()='${tag}']`,
                action: 'after' // <- insere DENTRO da tag <evento>
            }
        });
        return resvol(sig.getSignatureXml());
    });
}, _Tools_gerarQRCodeNFCe = function _Tools_gerarQRCodeNFCe(NFe, versaoQRCode = "2", idCSC, CSC) {
    let s = '|', concat, hash;
    if (NFe.infNFe.ide.tpEmis == 1) {
        concat = [NFe.infNFe['@Id'].replace("NFe", ""), versaoQRCode, NFe.infNFe.ide.tpAmb, Number(idCSC)].join(s);
    }
    else {
        let hexDigestValue = Buffer.from(NFe.Signature.SignedInfo.Reference.DigestValue).toString('hex');
        concat = [NFe.infNFe['@Id'].replace("NFe", ""), versaoQRCode, NFe.infNFe.ide.tpAmb, NFe.infNFe.ide.dhEmi, NFe.infNFe.total.ICMSTot.vNF, hexDigestValue, Number(idCSC)].join(s);
    }
    hash = crypto.createHash('sha1').update(concat + CSC).digest('hex');
    return NFe.infNFeSupl.qrCode + '?p=' + concat + s + hash;
}, _Tools_descEvento = function _Tools_descEvento(tpEvento) {
    const eventos = {
        "110110": "Carta de Correcao",
        "110111": "Cancelamento",
        "210200": "Confirmacao da Operacao",
        "210210": "Ciencia da Operacao",
        "210220": "Desconhecimento da Operacao",
        "210240": "Operacao nao Realizada"
    };
    return eventos[tpEvento] || "Evento";
}, _Tools_xmlValido = 
//Validar XML da NFe, somente apos assinar
async function _Tools_xmlValido(xml, xsd) {
    return new Promise((resolve, reject) => {
        const xmlFile = tmp.fileSync({ mode: 0o644, prefix: 'xml-', postfix: '.xml' });
        fs.writeFileSync(xmlFile.name, xml, { encoding: 'utf8' });
        const schemaPath = path.resolve(__dirname, `../../schemas/v100/${xsd}.xsd`);
        const verif = spawnSync(__classPrivateFieldGet(this, _Tools_config, "f").xmllint, ['--noout', '--schema', schemaPath, xmlFile.name], { encoding: 'utf8' });
        xmlFile.removeCallback();
        // Aqui, usamos o operador de encadeamento opcional (?.)
        if (verif.error) {
            return reject("Biblioteca xmllint não encontrada!");
        }
        else if (!verif.stderr.includes(".xml validates")) {
            return reject(verif.stderr.replace(/\/tmp\/[^:\s]+\.xml/g, '') // Remove os caminhos /tmp/*.xml
                .replace(/\s{2,}/g, ' ') // Ajusta múltiplos espaços para um só
                .trim()); // Remove espaços no começo e fim)
        }
        else {
            resolve(true);
        }
    });
}, _Tools_certTools = function _Tools_certTools() {
    return new Promise(async (resvol, reject) => {
        if (__classPrivateFieldGet(this, _Tools_pem, "f").key != "")
            resvol(__classPrivateFieldGet(this, _Tools_pem, "f"));
        if (__classPrivateFieldGet(this, _Tools_config, "f").openssl != null) {
            pem.config({
                pathOpenSSL: __classPrivateFieldGet(this, _Tools_config, "f").openssl
            });
        }
        pem.readPkcs12(__classPrivateFieldGet(this, _Tools_cert, "f").pfx, { p12Password: __classPrivateFieldGet(this, _Tools_cert, "f").senha }, (err, myPem) => {
            if (err)
                return reject(err); // <-- importante!
            __classPrivateFieldSet(this, _Tools_pem, myPem, "f");
            resvol(__classPrivateFieldGet(this, _Tools_pem, "f"));
        });
    });
}, _Tools_limparSoap = 
//Remove coisas inuteis da resposta do sefaz
async function _Tools_limparSoap(xml) {
    if (xml == "Bad Request")
        throw xml;
    const clear = [
        'S:Envelope',
        'S:Body',
        'soapenv:Envelope',
        'soapenv:Body',
        'soap:Envelope',
        'soap:Body',
        'nfeResultMsg',
        'nfeDistDFeInteresseResponse'
    ];
    let jXml = await xml2json(xml);
    let index = 0;
    while (index < clear.length) {
        if (typeof jXml[clear[index]] !== "undefined") {
            jXml = jXml[clear[index]];
            index = 0; // reinicia a busca no novo nível
        }
        else {
            index++;
        }
    }
    return await json2xml(jXml);
};
export { Tools };
