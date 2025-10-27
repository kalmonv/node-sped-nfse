type typeConsulta = {
    NSU?: string;
    DPS?: string;
    chAcesso?: string;
    verifDPS?: string;
};
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
    enviarDPS(this: any, xml: string | string[]): Promise<any>;
    DANFSe(chAcesso: string): Promise<any>;
    consulta({ NSU, DPS, chAcesso, verifDPS }?: typeConsulta): Promise<any>;
    enviarEvento({ chNFSe, tpEvento, dhEvento, id, xDesc, cMotivo, xMotivo, chSubstituta, CPFAgTrib, nProcAdm, idEvManifRej, xProcAdm, cEvtNFSe, idBloqOfic, nPedRegEvento }: {
        chNFSe?: string | undefined;
        tpEvento?: string | undefined;
        dhEvento?: string | undefined;
        id?: string | undefined;
        xDesc?: string | undefined;
        cMotivo?: string | undefined;
        xMotivo?: string | undefined;
        chSubstituta?: string | undefined;
        CPFAgTrib?: string | undefined;
        nProcAdm?: string | undefined;
        idEvManifRej?: string | undefined;
        xProcAdm?: string | undefined;
        cEvtNFSe?: string | undefined;
        idBloqOfic?: string | undefined;
        nPedRegEvento?: string | undefined;
    }): Promise<any>;
    consultaConvenio(): Promise<any>;
    xmlSign(xmlJSON: string, tag?: string): Promise<string>;
    getCertificado(): Promise<object>;
    validarXML(xml: string, schema?: string): Promise<any>;
}
export { Tools };
