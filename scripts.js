console.log("JavaScript carregado!");


// ========================================
// PEDIDO PARA A IA
// ========================================

const pedido = `
Leia este comprovante de compra com muita atenção.

Identifique TODOS os itens comprados.

Mantenha EXATAMENTE a ordem em que os itens
aparecem na imagem, de cima para baixo.

Para cada item, informe:

- nome do produto
- quantidade, se estiver visível
- valor do item

Não invente informações.

Responda EXATAMENTE neste formato:

ITEM: nome do produto | QTD: quantidade | VALOR: R$ 0,00

ITEM: nome do produto | QTD: quantidade | VALOR: R$ 0,00

ITEM: nome do produto | QTD: quantidade | VALOR: R$ 0,00

TOTAL: R$ 0,00

Não coloque explicações antes ou depois.
`;


// ========================================
// ELEMENTOS DA PÁGINA
// ========================================

const status =
  document.querySelector(".status");

const totalGasto =
  document.querySelector(".total-gasto");

const quantidade =
  document.querySelector(".quantidade");

const lista =
  document.querySelector("#lista-comprovantes");

const contadorLista =
  document.querySelector("#contador-lista");


// ========================================
// MEMÓRIA DOS COMPROVANTES
// ========================================

// Carrega os comprovantes salvos.
// Se não existir nada salvo, começa com [].

let comprovantes =
  JSON.parse(
    localStorage.getItem("comprovantes")
  ) || [];


// ========================================
// SALVAR NO NAVEGADOR
// ========================================

function salvarComprovantes() {

  localStorage.setItem(
    "comprovantes",
    JSON.stringify(comprovantes)
  );

}


// ========================================
// FORMATAR DINHEIRO
// ========================================

function formatarDinheiro(valor) {

  return valor.toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL"
    }
  );

}


// ========================================
// MOSTRAR STATUS
// ========================================

function mostrarStatus(texto) {

  if (status) {

    status.textContent = texto;

  }

}


// ========================================
// CALCULAR TOTAL GERAL
// ========================================

function calcularTotalGeral() {

  let total = 0;

  for (
    const comprovante of comprovantes
  ) {

    if (
      comprovante.total !== null &&
      typeof comprovante.total === "number"
    ) {

      total += comprovante.total;

    }

  }

  return total;

}


// ========================================
// ATUALIZAR RESUMO
// ========================================

function atualizarResumo() {

  const total =
    calcularTotalGeral();

  totalGasto.textContent =
    formatarDinheiro(total);

  quantidade.textContent =
    comprovantes.length;

  contadorLista.textContent =
    comprovantes.length;

}


// ========================================
// CONVERTER VALOR
// ========================================

function converterValor(texto) {

  if (!texto) {

    return null;

  }

  const encontrado =
    texto.match(
      /R\$\s*([0-9.,]+)/i
    );

  if (!encontrado) {

    return null;

  }

  let numero =
    encontrado[1];

  numero =
    numero.replace(/\./g, "");

  numero =
    numero.replace(",", ".");

  const valor =
    parseFloat(numero);

  if (isNaN(valor)) {

    return null;

  }

  return valor;

}


// ========================================
// PROCESSAR RESPOSTA DA IA
// ========================================

function processarResposta(texto) {

  const linhas =
    texto.split("\n");

  const itens = [];

  let totalNota = null;


  for (
    let linha of linhas
  ) {

    linha =
      linha.trim();


    if (!linha) {

      continue;

    }


    // ====================================
    // TOTAL
    // ====================================

    if (
      linha
        .toUpperCase()
        .startsWith("TOTAL:")
    ) {

      totalNota =
        converterValor(linha);

      continue;

    }


    // ====================================
    // ITEM
    // ====================================

    if (
      linha
        .toUpperCase()
        .startsWith("ITEM:")
    ) {

      const partes =
        linha.split("|");


      let nome = "";

      let quantidadeItem = "";

      let valor = null;


      for (
        let parte of partes
      ) {

        parte =
          parte.trim();


        if (
          parte
            .toUpperCase()
            .startsWith("ITEM:")
        ) {

          nome =
            parte
              .substring(5)
              .trim();

        }


        else if (
          parte
            .toUpperCase()
            .startsWith("QTD:")
        ) {

          quantidadeItem =
            parte
              .substring(4)
              .trim();

        }


        else if (
          parte
            .toUpperCase()
            .startsWith("VALOR:")
        ) {

          valor =
            converterValor(parte);

        }

      }


      if (nome) {

        itens.push({

          nome: nome,

          quantidade:
            quantidadeItem,

          valor: valor

        });

      }

    }

  }


  return {

    itens: itens,

    total: totalNota

  };

}


// ========================================
// CRIAR CARTÃO DO COMPROVANTE
// ========================================

function criarComprovanteCard(
  comprovante,
  numero
) {

  const card =
    document.createElement("div");

  card.className =
    "comprovante-card";


  // CABEÇALHO

  const cabecalho =
    document.createElement("button");

  cabecalho.className =
    "comprovante-cabecalho";

  cabecalho.type =
    "button";


  const esquerda =
    document.createElement("div");

  esquerda.className =
    "comprovante-titulo";


  const icone =
    document.createElement("span");

  icone.className =
    "icone-documento";

  icone.textContent =
    "🧾";


  const nome =
    document.createElement("strong");

  nome.textContent =
    "Comprovante " + numero;


  esquerda.appendChild(
    icone
  );

  esquerda.appendChild(
    nome
  );


  const direita =
    document.createElement("div");

  direita.className =
    "comprovante-resumo";


  const total =
    document.createElement("strong");


  if (
    comprovante.total !== null
  ) {

    total.textContent =
      formatarDinheiro(
        comprovante.total
      );

  }

  else {

    total.textContent =
      "Valor não identificado";

  }


  const seta =
    document.createElement("span");

  seta.className =
    "seta";

  seta.textContent =
    "▼";


  direita.appendChild(
    total
  );

  direita.appendChild(
    seta
  );


  cabecalho.appendChild(
    esquerda
  );

  cabecalho.appendChild(
    direita
  );


  // CONTEÚDO

  const conteudo =
    document.createElement("div");

  conteudo.className =
    "comprovante-conteudo";


  const tituloItens =
    document.createElement("p");

  tituloItens.className =
    "titulo-itens";

  tituloItens.textContent =
    "Itens";


  conteudo.appendChild(
    tituloItens
  );


  // ITENS

  comprovante.itens.forEach(
    (item, indice) => {

      const linha =
        document.createElement("div");

      linha.className =
        "item";


      const esquerdaItem =
        document.createElement("div");

      esquerdaItem.className =
        "item-info";


      const numeroItem =
        document.createElement("span");

      numeroItem.className =
        "numero-item";

      numeroItem.textContent =
        indice + 1;


      const nomeItem =
        document.createElement("span");

      nomeItem.className =
        "nome-item";

      nomeItem.textContent =
        item.nome;


      esquerdaItem.appendChild(
        numeroItem
      );

      esquerdaItem.appendChild(
        nomeItem
      );


      const direitaItem =
        document.createElement("div");

      direitaItem.className =
        "valor-item";


      if (
        item.quantidade
      ) {

        const qtd =
          document.createElement("small");

        qtd.textContent =
          "x" + item.quantidade;

        direitaItem.appendChild(
          qtd
        );

      }


      if (
        item.valor !== null
      ) {

        const valorItem =
          document.createElement("strong");

        valorItem.textContent =
          formatarDinheiro(
            item.valor
          );

        direitaItem.appendChild(
          valorItem
        );

      }


      linha.appendChild(
        esquerdaItem
      );

      linha.appendChild(
        direitaItem
      );


      conteudo.appendChild(
        linha
      );

    }
  );


  // TOTAL

  const linhaTotal =
    document.createElement("div");

  linhaTotal.className =
    "linha-total";


  const textoTotal =
    document.createElement("span");

  textoTotal.textContent =
    "TOTAL";


  const valorTotal =
    document.createElement("strong");


  if (
    comprovante.total !== null
  ) {

    valorTotal.textContent =
      formatarDinheiro(
        comprovante.total
      );

  }

  else {

    valorTotal.textContent =
      "Não identificado";

  }


  linhaTotal.appendChild(
    textoTotal
  );

  linhaTotal.appendChild(
    valorTotal
  );


  conteudo.appendChild(
    linhaTotal
  );


  // MONTAR

  card.appendChild(
    cabecalho
  );

  card.appendChild(
    conteudo
  );


  // ABRIR / FECHAR

  cabecalho.addEventListener(
    "click",
    () => {

      card.classList.toggle(
        "aberto"
      );

    }
  );


  return card;

}


// ========================================
// RENDERIZAR COMPROVANTES
// ========================================

function renderizarComprovantes() {

  lista.innerHTML = "";


  if (
    comprovantes.length === 0
  ) {

    const vazio =
      document.createElement("div");

    vazio.className =
      "lista-vazia";


    const icone =
      document.createElement("span");

    icone.textContent =
      "🧾";


    const texto =
      document.createElement("p");

    texto.textContent =
      "Nenhum comprovante adicionado ainda.";


    vazio.appendChild(
      icone
    );

    vazio.appendChild(
      texto
    );


    lista.appendChild(
      vazio
    );

    return;

  }


  comprovantes.forEach(
    (comprovante, indice) => {

      const card =
        criarComprovanteCard(
          comprovante,
          indice + 1
        );


      lista.appendChild(
        card
      );

    }
  );

}


// ========================================
// LER FOTO
// ========================================

async function lerFoto() {

  const input =
    document.querySelector(".foto");


  const foto =
    input.files[0];


  if (!foto) {

    mostrarStatus(
      "Nenhuma foto selecionada."
    );

    return;

  }


  mostrarStatus(
    "📷 Foto recebida! Lendo comprovante..."
  );


  try {

    // VERIFICAR PUTER

    if (
      typeof puter === "undefined"
    ) {

      throw new Error(
        "Puter não foi carregado."
      );

    }


    console.log(
      "Enviando foto para a IA..."
    );


    // ENVIAR PARA IA

    const resposta =
      await puter.ai.chat(
        pedido,
        foto
      );


    console.log(
      "Resposta da IA:",
      resposta
    );


    // PEGAR TEXTO

    let textoResposta = "";


    if (
      resposta &&
      resposta.message &&
      resposta.message.content
    ) {

      textoResposta =
        resposta.message.content;

    }

    else if (
      typeof resposta === "string"
    ) {

      textoResposta =
        resposta;

    }

    else {

      textoResposta =
        JSON.stringify(
          resposta
        );

    }


    // PROCESSAR

    const dados =
      processarResposta(
        textoResposta
      );


    // VERIFICAR

    if (
      dados.itens.length === 0 &&
      dados.total === null
    ) {

      mostrarStatus(
        "⚠️ Não consegui identificar os itens."
      );

      return;

    }


    // ADICIONAR

    comprovantes.push({

      itens:
        dados.itens,

      total:
        dados.total

    });


    // ==================================
    // SALVAR PERMANENTEMENTE
    // ==================================

    salvarComprovantes();


    // ATUALIZAR TELA

    renderizarComprovantes();

    atualizarResumo();


    mostrarStatus(
      "✅ Comprovante " +
      comprovantes.length +
      " salvo!"
    );


    // LIMPAR INPUT

    input.value = "";


  }

  catch (erro) {

    console.error(
      "ERRO:",
      erro
    );


    mostrarStatus(
      "❌ Erro ao ler o comprovante."
    );


    const mensagem =
      document.createElement("div");

    mensagem.className =
      "erro";


    mensagem.textContent =
      "Erro: " +
      (
        erro.message ||
        "Não foi possível consultar a IA."
      );


    lista.prepend(
      mensagem
    );

  }

}


// ========================================
// INICIALIZAÇÃO
// ========================================

// Quando o site abrir novamente,
// recupera automaticamente os dados.

renderizarComprovantes();

atualizarResumo();

mostrarStatus(
  comprovantes.length > 0
    ? "💾 Comprovantes recuperados do navegador."
    : "Aguardando comprovante..."
);

console.log(
  "Comprovantes salvos:",
  comprovantes.length
);