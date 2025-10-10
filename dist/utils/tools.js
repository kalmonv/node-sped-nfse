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
var _Tools_instances, _Tools_cert, _Tools_pem, _Tools_config, _Tools_getSignature, _Tools_gerarQRCodeNFCe, _Tools_xmlValido, _Tools_certTools, _Tools_limparSoap;
import https from "https";
import { spawnSync } from "child_process";
import tmp from "tmp";
import crypto from "crypto";
import { urlEventos } from "./eventos.js";
import fs from "fs";
import path from 'path';
import { fileURLToPath } from 'url';
import pem from 'pem';
import { json2xml, xml2json, formatData } from "./extras.js";
import { SignedXml } from 'xml-crypto';
import zlib from 'zlib';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
class Tools {
    constructor(config = { cOrgao: '', tpAmb: 2, CPF: "", CNPJ: "", IM: "", versao: "4.00", timeout: 30, xmllint: 'xmllint', openssl: null, }, certificado = { pfx: "", senha: "" }) {
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
    gzipB64(xml) {
        const gz = zlib.gzipSync(Buffer.from(xml, 'utf-8'));
        return gz.toString('base64');
    }
    async checkConvenio(codMunicipal) {
        return new Promise(async (resolve, reject) => {
            //this.#config?.tpAmb 1
            const req = https.request(urlEventos?.gov?.[__classPrivateFieldGet(this, _Tools_config, "f")?.tpAmb == 1 ? 'producao' : 'homologacao']?.ParamConvenio.replace("{codMunicipal}", codMunicipal), {
                method: 'GET',
                headers: {
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
    async DFeEventos(chAcesso) {
        return new Promise(async (resolve, reject) => {
            const req = https.request(urlEventos?.gov?.[__classPrivateFieldGet(this, _Tools_config, "f")?.tpAmb == 1 ? 'producao' : 'homologacao']?.DFeEventos.replace("{chAcesso}", chAcesso), {
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
            req.setTimeout(__classPrivateFieldGet(this, _Tools_config, "f").timeout * 1000, () => {
                reject({
                    name: 'TimeoutError',
                    message: 'The operation was aborted due to timeout'
                });
                req.destroy(); // cancela a requisição
            });
            req.on('timeout', () => req.destroy(new Error('Timeout')));
            req.on('error', reject);
            req.end();
        });
    }
    async DFe(NSU) {
        return new Promise(async (resolve, reject) => {
            const req = https.request(urlEventos?.gov?.[__classPrivateFieldGet(this, _Tools_config, "f")?.tpAmb == 1 ? 'producao' : 'homologacao']?.DFe.replace("{NSU}", NSU), {
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
            req.setTimeout(__classPrivateFieldGet(this, _Tools_config, "f").timeout * 1000, () => {
                reject({
                    name: 'TimeoutError',
                    message: 'The operation was aborted due to timeout'
                });
                req.destroy(); // cancela a requisição
            });
            req.on('timeout', () => req.destroy(new Error('Timeout')));
            req.on('error', reject);
            req.end();
        });
    }
    async DPS(id) {
        return new Promise(async (resolve, reject) => {
            const req = https.request(urlEventos?.gov?.[__classPrivateFieldGet(this, _Tools_config, "f")?.tpAmb == 1 ? 'producao' : 'homologacao']?.DPSConsulta.replace("{id}", id), {
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
            req.setTimeout(__classPrivateFieldGet(this, _Tools_config, "f").timeout * 1000, () => {
                reject({
                    name: 'TimeoutError',
                    message: 'The operation was aborted due to timeout'
                });
                req.destroy(); // cancela a requisição
            });
            req.on('timeout', () => req.destroy(new Error('Timeout')));
            req.on('error', reject);
            req.end();
        });
    }
    async DPSVerifica(id) {
        return new Promise(async (resolve, reject) => {
            const req = https.request(urlEventos?.gov?.[__classPrivateFieldGet(this, _Tools_config, "f")?.tpAmb == 1 ? 'producao' : 'homologacao']?.DPSConsulta.replace("{id}", id), {
                method: 'HEAD',
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
            req.setTimeout(__classPrivateFieldGet(this, _Tools_config, "f").timeout * 1000, () => {
                reject({
                    name: 'TimeoutError',
                    message: 'The operation was aborted due to timeout'
                });
                req.destroy(); // cancela a requisição
            });
            req.on('timeout', () => req.destroy(new Error('Timeout')));
            req.on('error', reject);
            req.end();
        });
    }
    async DANFSe(chAcesso) {
        return new Promise(async (resolve, reject) => {
            const url = urlEventos?.gov?.[__classPrivateFieldGet(this, _Tools_config, "f")?.tpAmb == 1 ? 'producao' : 'homologacao']?.DANFSe.replace("{chAcesso}", chAcesso);
            const req = https.request(url, {
                method: 'GET',
                headers: {
                    // Não envie Content-Type em GET; peça PDF explicitamente
                    'Accept': 'application/pdf'
                },
                // ideal: true em produção; aqui você havia desativado
                rejectUnauthorized: false,
                ...(await __classPrivateFieldGet(this, _Tools_instances, "m", _Tools_certTools).call(this)) // mTLS
            }, (res) => {
                const chunks = [];
                res.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
                res.on('end', () => {
                    const buf = Buffer.concat(chunks);
                    console.log(`[statusCode: ${res.statusCode}]`);
                    const ctype = (res.headers['content-type'] || '').toLowerCase();
                    // Se veio PDF, devolve o Buffer do PDF
                    if (res.statusCode === 200 && ctype.includes('application/pdf') && buf.length > 0) {
                        return resolve(buf); // quem chamar decide salvar em arquivo
                    }
                    // Tenta interpretar como JSON (ex.: erro de negócio)
                    try {
                        const json = JSON.parse(buf.toString('utf8'));
                        return resolve(json);
                    }
                    catch {
                        // Devolve texto bruto (ex.: HTML de erro/IIS 501 sem corpo)
                        return resolve(buf.toString('utf8'));
                    }
                });
            });
            req.setTimeout(__classPrivateFieldGet(this, _Tools_config, "f").timeout * 1000, () => {
                reject({ name: 'TimeoutError', message: 'The operation was aborted due to timeout' });
                req.destroy();
            });
            req.on('timeout', () => req.destroy(new Error('Timeout')));
            req.on('error', reject);
            req.end();
        });
    }
    async enviarEvento({ chNFSe = "", tpEvento = "", xJust = "", nSeqEvento = 1, dhEvento = formatData() }) {
        return new Promise(async (resolve, reject) => {
            if (typeof __classPrivateFieldGet(this, _Tools_config, "f").cOrgao == "undefined")
                reject("Tools({...,cOrgao:?}): cOrgao não definido!");
            if (typeof __classPrivateFieldGet(this, _Tools_config, "f").CNPJ == "undefined" && typeof __classPrivateFieldGet(this, _Tools_config, "f").CPF == "undefined")
                reject("Tools({...,CPF|CNPJ:?}): CPF|CNPJ não definido!");
            var evento = {
                eventoNfse: {
                    infEvento: {
                        tpAmb: __classPrivateFieldGet(this, _Tools_config, "f").tpAmb,
                        cOrgao: __classPrivateFieldGet(this, _Tools_config, "f").cOrgao,
                        emit: {
                            ...(__classPrivateFieldGet(this, _Tools_config, "f").CNPJ != undefined ? {
                                CNPJ: __classPrivateFieldGet(this, _Tools_config, "f").CNPJ,
                            } : {
                                CPF: __classPrivateFieldGet(this, _Tools_config, "f").CPF,
                            }),
                            ...(__classPrivateFieldGet(this, _Tools_config, "f").IM != undefined ? {
                                CNPJ: __classPrivateFieldGet(this, _Tools_config, "f").IM,
                            } : {})
                        },
                        nfse: {
                            chNFSe
                        },
                        dhEvento,
                        tpEvento,
                        nSeqEvento,
                        verEvento: "1.00",
                        detEvento: {
                            descEvento: (tpEvento == "e101101" ? "Cancelamento da NFS-e" : "Cancelamento por Substituição"),
                            xJust: xJust,
                            "@versao": "1.00"
                        },
                        "@Id": `ID${tpEvento}${chNFSe}${nSeqEvento}`
                    },
                    "@xmlns": "urn:br:gov:snnfse:evento",
                    "@versao": "1.00"
                }
            };
            var xml = `<?xml version="1.0" encoding="UTF-8"?>` + await json2xml(evento);
            xml = await this.xmlSign(xml, { tag: "infEvento" });
            const payload = JSON.stringify({
                pedidoRegistroEventoXmlGZipB64: this.gzipB64(xml)
            });
            const req = https.request(urlEventos?.gov?.[__classPrivateFieldGet(this, _Tools_config, "f")?.tpAmb == 1 ? 'producao' : 'homologacao']?.NFSeEventos.replace("{chAcesso}", chNFSe), {
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
    async DPSConsulta(id) {
        return new Promise(async (resolve, reject) => {
            const url = urlEventos?.gov?.[__classPrivateFieldGet(this, _Tools_config, "f")?.tpAmb == 1 ? 'producao' : 'homologacao']?.DPSConsulta.replace("{id}", id);
            const req = https.request(url, {
                method: 'GET',
                headers: {
                    // Não envie Content-Type em GET; peça PDF explicitamente
                    'Accept': 'application/json'
                },
                // ideal: true em produção; aqui você havia desativado
                rejectUnauthorized: false,
                ...(await __classPrivateFieldGet(this, _Tools_instances, "m", _Tools_certTools).call(this)) // mTLS
            }, (res) => {
                const chunks = [];
                res.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
                res.on('end', () => {
                    const buf = Buffer.concat(chunks);
                    console.log(`[statusCode: ${res.statusCode}]`);
                    // Tenta JSON (respostas de sucesso/erro vêm em JSON)
                    try {
                        const json = JSON.parse(buf.toString('utf8'));
                        return resolve(json);
                    }
                    catch {
                        // Se não for JSON, devolve texto (HTML/diagnóstico)
                        return resolve(buf.toString('utf8'));
                    }
                });
            });
            req.setTimeout(__classPrivateFieldGet(this, _Tools_config, "f").timeout * 1000, () => {
                reject({ name: 'TimeoutError', message: 'The operation was aborted due to timeout' });
                req.destroy();
            });
            req.on('timeout', () => req.destroy(new Error('Timeout')));
            req.on('error', reject);
            req.end();
        });
    }
    async enviarDPS(xml) {
        const isLote = Array.isArray(xml);
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
            var xml = await xml2json(xmlJSON);
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
    //Obter certificado 
    async getCertificado() {
        return new Promise(async (resvol, reject) => {
            __classPrivateFieldGet(this, _Tools_instances, "m", _Tools_certTools).call(this).then(resvol).catch(reject);
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
