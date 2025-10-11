import { XMLParser, XMLBuilder } from "fast-xml-parser";
import https from "https";
import { spawnSync, SpawnSyncReturns } from "child_process"
import tmp from "tmp"
import crypto from "crypto";
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

    gzipB64(xml: string) {
        const gz = zlib.gzipSync(Buffer.from(xml, 'utf-8'))
        return gz.toString('base64')
    }

    // -----------------------------------   Parâmetros Municipais -----------------------------------------
    async alteraRetMunicipal(idManut: string): Promise<any> { //!FALTA - ERRO 500
        return new Promise(async (resolve, reject) => {
            if (this.#config.cOrgao == undefined) return reject("Tools({..., cOrgao }) Delcaração faltando.");
            return reject("Tools.alteraRetMunicipal() - Não implementado!");

            const req = https.request(
                urlEventos?.gov?.[this.#config?.tpAmb == 1 ? 'producao' : 'homologacao']?.ParamRegimesEspeciaisAltera.replace("{codigoMunicipio}", this.#config.cOrgao).replace("{idManut}", idManut),
                {
                    method: 'POST',
                    headers: {
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
    async consultaRetMunicipal(competencia: string): Promise<any> {
        return new Promise(async (resolve, reject) => {
            if (this.#config.cOrgao == undefined) return reject("Tools({..., cOrgao }) Delcaração faltando.");
            console.log(urlEventos?.gov?.[this.#config?.tpAmb == 1 ? 'producao' : 'homologacao']?.ParamRetencoes.replace("{codigoMunicipio}", this.#config.cOrgao).replace("{competencia}", competencia))

            const req = https.request(
                urlEventos?.gov?.[this.#config?.tpAmb == 1 ? 'producao' : 'homologacao']?.ParamRetencoes.replace("{codigoMunicipio}", this.#config.cOrgao).replace("{competencia}", competencia),
                {
                    method: 'GET',
                    headers: {
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


    async alteraRegEspecial(idManut: string): Promise<any> { //!FALTA - ERRO 500
        return new Promise(async (resolve, reject) => {
            if (this.#config.cOrgao == undefined) return reject("Tools({..., cOrgao }) Delcaração faltando.");
            return reject("Tools.alteraRegEspecial() - Não implementado!");

            const req = https.request(
                urlEventos?.gov?.[this.#config?.tpAmb == 1 ? 'producao' : 'homologacao']?.ParamRegimesEspeciaisAltera.replace("{codigoMunicipio}", this.#config.cOrgao).replace("{idManut}", idManut),
                {
                    method: 'POST',
                    headers: {
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
    async consultaRegEspecial(codigoServico: string, competencia: string): Promise<any> { //!FALTA - ERRO 500
        return new Promise(async (resolve, reject) => {
            if (this.#config.cOrgao == undefined) return reject("Tools({..., cOrgao }) Delcaração faltando.");
            console.log(urlEventos?.gov?.[this.#config?.tpAmb == 1 ? 'producao' : 'homologacao']?.ParamRegimesEspeciais.replace("{codigoMunicipio}", this.#config.cOrgao).replace("{codigoServico}", String(codigoServico).replace(/\D/g, '').padStart(9, '0').replace(/^(\d{2})(\d{2})(\d{2})(\d{3})$/, '$1.$2.$3.$4')).replace("{competencia}", competencia))

            const req = https.request(
                urlEventos?.gov?.[this.#config?.tpAmb == 1 ? 'producao' : 'homologacao']?.ParamRegimesEspeciais.replace("{codigoMunicipio}", this.#config.cOrgao).replace("{codigoServico}", String(codigoServico).replace(/\D/g, '').padStart(9, '0').replace(/^(\d{2})(\d{2})(\d{2})(\d{3})$/, '$1.$2.$3.$4')).replace("{competencia}", competencia),
                {
                    method: 'GET',
                    headers: {
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

    async alteraBenefMunic(numeroBeneficio: string, competencia: string): Promise<any> {
        return new Promise(async (resolve, reject) => {
            if (this.#config.cOrgao == undefined) return reject("Tools({..., cOrgao }) Delcaração faltando.");
            return reject("Tools.alteraBenefMunic() - Não implementado!");

            const req = https.request(
                urlEventos?.gov?.[this.#config?.tpAmb == 1 ? 'producao' : 'homologacao']?.ParamBefeniciarioMunicipal.replace("{codigoMunicipio}", this.#config.cOrgao).replace("{numeroBeneficio}", numeroBeneficio).replace("{competencia}", competencia),
                {
                    method: 'GET',
                    headers: {
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

    async consultaBenefMunic(numeroBeneficio: string, competencia: string): Promise<any> {
        return new Promise(async (resolve, reject) => {
            if (this.#config.cOrgao == undefined) return reject("Tools({..., cOrgao }) Delcaração faltando.");
            const req = https.request(
                urlEventos?.gov?.[this.#config?.tpAmb == 1 ? 'producao' : 'homologacao']?.ParamBefeniciarioMunicipal.replace("{codigoMunicipio}", this.#config.cOrgao).replace("{numeroBeneficio}", numeroBeneficio).replace("{competencia}", competencia),
                {
                    method: 'GET',
                    headers: {
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

    async consultaAlicotaHist(codigoServico: string): Promise<any> {
        return new Promise(async (resolve, reject) => {
            if (this.#config.cOrgao == undefined) return reject("Tools({..., cOrgao }) Delcaração faltando.");
            const req = https.request(
                urlEventos?.gov?.[this.#config?.tpAmb == 1 ? 'producao' : 'homologacao']?.ParamHistoricoAliquotas.replace("{codigoMunicipio}", this.#config.cOrgao).replace("{codigoServico}", String(codigoServico).replace(/\D/g, '').padStart(9, '0').replace(/^(\d{2})(\d{2})(\d{2})(\d{3})$/, '$1.$2.$3.$4')),
                {
                    method: 'GET',
                    headers: {
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

    async consultaAlicota(codigoServico: string, competencia: string): Promise<any> {
        return new Promise(async (resolve, reject) => {
            if (this.#config.cOrgao == undefined) return reject("Tools({..., cOrgao }) Delcaração faltando.");
            const req = https.request(
                urlEventos?.gov?.[this.#config?.tpAmb == 1 ? 'producao' : 'homologacao']?.ParamAliquota.replace("{codigoMunicipio}", this.#config.cOrgao).replace("{codigoServico}", String(codigoServico).replace(/\D/g, '').padStart(9, '0').replace(/^(\d{2})(\d{2})(\d{2})(\d{3})$/, '$1.$2.$3.$4')).replace("{competencia}", competencia),
                {
                    method: 'GET',
                    headers: {
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

    async consultaConvenio(): Promise<any> {
        return new Promise(async (resolve, reject) => {
            if (this.#config.cOrgao == undefined) return reject("Tools({..., cOrgao }) Delcaração faltando.")
            const req = https.request(
                urlEventos?.gov?.[this.#config?.tpAmb == 1 ? 'producao' : 'homologacao']?.ParamConvenio.replace("{codigoMunicipio}", this.#config.cOrgao),
                {
                    method: 'GET',
                    headers: {
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
    // -----------------------------------   Parâmetros Municipais -----------------------------------------

    async DFeEventos(chAcesso: string): Promise<any> {
        return new Promise(async (resolve, reject) => {
            const req = https.request(
                urlEventos?.gov?.[this.#config?.tpAmb == 1 ? 'producao' : 'homologacao']?.DFeEventos.replace("{chAcesso}", chAcesso),
                {
                    method: 'GET',
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

    async DFe(NSU: string): Promise<any> {
        return new Promise(async (resolve, reject) => {
            const req = https.request(
                urlEventos?.gov?.[this.#config?.tpAmb == 1 ? 'producao' : 'homologacao']?.DFe.replace("{NSU}", NSU),
                {
                    method: 'GET',
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

    async consultaDPS(id: string): Promise<any> {
        return new Promise(async (resolve, reject) => {
            const req = https.request(
                urlEventos?.gov?.[this.#config?.tpAmb == 1 ? 'producao' : 'homologacao']?.DPSConsulta.replace("{id}", id),
                {
                    method: 'HEAD',
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

    async enviarEvento({ chNFSe = "", tpEvento = "", xJust = "", nSeqEvento = 1, dhEvento = formatData() }): Promise<any> {
        return new Promise(async (resolve, reject) => {
            if (typeof this.#config.cOrgao == "undefined") reject("Tools({...,cOrgao:?}): cOrgao não definido!");
            if (typeof this.#config.CNPJ == "undefined" && typeof this.#config.CPF == "undefined") reject("Tools({...,CPF|CNPJ:?}): CPF|CNPJ não definido!");

            var evento = {
                eventoNfse: {
                    infEvento: {
                        tpAmb: this.#config.tpAmb,
                        cOrgao: this.#config.cOrgao,
                        emit: {
                            ...(this.#config.CNPJ != undefined ? {
                                CNPJ: this.#config.CNPJ,
                            } : {
                                CPF: this.#config.CPF,
                            }),
                            ...(this.#config.IM != undefined ? {
                                CNPJ: this.#config.IM,
                            } : {

                            })
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
            }
            var xml = `<?xml version="1.0" encoding="UTF-8"?>` + await json2xml(evento);
            xml = await this.xmlSign(xml, { tag: "infEvento" });
            const payload = JSON.stringify({
                pedidoRegistroEventoXmlGZipB64: this.gzipB64(xml)
            })

            const req = https.request(
                urlEventos?.gov?.[this.#config?.tpAmb == 1 ? 'producao' : 'homologacao']?.NFSeEventos.replace("{chAcesso}", chNFSe),
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

    async enviarDPS(this: any, xml: string | string[]): Promise<any> {
        const isLote = Array.isArray(xml)

        // >>> IMPORTANTÍSSIMO: deixe NFSeEnvio apontar pro SEFIN (não pro ADN)
        // Ex.: this.urlEventos.gov.homologacao.NFSeEnvio = 'https://sefin.nfse.gov.br/sefinnacional/nfse'
        const url = isLote
            ? (urlEventos?.gov?.[this.#config?.tpAmb == 1 ? 'producao' : 'homologacao']?.LoteEnvio)
            : (urlEventos?.gov?.[this.#config?.tpAmb == 1 ? 'producao' : 'homologacao']?.NFSeEnvio)

        const body = isLote
            ? { LoteXmlGZipB64: (xml as string[]).map(this.gzipB64) }
            : { dpsXmlGZipB64: this.gzipB64(xml as string) }

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



    async xmlSign(xmlJSON: string, data: any = { tag: "infDPS" }): Promise<string> {
        return new Promise(async (resvol, reject) => {
            if (data.tag === undefined) data.tag = "infDPS";
            var xml = await xml2json(xmlJSON) as any;

            if (data.tag == "infDPS") {
                xml.DPS = {
                    ...xml.DPS,
                    ... await xml2json(await this.#getSignature(xmlJSON, data.tag))
                };
            } else if (data.tag == "infEvento") {
                xml.envEvento.evento = {
                    ...xml.envEvento.evento,
                    ... (await xml2json(await this.#getSignature(xmlJSON, data.tag)))
                };
            }
            resvol(await json2xml(xml));
        })
    }

    //Responsavel por gerar assinatura
    async #getSignature(xmlJSON: string, tag: string): Promise<string> {
        return new Promise(async (resvol, reject) => {
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

            return resvol(sig.getSignatureXml())
        })
    }

    //Gerar QRCode da NFCe
    #gerarQRCodeNFCe(NFe: any, versaoQRCode: string = "2", idCSC: string, CSC: string): string {
        let s = '|',
            concat,
            hash;
        if (NFe.infNFe.ide.tpEmis == 1) {
            concat = [NFe.infNFe['@Id'].replace("NFe", ""), versaoQRCode, NFe.infNFe.ide.tpAmb, Number(idCSC)].join(s);
        } else {
            let hexDigestValue = Buffer.from(NFe.Signature.SignedInfo.Reference.DigestValue).toString('hex');
            concat = [NFe.infNFe['@Id'].replace("NFe", ""), versaoQRCode, NFe.infNFe.ide.tpAmb, NFe.infNFe.ide.dhEmi, NFe.infNFe.total.ICMSTot.vNF, hexDigestValue, Number(idCSC)].join(s);
        }
        hash = crypto.createHash('sha1').update(concat + CSC).digest('hex');
        return NFe.infNFeSupl.qrCode + '?p=' + concat + s + hash;
    }

    //Obter certificado 
    async getCertificado(): Promise<object> {
        return new Promise(async (resvol, reject) => {
            this.#certTools().then(resvol).catch(reject)
        })
    }

    async validarXML(xml: string, el: string = "DPS"): Promise<any> {
        return new Promise((resolve, reject) => {
            this.#xmlValido(xml, `${el}_v${this.#config.versao}`).then(resolve).catch(reject);
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