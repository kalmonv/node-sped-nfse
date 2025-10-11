# ATENÇÃO, A BIBLIOTECA NÃO ESTA COMPLETA!
O XML é estruturado em uma ordem específica, sendo indispensável que se observe a sequência de chamadas das funções mencionadas abaixo, bem como a ordem de seus atributos. Por exemplo:
```javascript
var usuario = new Object();

// 1 OPÇÃO - CORRETO
usuario.nome = "Joao"
usuario.ultNome = "Silva"

// 2 OPÇÃO -  CORRETO
usuario = {
    nome: "Joao",
    ultNome: "Silva"
}

// 3 OPÇÃO - INVALIDO
usuario.ultNome = "Silva"
usuario.nome = "Joao"

// 4 OPÇÃO - INVALIDO
usuario = {
    ultNome: "Silva",
    nome: "Joao"
}
```

| Aonde | Motivo            |
|-------|-------------------|
| 🔴    | Não implementado  |
| 🟢    | Implementado      |

# Iniciar biblioteca
```javascript
import { Make, Tools } from "node-sped-nfse"
import fs from "fs";

let myTools = new Tools({ //Configuração de habiente e sistema
    mod: 55,
    tpAmb: 2,
    cUF: 51,

    /*
        OPTATIVO!
        LEIA Instalação do xmllint
    */
    xmllint: `../libxml2-2.9.3-win32-x86_64/bin/xmllint.exe`
}, { //Certificado digital
    pfx: 'certificado.pfx',
    senha: "senha-certificado",
});
```

> NOTA: Muitos campos não são obrigatórios. Caso não haja nenhum valor a ser informado, devem ser criados como NULL.
> NOTA: Caso existam erros na passagem de parâmetros para a classe, será disparada uma Exception e esses erros poderão ser recuperados pelo método getErrors().
 

# Métodos

### 🟢 function __construct()
Método construtor. Instancia a classe

```Javascript
var dps = new Make();
```

### 🟢 function tagInfDPS(std)
Node principal

NOTA: **se o parametro std.Id não for passado a chave será criada e inclusa e poderá ser recuperada no parâmetro chNFe da classe,**
**De outra forma se a chave for passada no parâmetro std.Id e estiver incorreta, um erro será inserido na proriedade errors.**

| Parâmetro | Tipo | Descrição |
| :--- | :---: | :--- |
| std | Object | contêm os dados dos campos, nomeados conforme manual |

```javascript
let std = {
  tpAmb: 1,
  dhEmi: formatData(),
  verAplic: "1.0",
  serie: "1",
  nDPS: "4",
  dCompet: "2025-09-29",
  tpEmit: "1",
  cLocEmi: "5106257"
}

dps.tagInfDPS(std);
```

### 🟢 function tagPrest(std)
Dados do prestador.

| Parâmetro | Tipo | Descrição |
| :--- | :---: | :--- |
| std | Object | contêm os dados dos campos, nomeados conforme manual |

```javascript
let std = {
    CNPJ: "00000000000",
    //CPF: "",
    //NIF: "",
    //cNaoNIF: "",
    //CAEPF: "",
    //IM: "",
    //xNome: "TESTE", //O nome ou razão social do prestador não deve ser informado quando o emitente da DPS for o próprio prestador.
}

dps.tagPrest(std);
```

### 🟢 function tagPrestEnd(std)
Endereço do prestador.

| Parâmetro | Tipo | Descrição |
| :--- | :---: | :--- |
| std | Object | contêm os dados dos campos, nomeados conforme manual |

```javascript
let std = {
    xLgr: "Av Node",
    nro: "38",
    //xCpl: "",
    xBairro: "github",
    fone: "556640028922",
    email: "pp@teste.com.br",
}

dps.tagPrestEnd(std);
```

### 🟢 function tagPrestRegTrib(std)
Regime tributario.

| Parâmetro | Tipo | Descrição |
| :--- | :---: | :--- |
| std | Object | contêm os dados dos campos, nomeados conforme manual |

```javascript
let std = {
    opSimpNac: "2",
    /*  opSimpNac!=2 ?
        regApTribSN: "1",
    */
    regEspTrib: "0"
}

dps.tagPrestRegTrib(std);
```

### 🟢 function tagToma(std)
Identificação do tomador.

| Parâmetro | Tipo | Descrição |
| :--- | :---: | :--- |
| std | Object | contêm os dados dos campos, nomeados conforme manual |

```javascript
let std = {
  CPF: "000000000000",
  //CNPJ: "",
  //NIF: "",
  //cNaoNIF: "",
  //CAEPF: "",
  //IM: "",
  xNome: "Programador Bom de Codigo",
}

dps.tagToma(std);
```

### 🟢 function tagTomaEnd(std)
Endereço do tomador.

| Parâmetro | Tipo | Descrição |
| :--- | :---: | :--- |
| std | Object | contêm os dados dos campos, nomeados conforme manual |

```javascript
let std = {
  cMun: "000000",
  CEP: "00000000",
  //cPais: "US",
  //cEndPost: "10001",
  //xCidade: "New York",
  //xEstProvReg: "NY",
  xLgr: "Rua Nodejs",
  nro: "123",
  xBairro: "UNIAO",
  fone: "1140028922",
  email: "pp@gmail.com"
}

dps.tagTomaEnd(std);
```

### 🟢 function tagServ(std)
Declaração do serviço.

| Parâmetro | Tipo | Descrição |
| :--- | :---: | :--- |
| std | Object | contêm os dados dos campos, nomeados conforme manual |

```javascript
let std = {
  cLocPrestacao: "000000",
  //cPaisPrestacao: "BR",

  cTribNac: "171001",
  cTribMun: "200",
  xDescServ: "SERVICO DE MANUTENCAO DE COMPUTADORES",
  cNBS: "120012000",
  cIntContrib: "001"
}

dps.tagServ(std);
```

### 🟢 function tagVServPrest(std)
Valor do serviço prestado.

| Parâmetro | Tipo | Descrição |
| :--- | :---: | :--- |
| std | Object | contêm os dados dos campos, nomeados conforme manual |

```javascript
let std = {
  vServ: "1.00"
}

dps.tagVServPrest(std);
```


### 🟢 function tagTribMun(std)
Tributação municipal.

| Parâmetro | Tipo | Descrição |
| :--- | :---: | :--- |
| std | Object | contêm os dados dos campos, nomeados conforme manual |

```javascript
let std = {
  tribISSQN: "4",   // tributado
  tpRetISSQN: "1"   // retenção (ajuste conforme o seu caso)
  // BM: "1.00",    // (opcional) Base de cálculo municipal, use se for diferente do vServ
  // tpImunidade: "0", exigSusp: "0", cPaisResult: "1058" // só se aplicarem
}

dps.tagTribMun(std);
```

### 🟢 function tagTotTribPTotTrib(std)
Porcetagem de tributo Federa/Estadual/Municipal

| Parâmetro | Tipo | Descrição |
| :--- | :---: | :--- |
| std | Object | contêm os dados dos campos, nomeados conforme manual |

```javascript
let std = {
  pTotTribFed: "0.00",
  pTotTribEst: "0.00",
  pTotTribMun: "0.00"
}

dps.tagTotTribPTotTrib(std);
```

### 🟢 function tagTotTribPTotTrib(std)
Gera XML do DPS.

```javascript
DPS.xml()
```