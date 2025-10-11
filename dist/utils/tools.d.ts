declare class Tools {
    #private;
    constructor(config?: {
        cOrgao: string;
        tpAmb: number;
        CPF: string;
        CNPJ: string;
        IM: string;
        versao: string;
        timeout: number;
        xmllint: string;
        openssl: null;
    }, certificado?: {
        pfx: string;
        senha: string;
    });
    gzipB64(xml: string): string;
    alteraRetMunicipal(idManut: string): Promise<any>;
    consultaRetMunicipal(competencia: string): Promise<any>;
    alteraRegEspecial(idManut: string): Promise<any>;
    consultaRegEspecial(codigoServico: string, competencia: string): Promise<any>;
    alteraBenefMunic(numeroBeneficio: string, competencia: string): Promise<any>;
    consultaBenefMunic(numeroBeneficio: string, competencia: string): Promise<any>;
    consultaAlicotaHist(codigoServico: string): Promise<any>;
    consultaAlicota(codigoServico: string, competencia: string): Promise<any>;
    consultaConvenio(): Promise<any>;
    DFeEventos(chAcesso: string): Promise<any>;
    DFe(NSU: string): Promise<any>;
    consultaDPS(id: string): Promise<any>;
    DANFSe(chAcesso: string): Promise<any>;
    enviarEvento({ chNFSe, tpEvento, xJust, nSeqEvento, dhEvento }: {
        chNFSe?: string | undefined;
        tpEvento?: string | undefined;
        xJust?: string | undefined;
        nSeqEvento?: number | undefined;
        dhEvento?: string | undefined;
    }): Promise<any>;
    enviarDPS(this: any, xml: string | string[]): Promise<any>;
    xmlSign(xmlJSON: string, data?: any): Promise<string>;
    getCertificado(): Promise<object>;
    validarXML(xml: string, el?: string): Promise<any>;
}
export { Tools };
