declare const urlEventos: {
    gov: {
        homologacao: {
            NFSeEnvio: string;
            NFSeConsulta: string;
            NFSeCancelar: string;
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
            DFeDistribNSU: string;
            DFeEventosPorChave: string;
        };
        producao: {
            NFSeEnvio: string;
            NFSeConsulta: string;
            NFSeCancelar: string;
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
            DFeDistribNSU: string;
            DFeEventosPorChave: string;
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
