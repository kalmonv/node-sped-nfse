declare class Tools {
    #private;
    constructor(config?: {
        mod: string;
        xmllint: string;
        UF: string;
        tpAmb: number;
        CSC: string;
        CSCid: string;
        versao: string;
        timeout: number;
        openssl: null;
        CPF: string;
        CNPJ: string;
    }, certificado?: {
        pfx: string;
        senha: string;
    });
    enviarDPS2(xmlDPS: string): Promise<{
        status: number;
        body: string;
    }>;
    gzipB64(xml: string): string;
    private normalizeUtf8Xml;
    checkConvenio(codigoMunicipio: string): Promise<any>;
    enviarDPS(this: any, xml: string | string[]): Promise<any>;
    xmlSign(xmlJSON: string, data?: any): Promise<string>;
    xml2json(xml: string): Promise<object>;
    json2xml(obj: object): Promise<string>;
    getCertificado(): Promise<object>;
    consultarNFe(chNFe: string): Promise<string>;
    sefazEvento({ chNFe, tpEvento, nProt, xJust, nSeqEvento, dhEvento }: {
        chNFe?: string | undefined;
        tpEvento?: string | undefined;
        nProt?: string | undefined;
        xJust?: string | undefined;
        nSeqEvento?: number | undefined;
        dhEvento?: string | undefined;
    }): Promise<string>;
    sefazDistDFe({ ultNSU, chNFe }: {
        ultNSU?: string;
        chNFe?: string;
    }): Promise<string>;
    sefazStatus(): Promise<string>;
    validarXML(xml: string, el?: string): Promise<any>;
}
export { Tools };
