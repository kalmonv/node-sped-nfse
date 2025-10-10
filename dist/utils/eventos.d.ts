declare const urlEventos: {
    gov: {
        homologacao: {
            NFSeEnvio: string;
            NFSeConsulta: string;
            NFSeEventos: string;
            NFSeConsultaEvento: string;
            DPSConsulta: string;
            DANFSe: string;
            ParamConvenio: string;
            ParamAliquota: string;
            ParamHistoricoAliquotas: string;
            ParamRetencoes: string;
            ParamRegimesEspeciais: string;
            ParamBeneficio: string;
            LoteEnvio: string;
            LoteConsulta: string;
            DFe: string;
            DFeEventos: string;
        };
        producao: {
            NFSeEnvio: string;
            NFSeConsulta: string;
            NFSeEventos: string;
            NFSeConsultaEvento: string;
            DPSConsulta: string;
            DANFSe: string;
            ParamConvenio: string;
            ParamAliquota: string;
            ParamHistoricoAliquotas: string;
            ParamRetencoes: string;
            ParamRegimesEspeciais: string;
            ParamBeneficio: string;
            LoteEnvio: string;
            LoteConsulta: string;
            DFe: string;
            DFeEventos: string;
        };
    };
};
declare const urlServicos: {
    [key: string]: any;
};
declare const qrCodeUrls: {
    [key: string]: any;
};
export { urlServicos, qrCodeUrls, urlEventos };
