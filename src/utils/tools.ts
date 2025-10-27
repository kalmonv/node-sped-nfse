import https from "https";
import { spawnSync, SpawnSyncReturns } from "child_process"
import tmp from "tmp"
import { urlEventos } from "./eventos.js"
import fs from "fs"
import path from 'path';
import { fileURLToPath } from 'url';
import pem from 'pem';
import { cUF2UF, json2xml, xml2json, formatData, UF2cUF } from "./extras.js"
import { SignedXml } from 'xml-crypto';

import zlib from 'zlib'





const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



type typeConsulta = {
    NSU?: string;       // prefira undefined a null
    DPS?: string;
    chAcesso?: string;
    verifDPS?: string;
};

class Tools {
    #cert: {
        pfx: string;
        senha: string;
    };
    #pem: {
        key: string;
        cert: string;
        ca: string[]; // <- define que pode ser uma lista de strings
    } = {
            key: "",            // A chave privada extraída do PKCS#12, em formato PEM
            cert: "",           // O certificado extraído, em formato PEM
            ca: []     // Uma lista de certificados da cadeia (se houver), ou null
        };
    #config: {
        cOrgao: string;
        tpAmb: number;
        CPF: any;
        CNPJ: any;
        IM: string

        //Sistema
        versao: string;
        timeout: number;
        xmllint: string;
        openssl: any;
    };

    constructor(config = { cOrgao: '', tpAmb: 2, CPF: "", CNPJ: "", IM: "", versao: "4.00", timeout: 30, xmllint: 'xmllint', openssl: null, }, certificado = { pfx: "", senha: "" }) {
        if (typeof config != "object") throw "Tools({config},{}): Config deve ser um objecto!";
        if (typeof config.tpAmb == "undefined") throw "Tools({...,tpAmb:?},{}): tpAmb não definida!";
        if (typeof config.versao == "undefined") throw "Tools({...,versao:?},{}): versao não definida!";

        //Default do sistema
        if (typeof config.timeout == "undefined") config.timeout = 30;
        if (typeof config.xmllint == "undefined") config.xmllint = 'xmllint';
        if (typeof config.openssl == "undefined") config.openssl = null;

        //Configurar certificado
        this.#config = config;
        this.#cert = certificado;
    }

    #gzipB64(xml: string) {
        const gz = zlib.gzipSync(Buffer.from(xml, 'utf-8'))
        return gz.toString('base64')
    }

    async enviarDPS(this: any, xml: string | string[]): Promise<any> {
        const isLote = Array.isArray(xml)

        // >>> IMPORTANTÍSSIMO: deixe NFSeEnvio apontar pro SEFIN (não pro ADN)
        // Ex.: this.urlEventos.gov.homologacao.NFSeEnvio = 'https://sefin.nfse.gov.br/sefinnacional/nfse'
        const url = isLote
            ? (urlEventos?.gov?.[this.#config?.tpAmb == 1 ? 'producao' : 'homologacao']?.LoteEnvio)
            : (urlEventos?.gov?.[this.#config?.tpAmb == 1 ? 'producao' : 'homologacao']?.NFSeEnvio)

        const body = isLote
            ? { LoteXmlGZipB64: (xml as string[]).map(this.#gzipB64) }
            : { dpsXmlGZipB64: this.#gzipB64(xml as string) }

        const payload = JSON.stringify(body)
        return new Promise(async (resolve, reject) => {
            const req = https.request(
                url,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json; charset=utf-8',
                        'Accept': 'application/json',
                        'Content-Length': Buffer.byteLength(payload).toString()
                    },
                    // ideal: true em produção; você havia desativado a verificação
                    rejectUnauthorized: false,
                    ...(await this.#certTools()) // mTLS: cert/ key ou pfx/passphrase
                },
                (res) => {
                    let data = ''
                    res.on('data', (chunk) => (data += chunk))
                    res.on('end', () => {
                        // tente parsear JSON; se falhar, devolve string
                        try { resolve(JSON.parse(data)) } catch { resolve(data) }
                    })
                }
            )
            req.setTimeout(this.#config.timeout * 1000, () => {
                reject({
                    name: 'TimeoutError',
                    message: 'The operation was aborted due to timeout'
                });
                req.destroy(); // cancela a requisição
            });
            req.on('timeout', () => req.destroy(new Error('Timeout')))
            req.on('error', reject)
            req.write(payload)
            req.end()
        })
    }

    async DANFSe(chAcesso: string): Promise<any> {
        return new Promise(async (resolve, reject) => {
            const url = urlEventos?.gov?.[this.#config?.tpAmb == 1 ? 'producao' : 'homologacao']?.DANFSe.replace("{chAcesso}", chAcesso);
            const req = https.request(
                url,
                {
                    method: 'GET',
                    headers: {
                        // Não envie Content-Type em GET; peça PDF explicitamente
                        'Accept': 'application/pdf'
                    },
                    // ideal: true em produção; aqui você havia desativado
                    rejectUnauthorized: false,
                    ...(await this.#certTools()) // mTLS
                },
                (res) => {
                    const chunks: Buffer[] = [];
                    res.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
                    res.on('end', () => {
                        const buf = Buffer.concat(chunks);
                        const ctype = (res.headers['content-type'] || '').toLowerCase();
                        // Se veio PDF, devolve o Buffer do PDF
                        if (res.statusCode === 200 && ctype.includes('application/pdf') && buf.length > 0) {
                            return resolve(buf); // quem chamar decide salvar em arquivo
                        }

                        // Tenta interpretar como JSON (ex.: erro de negócio)
                        try {
                            const json = JSON.parse(buf.toString('utf8'));
                            return resolve(json);
                        } catch {
                            // Devolve texto bruto (ex.: HTML de erro/IIS 501 sem corpo)
                            return resolve(buf.toString('utf8'));
                        }
                    });
                }
            );

            req.setTimeout(this.#config.timeout * 1000, () => {
                reject({ name: 'TimeoutError', message: 'The operation was aborted due to timeout' });
                req.destroy();
            });
            req.on('timeout', () => req.destroy(new Error('Timeout')));
            req.on('error', reject);
            req.end();
        });
    }




    async consulta({ NSU = "", DPS = "", chAcesso = "", verifDPS = "" }: typeConsulta = {}): Promise<any> {
        return new Promise(async (resolve, reject) => {
            let url = "",
                method = "GET";
            if (NSU != "") {
                url = urlEventos?.gov?.[this.#config?.tpAmb == 1 ? 'producao' : 'homologacao']?.LoteConsulta.replace("{NSU}", NSU)
            } else if (DPS != "") {
                url = urlEventos?.gov?.[this.#config?.tpAmb == 1 ? 'producao' : 'homologacao']?.DPSConsulta.replace("{DPS}", DPS)
            } else if (chAcesso != "") {
                url = urlEventos?.gov?.[this.#config?.tpAmb == 1 ? 'producao' : 'homologacao']?.NFSeConsulta.replace("{chAcesso}", chAcesso)
            } else if (verifDPS != "") {
                url = urlEventos?.gov?.[this.#config?.tpAmb == 1 ? 'producao' : 'homologacao']?.DPSCheck.replace("{DPS}", verifDPS)
                method = "HEAD";
            }

            const req = https.request(
                url,
                {
                    method,
                    headers: {
                        'Content-Type': 'application/json; charset=utf-8',
                        'Accept': 'application/json',
                    },
                    // ideal: true em produção; você havia desativado a verificação
                    rejectUnauthorized: false,
                    ...(await this.#certTools()) // mTLS: cert/ key ou pfx/passphrase
                },
                (res) => {
                    let data = ''
                    res.on('data', (chunk) => (data += chunk))
                    res.on('end', () => {
                        console.log(url)
                        console.log(res.statusCode)
                        // tente parsear JSON; se falhar, devolve string
                        try { resolve(JSON.parse(data)) } catch { resolve(data) }
                    })
                }
            )
            req.setTimeout(this.#config.timeout * 1000, () => {
                reject({
                    name: 'TimeoutError',
                    message: 'The operation was aborted due to timeout'
                });
                req.destroy(); // cancela a requisição
            });
            req.on('timeout', () => req.destroy(new Error('Timeout')))
            req.on('error', reject)
            req.end()
        })
    }

    async enviarEvento({ chNFSe = "", tpEvento = "", dhEvento = formatData(), id = "", xDesc = "", cMotivo = "", xMotivo = "", chSubstituta = "", CPFAgTrib = "", nProcAdm = "", idEvManifRej = "", xProcAdm = "", cEvtNFSe = "", idBloqOfic = "", nPedRegEvento =  "1"}): Promise<any> {
        return new Promise(async (resolve, reject) => {
            if (typeof this.#config.cOrgao == "undefined") reject("Tools({...,cOrgao:?}): cOrgao não definido!");
            if (typeof this.#config.CNPJ == "undefined" && typeof this.#config.CPF == "undefined") reject("Tools({...,CPF|CNPJ:?}): CPF|CNPJ não definido!");

            nPedRegEvento = ("000" + nPedRegEvento).slice(-3);
            if (id == "") id = `PRE${chNFSe}${tpEvento}${nPedRegEvento}`

            const funcEvent = (): Record<string, unknown> => {
                // mapa interno: tpEvento -> xDesc oficial
                const XDESC_BY_EVENT: Record<string, string> = {
                    101101: 'Cancelamento de NFS-e',
                    101103: 'Solicitação de Análise Fiscal para Cancelamento de NFS-e',
                    105102: 'Cancelamento de NFS-e por Substituição',
                    105104: 'Cancelamento de NFS-e Deferido por Análise Fiscal',
                    105105: 'Cancelamento de NFS-e Indeferido por Análise Fiscal',

                    202201: 'Manifestação de NFS-e - Confirmação do Prestador',
                    202205: 'Manifestação de NFS-e - Rejeição do Prestador',
                    203202: 'Manifestação de NFS-e - Confirmação do Tomador',
                    203206: 'Manifestação de NFS-e - Rejeição do Tomador',
                    204203: 'Manifestação de NFS-e - Confirmação do Intermediário',
                    204207: 'Manifestação de NFS-e - Rejeição do Intermediário',
                    205204: 'Manifestação de NFS-e - Confirmação Tácita',
                    205208: 'Manifestação de NFS-e - Anulação da Rejeição',

                    305101: 'Cancelamento de NFS-e por Ofício',
                    305102: 'Bloqueio de NFS-e por Ofício',
                    305103: 'Desbloqueio de NFS-e por Ofício',
                };

                // usa o xDesc do mapa; se não houver, cai no xDesc já existente no escopo
                const _xDesc = XDESC_BY_EVENT[tpEvento] ?? xDesc;
                if (!_xDesc) return {};

                switch (tpEvento) {
                    case '101101':
                    case '101103':
                    case '202205':
                    case '203206':
                    case '204207':
                        return { [`e${tpEvento}`]: { xDesc: _xDesc, cMotivo, xMotivo } };

                    case '105102':
                        return { [`e${tpEvento}`]: { xDesc: _xDesc, cMotivo, xMotivo, chSubstituta } };

                    case '105104':
                    case '105105':
                        return { [`e${tpEvento}`]: { xDesc: _xDesc, CPFAgTrib, nProcAdm, cMotivo, xMotivo } };

                    case '202201':
                    case '203202':
                    case '204203':
                        return { [`e${tpEvento}`]: { xDesc: _xDesc } };

                    case '205204':
                        return { [`e${tpEvento}`]: { xDesc: _xDesc, CPFAgTrib } };

                    case '205208':
                        return { [`e${tpEvento}`]: { xDesc: _xDesc, CPFAgTrib, idEvManifRej, xMotivo } };

                    case '305101':
                        return { [`e${tpEvento}`]: { xDesc: _xDesc, CPFAgTrib, nProcAdm, xProcAdm } };

                    case '305102':
                        return { [`e${tpEvento}`]: { xDesc: _xDesc, CPFAgTrib, xMotivo, cEvtNFSe } };

                    case '305103':
                        return { [`e${tpEvento}`]: { xDesc: _xDesc, CPFAgTrib, idBloqOfic } };

                    default:
                        return {};
                }
            };


            var evento = {
                pedRegEvento: {
                    infPedReg: {
                        "@Id": id,
                        tpAmb: this.#config.tpAmb,
                        verAplic: "SefinNacional_1.4.0",
                        dhEvento,
                        ...(typeof this.#config.CNPJ == "undefined" ? { CPFAutor: this.#config.CPF } : { CNPJAutor: this.#config.CNPJ }),
                        chNFSe,
                        nPedRegEvento,
                        ...(funcEvent())
                    },
                    "@xmlns": "http://www.sped.fazenda.gov.br/nfse",
                    "@versao": "1.00"
                }
            }



            var xml = `<?xml version="1.0" encoding="UTF-8"?>` + await json2xml(evento);
            xml = await this.xmlSign(xml, "infPedReg");
            fs.writeFileSync("./testes/evento.xml", xml, { encoding: "utf8" })

            await this.#xmlValido(xml, `pedRegEvento_v${this.#config.versao}`).catch(reject);

            const payload = JSON.stringify({
                pedidoRegistroEventoXmlGZipB64: this.#gzipB64(xml)
            })

            const req = https.request(
                urlEventos?.gov?.[this.#config?.tpAmb == 1 ? 'producao' : 'homologacao']?.NFSeEvent.replace("{chAcesso}", chNFSe),
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json; charset=utf-8',
                        'Accept': 'application/json',
                        'Content-Length': Buffer.byteLength(payload).toString()
                    },
                    // ideal: true em produção; você havia desativado a verificação
                    rejectUnauthorized: false,
                    ...(await this.#certTools()) // mTLS: cert/ key ou pfx/passphrase
                },
                (res) => {
                    let data = ''
                    res.on('data', (chunk) => (data += chunk))
                    res.on('end', () => {
                        // tente parsear JSON; se falhar, devolve string
                        try { resolve(JSON.parse(data)) } catch { resolve(data) }
                    })
                }
            )
            req.setTimeout(this.#config.timeout * 1000, () => {
                reject({
                    name: 'TimeoutError',
                    message: 'The operation was aborted due to timeout'
                });
                req.destroy(); // cancela a requisição
            });
            req.on('timeout', () => req.destroy(new Error('Timeout')))
            req.on('error', reject)
            req.write(payload)
            req.end()
        })
    }

    async consultaConvenio(): Promise<any> {
        return new Promise(async (resolve, reject) => {
            const url = urlEventos?.gov?.[this.#config?.tpAmb == 1 ? 'producao' : 'homologacao']?.MunConvenio.replace("{cOrgao}", this.#config.cOrgao);
            console.log(url)
            const req = https.request(
                url,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json; charset=utf-8',
                        'Accept': 'application/json',
                    },
                    // ideal: true em produção; aqui você havia desativado
                    rejectUnauthorized: false,
                    ...(await this.#certTools()) // mTLS
                },
                (res) => {
                    const chunks: Buffer[] = [];
                    res.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
                    res.on('end', () => {
                        const buf = Buffer.concat(chunks);
                        const ctype = (res.headers['content-type'] || '').toLowerCase();
                        // Se veio PDF, devolve o Buffer do PDF
                        if (res.statusCode === 200 && ctype.includes('application/pdf') && buf.length > 0) {
                            return resolve(buf); // quem chamar decide salvar em arquivo
                        }

                        // Tenta interpretar como JSON (ex.: erro de negócio)
                        try {
                            const json = JSON.parse(buf.toString('utf8'));
                            return resolve(json);
                        } catch {
                            // Devolve texto bruto (ex.: HTML de erro/IIS 501 sem corpo)
                            return resolve(buf.toString('utf8'));
                        }
                    });
                }
            );

            req.setTimeout(this.#config.timeout * 1000, () => {
                reject({ name: 'TimeoutError', message: 'The operation was aborted due to timeout' });
                req.destroy();
            });
            req.on('timeout', () => req.destroy(new Error('Timeout')));
            req.on('error', reject);
            req.end();
        });
    }

    //Responsavel por gerar assinatura
    async xmlSign(xmlJSON: string, tag: string = "infDPS"): Promise<string> {
        return new Promise(async (resvol, reject) => {
            try {
                let tempPem = await this.#certTools() as any;
                const sig = new SignedXml({
                    privateKey: tempPem.key,
                    canonicalizationAlgorithm: 'http://www.w3.org/TR/2001/REC-xml-c14n-20010315',
                    signatureAlgorithm: 'http://www.w3.org/2000/09/xmldsig#rsa-sha1',
                    publicCert: tempPem.pem,
                    getKeyInfoContent: (args?: { key: string, prefix: string }) => {
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

                return resvol(sig.getSignedXml())
            } catch (error) {
                reject(error)
            }
        })
    }

    //Obter certificado 
    async getCertificado(): Promise<object> {
        return new Promise(async (resvol, reject) => {
            this.#certTools().then(resvol).catch(reject)
        })
    }

    async validarXML(xml: string, schema: string = "DPS"): Promise<any> {
        return new Promise((resolve, reject) => {
            this.#xmlValido(xml, `${schema}_v${this.#config.versao}`).then(resolve).catch(reject);
        })
    }


    //Validar XML da NFe, somente apos assinar
    async #xmlValido(xml: string, xsd: string) {
        return new Promise((resolve, reject) => {
            const xmlFile = tmp.fileSync({ mode: 0o644, prefix: 'xml-', postfix: '.xml' });

            fs.writeFileSync(xmlFile.name, xml, { encoding: 'utf8' });
            const schemaPath = path.resolve(__dirname, `../../schemas/v100/${xsd}.xsd`);

            const verif: SpawnSyncReturns<string> = spawnSync(
                this.#config.xmllint,
                ['--noout', '--schema', schemaPath, xmlFile.name],
                { encoding: 'utf8' }
            );

            xmlFile.removeCallback();

            // Aqui, usamos o operador de encadeamento opcional (?.)
            if (verif.error) {
                return reject("Biblioteca xmllint não encontrada!")
            } else if (!verif.stderr.includes(".xml validates")) {
                return reject(verif.stderr.replace(/\/tmp\/[^:\s]+\.xml/g, '') // Remove os caminhos /tmp/*.xml
                    .replace(/\s{2,}/g, ' ')             // Ajusta múltiplos espaços para um só
                    .trim())                           // Remove espaços no começo e fim)
            } else {
                resolve(true);
            }

        })
    }

    #certTools(): Promise<object> {
        return new Promise(async (resvol, reject) => {
            if (this.#pem.key != "") resvol(this.#pem);
            if (this.#config.openssl != null) {
                pem.config({
                    pathOpenSSL: this.#config.openssl
                })
            }
            pem.readPkcs12(this.#cert.pfx, { p12Password: this.#cert.senha }, (err, myPem) => {
                if (err) return reject(err); // <-- importante!
                this.#pem = myPem;
                resvol(this.#pem);
            });
        })
    }

    //Remove coisas inuteis da resposta do sefaz
    async #limparSoap(xml: string) {
        if (xml == "Bad Request") throw xml
        const clear: any = [
            'S:Envelope',
            'S:Body',
            'soapenv:Envelope',
            'soapenv:Body',
            'soap:Envelope',
            'soap:Body',
            'nfeResultMsg',
            'nfeDistDFeInteresseResponse'
        ]
        let jXml = await xml2json(xml) as any;
        let index = 0;
        while (index < clear.length) {
            if (typeof jXml[clear[index]] !== "undefined") {
                jXml = jXml[clear[index]];
                index = 0; // reinicia a busca no novo nível
            } else {
                index++;
            }
        }
        return await json2xml(jXml);
    }
}
export { Tools }