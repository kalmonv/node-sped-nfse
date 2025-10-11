const urlEventos = {
    gov: {
        homologacao: {
            // SEFIN (Produção Restrita) — unitário e consultas oficiais
            NFSeEnvio: "https://sefin.producaorestrita.nfse.gov.br/sefinnacional/nfse",
            NFSeConsulta: "https://sefin.producaorestrita.nfse.gov.br/sefinnacional/nfse/{chAcesso}",
            NFSeEventos: "https://sefin.producaorestrita.nfse.gov.br/sefinnacional/nfse/{chAcesso}/eventos", // POST (registro de evento)
            NFSeConsultaEvento: "https://sefin.producaorestrita.nfse.gov.br/sefinnacional/nfse/{chAcesso}/eventos", // GET
            DPSConsulta: "https://sefin.producaorestrita.nfse.gov.br/sefinnacional/dps/{id}", // GET/HEAD
            DANFSe: "https://sefin.producaorestrita.nfse.gov.br/danfse/{chAcesso}",
            // Parâmetros Municipais (homolog)
            ParamConvenio: "https://adn.producaorestrita.nfse.gov.br/parametrizacao/{codigoMunicipio}/convenio",
            ParamAliquota: "https://adn.producaorestrita.nfse.gov.br/parametrizacao/{codigoMunicipio}/{codigoServico}/{competencia}/aliquota",
            ParamHistoricoAliquotas: "https://adn.producaorestrita.nfse.gov.br/parametrizacao/{codigoMunicipio}/{codigoServico}/historicoaliquotas",
            ParamBefeniciarioMunicipal: "https://adn.producaorestrita.nfse.gov.br/parametrizacao/{codigoMunicipio}/{numeroBeneficio}/{competencia}/beneficio",
            ParamRetencoes: "https://adn.producaorestrita.nfse.gov.br/parametrizacao/{codigoMunicipio}/{competencia}/retencoes",
            ParamRetencoesAltera: "https://adn.producaorestrita.nfse.gov.br/parametrizacao/{codigoMunicipio}/retencoes/{idManut}",
            ParamRegimesEspeciais: "https://adn.producaorestrita.nfse.gov.br/parametrizacao/{codigoMunicipio}/{codigoServico}/{competencia}/regimes_especiais",
            ParamRegimesEspeciaisAltera: "https://adn.producaorestrita.nfse.gov.br/parametrizacao/{codigoMunicipio}/regimes_especiais/{idManut}",
            ParamBeneficio: "https://sefin.producaorestrita.nfse.gov.br/sefinnacional/parametros_municipais/{codigoMunicipio}/{numeroBeneficio}/{competencia}/beneficio",
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
            DANFSe: "https://adn.nfse.gov.br/danfse/{chAcesso}", //OKAY
            // Parâmetros Municipais - https://sefin.nfse.gov.br/sefinnacional
            ParamConvenio: "https://sefin.nfse.gov.br/sefinnacional/parametros_municipais/{codigoMunicipio}/convenio",
            ParamAliquota: "https://sefin.nfse.gov.br/sefinnacional/parametros_municipais/{codigoMunicipio}/{codigoServico}/{competencia}/aliquota",
            ParamHistoricoAliquotas: "https://sefin.nfse.gov.br/sefinnacional/parametros_municipais/{codigoMunicipio}/{codigoServico}/historicoaliquotas",
            ParamBefeniciarioMunicipal: "https://adn.producaorestrita.nfse.gov.br/parametrizacao/{codigoMunicipio}/{numeroBeneficio}/{competencia}/beneficio",
            ParamRetencoes: "https://sefin.nfse.gov.br/sefinnacional/parametros_municipais/{codigoMunicipio}/{competencia}/retencoes",
            ParamRetencoesAltera: "https://adn.producaorestrita.nfse.gov.br/parametrizacao/{codigoMunicipio}/retencoes/{idManut}",
            ParamRegimesEspeciais: "https://sefin.nfse.gov.br/sefinnacional/parametros_municipais/{codigoMunicipio}/{codigoServico}/{competencia}/regimes_especiais",
            ParamRegimesEspeciaisAltera: "https://adn.producaorestrita.nfse.gov.br/parametrizacao/{codigoMunicipio}/regimes_especiais/{idManut}",
            ParamBeneficio: "https://sefin.nfse.gov.br/sefinnacional/parametros_municipais/{codigoMunicipio}/{numeroBeneficio}/{competencia}/beneficio",
            // Lote e distribuição DF-e
            LoteEnvio: "https://adn.nfse.gov.br/DFe/",
            LoteConsulta: "https://adn.nfse.gov.br/DFe/{UltimoNSU}",
            DFe: "https://adn.nfse.gov.br/DFe/{NSU}",
            DFeEventos: "https://sefin.nfse.gov.br/sefinnacional/nfse/{chAcesso}/eventos"
        }
    }
};
export { urlEventos };
