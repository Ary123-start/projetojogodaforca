const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const palavras = [
    { palavra: "COMPUTADOR", dica: "Máquina que usamos para programar" },
    { palavra: "ELEFANTE", dica: "Um animal grande com tromba" },
    { palavra: "GIRASSOL", dica: "Flor que segue o sol" },
    { palavra: "CACHORRO", dica: "Melhor amigo do homem" },
    { palavra: "LIVRO", dica: "Usado para ler" },
];

const palavraDesempate = {
    palavra: "JAVASCRIPT",
    dica: "Linguagem usada para criar este jogo 😄",
};

const boneco = [

`
  +---+
      |
      |
      |
      |
______|__
`,
`
  +---+
  |   O
      |
      |
      |
______|__
`,
`
  +---+
  |   O
  |  /|
      |
      |
______|__
`,
`
  +---+
  |   O
  |  /|
  |  / 
      |
______|__
`,
`
  +---+
  |   O
  |  /|\\
  |  / 
      |
______|__
`,
`
  +---+
  |   O
  |  /|\\
  |  / \\
      |
______|__
`,

];

let erros = 0;
const maxErros = boneco.length - 1;

let grupo1, grupo2;
let letrasCorretas = [];
let letrasTentadas = [];

function perguntar(query) {
    return new Promise((resolve) => rl.question(query, resolve));
}

function tempoPergunta(prompt, timeoutMs) {
    return new Promise((resolve) => {
        process.stdout.write(prompt);
        let answered = false;

        const onLine = (input) => {
            if (answered) return;
            answered = true;
            clearTimeout(timer);
            clearInterval(contador);
            resolve(input);
        };

        const onClose = () => {
            if (answered) return;
            answered = true;
            clearTimeout(timer);
            clearInterval(contador);
            resolve(null);
        };

        rl.once("line", onLine);
        rl.once("close", onClose);

        // 🕒 Contagem regressiva de 10 a 0
        let tempoRestante = timeoutMs / 1000;
        process.stdout.write(`\n⏳ Tempo: ${tempoRestante}s\n`);

        const contador = setInterval(() => {
            tempoRestante--;
            if (tempoRestante > 0) {
                process.stdout.write(`⏳ Tempo: ${tempoRestante}s\n`);
            }
        }, 1000);

        // ⏰ Timer principal
        const timer = setTimeout(() => {
            if (answered) return;
            answered = true;
            clearInterval(contador);
            rl.removeListener("line", onLine);
            rl.removeListener("close", onClose);
            resolve(null);
        }, timeoutMs);
    });
}


function exibir(placar, palavraSecreta, dica, erros, vezAtual) {
    console.log("====================================");
    console.log(`Grupos: 1) ${grupo1} (${placar[grupo1]})  —  2) ${grupo2} (${placar[grupo2]})`);
    console.log(`Dica: ${dica}`);
    console.log(boneco[erros]);
    console.log(
        "Palavra: " +
        palavraSecreta
            .split("")
            .map((l) => (letrasCorretas.includes(l) ? l : "_"))
            .join(" ")
    );
    console.log("Letras já tentadas: " + letrasTentadas.join(", "));
    console.log(`Vez de: ${vezAtual}`);
    console.log("====================================");
}

async function rodada(palavraObj, placar, vezInicial) {
    let vezAtual = vezInicial;
    const palavraSecreta = palavraObj.palavra.toUpperCase();
    const dica = palavraObj.dica;

    letrasCorretas = [];
    letrasTentadas = [];
    erros = 0;

    let rodadaFinalizada = false;

    while (!rodadaFinalizada) {
        exibir(placar, palavraSecreta, dica, erros, vezAtual);

        let tentativa = await perguntar(`${vezAtual}, digite UMA letra ou tente a palavra completa: `);
        tentativa = (tentativa || "").toUpperCase().trim();


        if (tentativa.length > 1) {
            if (tentativa === palavraSecreta) {
                console.log(`🎉 ${vezAtual} acertou a palavra! Vitória da rodada!`);
                placar[vezAtual]++;
                rodadaFinalizada = true;
                erros = 0;
                break;
            } else {
                console.log("❌ Palavra incorreta! A vez passa para o outro grupo.");
                erros++;
                vezAtual = vezAtual === grupo1 ? grupo2 : grupo1;
                if (erros >= maxErros) {
                    console.log(boneco[erros]);
                    console.log(`💀 A forca foi completada! A palavra era: ${palavraSecreta}`);
                    rodadaFinalizada = true;
                    erros = 0;
                }
                continue;
            }
        } else if (tentativa.length === 1) {
    
            if (letrasTentadas.includes(tentativa)) {
                console.log("⚠ Letra já tentada, tente outra.");
                continue;
            }

            letrasTentadas.push(tentativa);

            if (palavraSecreta.includes(tentativa)) {
                console.log(`✅ Parabéns! A letra "${tentativa}" está na palavra.`);
                letrasCorretas.push(tentativa);
            } else {
                console.log(`❌ A letra "${tentativa}" NÃO está na palavra. Vez passa para o outro grupo.`);
                erros++;
                vezAtual = vezAtual === grupo1 ? grupo2 : grupo1;
            }
        } else {
    
            console.log("⚠ Entrada vazia. Tente novamente.");
            continue;
        }


        if (palavraSecreta.split("").every((l) => letrasCorretas.includes(l))) {
            console.log(`🎉 O grupo "${vezAtual}" completou a palavra! Vitória da rodada!`);
            placar[vezAtual]++;
            rodadaFinalizada = true;
            erros = 0;
            break;
        }


        const letrasFaltando = palavraSecreta
            .split("")
            .filter((l) => !letrasCorretas.includes(l)).length;

        if (letrasFaltando <= 3 && !rodadaFinalizada) {
            console.log(`⚠ Faltam ${letrasFaltando} letras! ${vezAtual} tem 10 segundos para tentar a palavra completa!`);

            const chuteFinal = await tempoPergunta(`${vezAtual}, digite a palavra completa: `, 10000);

            if (chuteFinal === null) {
                console.log("\n⏰ Tempo esgotado!");
                console.log("❌ Não respondeu a tempo! A vez passa para o outro grupo.");
                erros++;
                vezAtual = vezAtual === grupo1 ? grupo2 : grupo1;
            } else {
                const chute = chuteFinal.toUpperCase().trim();
                if (chute === palavraSecreta) {
                    console.log(`🎉 ${vezAtual} acertou a palavra! Vitória da rodada!`);
                    placar[vezAtual]++;
                    rodadaFinalizada = true;
                    erros = 0;
                    break;
                } else {
                    console.log("❌ Palavra incorreta! A vez passa para o outro grupo.");
                    erros++;
                    vezAtual = vezAtual === grupo1 ? grupo2 : grupo1;
                }
            }

            if (erros >= maxErros && !rodadaFinalizada) {
                console.log(boneco[erros]);
                console.log(`💀 A forca foi completada! A palavra era: ${palavraSecreta}`);
                rodadaFinalizada = true;
                erros = 0;
                break;
            }
        }


        if (erros >= maxErros && !rodadaFinalizada) {
            console.log(boneco[erros]);
            console.log(`💀 A forca foi completada! A palavra era: ${palavraSecreta}`);
            rodadaFinalizada = true;
            erros = 0;
            break;
        }
    }

    return vezAtual;
}

(async function jogo() {
    console.log("🎯 Bem-vindo ao Jogo da Forca (Node.js) — Melhor de 3!");

    grupo1 = await perguntar("Digite o nome do Grupo 1: ");
    grupo2 = await perguntar("Digite o nome do Grupo 2: ");

    const placar = { [grupo1]: 0, [grupo2]: 0 };

    let vezAtual = Math.random() < 0.5 ? grupo1 : grupo2;
    console.log(`\nSorteio: quem começa é "${vezAtual}"\n`);

    while (placar[grupo1] < 2 && placar[grupo2] < 2) {
        const PalavraSorteada = palavras[Math.floor(Math.random() * palavras.length)];

        vezAtual = await rodada(PalavraSorteada, placar, vezAtual);

        console.log(`PLACAR: ${grupo1} ${placar[grupo1]} x ${placar[grupo2]} ${grupo2}\n`);
        await perguntar("Pressione Enter para a próxima rodada...");
        console.clear();
    }

    if (placar[grupo1] === placar[grupo2]) {
        console.log("⚔️ EMPATE DETECTADO — Vamos para a rodada de DESEMPATE FINAL!");
        await rodada(palavraDesempate, placar, vezAtual);
    }

    const vencedor = placar[grupo1] > placar[grupo2] ? grupo1 : grupo2;
    console.log(`🏆 FIM DE JOGO! O vencedor é: ${vencedor} 🎉`);

    rl.close();
})();