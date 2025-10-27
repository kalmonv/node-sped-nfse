const SEFIN_HOMOLOGACAO = 'https://sefin.producaorestrita.nfse.gov.br/SefinNacional';
const SEFIN_PRODUCAO = 'https://sefin.nfse.gov.br/sefinnacional';
const ADN_HOMOLOGACAO = 'https://adn.producaorestrita.nfse.gov.br';
const ADN_PRODUCAO = 'https://adn.nfse.gov.br';

const urlEventos = {
    gov: {
        homologacao: { // ESPELHO -> https://www.nfse.gov.br/swagger/contribuintesissqn/#/

            //NFSe -> PDF
            DANFSe: `${ADN_HOMOLOGACAO}/danfse/{chAcesso}`, //GET

            //Manifesto de evento
            NFSeEvent: `${SEFIN_HOMOLOGACAO}/nfse/{chAcesso}/eventos`, //POST

            //Distribuição de NFSe + Eventos
            LoteConsulta: `${ADN_HOMOLOGACAO}/contribuinte/DFe/{NSU}`, //GET 404

            //DPS
            DPSConsulta: `${SEFIN_HOMOLOGACAO}/dps/{DPS}`, //GET
            DPSCheck: `${SEFIN_HOMOLOGACAO}/dps/{DPS}`, //HEAD

            // NFS-e
            NFSeEnvio: `${SEFIN_HOMOLOGACAO}/nfse`, //POST
            NFSeConsulta: `${SEFIN_HOMOLOGACAO}/nfse/{chAcesso}`, //GET

            LoteEnvio: `${ADN_HOMOLOGACAO}/DFe/`, //POST
            DFe: `${ADN_HOMOLOGACAO}/DFe/{NSU}`, //GET

            MunConvenio : `${SEFIN_HOMOLOGACAO}/parametros_municipais/{cOrgao}/convenio` //GET
        },

        producao: { // ESPELHO -> https://www.nfse.gov.br/swagger/contribuintesissqn/#/

            //NFSe -> PDF
            DANFSe: `${ADN_PRODUCAO}/danfse/{chAcesso}`, //GET

            //Manifesto de evento
            NFSeEvent: `${SEFIN_PRODUCAO}/nfse/{chAcesso}/eventos`, //POST

            //Distribuição de NFSe + Eventos
            LoteConsulta: `${ADN_PRODUCAO}/contribuinte/DFe/{NSU}`, //GET 404

            //DPS
            DPSConsulta: `${SEFIN_PRODUCAO}/dps/{DPS}`, //GET
            DPSCheck: `${SEFIN_PRODUCAO}/dps/{DPS}`, //HEAD

            // NFS-e
            NFSeEnvio: `${SEFIN_PRODUCAO}/nfse`, //POST
            NFSeConsulta: `${SEFIN_PRODUCAO}/nfse/{chAcesso}`, //GET

            LoteEnvio: `${ADN_PRODUCAO}/DFe/`, //POST
            DFe: `${ADN_PRODUCAO}/DFe/{NSU}`, //GET

            MunConvenio : `${SEFIN_PRODUCAO}/parametros_municipais/{cOrgao}/convenio` //GET
        }
    }
};

export { urlEventos }