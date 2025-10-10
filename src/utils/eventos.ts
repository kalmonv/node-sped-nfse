const urlEventos = {
    gov: {
        homologacao: {
            // SEFIN (Produção Restrita) — unitário e consultas oficiais
            NFSeEnvio: "https://sefin.producaorestrita.nfse.gov.br/sefinnacional/nfse",
            NFSeConsulta: "https://sefin.producaorestrita.nfse.gov.br/sefinnacional/nfse/{chAcesso}",
            NFSeEventos: "https://sefin.producaorestrita.nfse.gov.br/sefinnacional/nfse/{chAcesso}/eventos", // POST (registro de evento)
            NFSeConsultaEvento: "https://sefin.producaorestrita.nfse.gov.br/sefinnacional/nfse/{chAcesso}/eventos", // GET
            DPSConsulta: "https://sefin.producaorestrita.nfse.gov.br/sefinnacional/dps/{id}",  // GET/HEAD
            DANFSe: "https://sefin.producaorestrita.nfse.gov.br/danfse/{chAcesso}",

            // Parâmetros Municipais (homolog)
            ParamConvenio: "https://sefin.nfse.gov.br/sefinnacional/parametros_municipais/{codMunicipal}/convenio",
            ParamAliquota: "https://sefin.producaorestrita.nfse.gov.br/sefinnacional/parametros_municipais/{codMunicipal}/{codigoServico}/{competencia}/aliquota",
            ParamHistoricoAliquotas: "https://sefin.producaorestrita.nfse.gov.br/sefinnacional/parametros_municipais/{codMunicipal}/{codigoServico}/historicoaliquotas",
            ParamRetencoes: "https://sefin.producaorestrita.nfse.gov.br/sefinnacional/parametros_municipais/{codMunicipal}/{competencia}/retencoes",
            ParamRegimesEspeciais: "https://sefin.producaorestrita.nfse.gov.br/sefinnacional/parametros_municipais/{codMunicipal}/{codigoServico}/{competencia}/regimes_especiais",
            ParamBeneficio: "https://sefin.producaorestrita.nfse.gov.br/sefinnacional/parametros_municipais/{codMunicipal}/{numeroBeneficio}/{competencia}/beneficio",

            // ADN (Produção Restrita) — lote e distribuição DF-e
            LoteEnvio: "https://adn.producaorestrita.nfse.gov.br/dfe",
            LoteConsulta: "https://adn.producaorestrita.nfse.gov.br/dfe/{nsuRecepcao}",
            DFe: "https://adn.producaorestrita.nfse.gov.br/contribuinte/DFe/{NSU}",
            DFeEventos: "https://adn.producaorestrita.nfse.gov.br/contribuinte/NFSe/{chAcesso}/Eventos"
        },

        producao: {
            // Emissão e consultas oficiais
            NFSeEnvio: "https://sefin.nfse.gov.br/sefinnacional/nfse",
            NFSeConsulta: "https://sefin.nfse.gov.br/sefinnacional/nfse/{chAcesso}",
            NFSeEventos: "https://sefin.nfse.gov.br/sefinnacional/nfse/{chAcesso}/eventos",
            NFSeConsultaEvento: "https://sefin.nfse.gov.br/sefinnacional/nfse/{chAcesso}/eventos/{tipoEvento}/{numSeqEvento}",
            DPSConsulta: "https://sefin.nfse.gov.br/sefinnacional/dps/{id}",
            DANFSe: "https://adn.nfse.gov.br/danfse/{chAcesso}",

            // Parâmetros Municipais
            ParamConvenio: "https://sefin.nfse.gov.br/sefinnacional/parametros_municipais/{codMunicipal}/convenio",
            ParamAliquota: "https://sefin.nfse.gov.br/sefinnacional/parametros_municipais/{codMunicipal}/{codigoServico}/{competencia}/aliquota",
            ParamHistoricoAliquotas: "https://sefin.nfse.gov.br/sefinnacional/parametros_municipais/{codMunicipal}/{codigoServico}/historicoaliquotas",
            ParamRetencoes: "https://sefin.nfse.gov.br/sefinnacional/parametros_municipais/{codMunicipal}/{competencia}/retencoes",
            ParamRegimesEspeciais: "https://sefin.nfse.gov.br/sefinnacional/parametros_municipais/{codMunicipal}/{codigoServico}/{competencia}/regimes_especiais",
            ParamBeneficio: "https://sefin.nfse.gov.br/sefinnacional/parametros_municipais/{codMunicipal}/{numeroBeneficio}/{competencia}/beneficio",

            // Lote e distribuição DF-e
            LoteEnvio: "https://adn.nfse.gov.br/DFe/",
            LoteConsulta: "https://adn.nfse.gov.br/DFe/{UltimoNSU}",
            DFe: "https://adn.nfse.gov.br/DFe/{NSU}",
            DFeEventos: "https://sefin.nfse.gov.br/sefinnacional/nfse/{chAcesso}/eventos"
        }
    }
};

export { urlEventos }