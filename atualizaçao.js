const readline = require("readline");
const { clearInterval } = require("timers");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const palavras = [
  { palavra: "INTERNET", dica: "Rede que conecta o mundo inteiro." },
  { palavra: "CELULAR", dica: "Aparelho que cabe na mão." },
  { palavra: "ALGORITMO", dica: "Sequência lógica para resolver um problema." },
  { palavra: "LABIRINTO", dica: "Lugar cheio de caminhos e becos." },
  { palavra: "CAMUFLAGEM", dica: "Técnica usada para se esconder." },
  { palavra: "SUBMARINO", dica: "Um tipo de veículo." },
  { palavra: "CRONÔMETRO", dica: "Marca o tempo." },
  { palavra: "FANTASMA", dica: "Figura presente em histórias de terror." },
  { palavra: "METAMORFOSE", dica: "Transformação completa de algo." },
  { palavra: "CONSCIÊNCIA", dica: "Capacidade de perceber e pensar." },
  { palavra: "HIPOPÓTAMO", dica: "Animal grande que vive na água." },
  { palavra: "CIRCUNFERÊNCIA", dica: "Linha que contorna um círculo." },
  { palavra: "PARALELEPÍPEDO", dica: "Bloco de pedra usado em calçadas." },
  { palavra: "PROTAGONISTA", dica: "Personagem principal de uma história." },
  { palavra: "AUSTRÁLIA", dica: "País dos cangurus." },
  { palavra: "AFEGANISTÃO", dica: "País da Ásia Central com montanhas." },
  { palavra: "ZEBRA", dica: "Tem listras." },
  { palavra: "PAPAGAIO", dica: "Repete o que ouve." },
  { palavra: "ASTRONAUTA", dica: "Viaja para longe." },
  { palavra: "METEOROLOGISTA", dica: "Prevê o futuro." },
  { palavra: "PROGRAMADOR", dica: "Profissional que escreve." },
  { palavra: "ESPANTALHO", dica: "Usado nas plantações." },
  { palavra: "GALO", dica: "Acorda cedo." },
  { palavra: "RADIALISTA", dica: "Fala com milhares." }

/*

*/

];

// 🔸 Lista auxiliar para controle de palavras já usadas
let palavrasDisponiveis = [...palavras];

// 🔸 Função para sortear e remover a palavra da lista
function sortearPalavra() {
    if (palavrasDisponiveis.length === 0) {
        console.log("⚠️ Não há mais palavras disponíveis!");
        return null;
    }
    const indice = Math.floor(Math.random() * palavrasDisponiveis.length);
    const sorteada = palavrasDisponiveis[indice];
    palavrasDisponiveis.splice(indice, 1);
    return sorteada;
}

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
  |  😐
  |   
  |   
  |   
______|__
`,
`
  +---+
  |  😟
  |   |
  |   
  |   
______|__
`,
`
  +---+
  |  😧
  |  /|
  |   
  |   
______|__
`,
`
  +---+
  |  😨
  |  /|\\
  |   
  |   
______|__
`,
`
  +---+
  |  😵
  |  /|\\
  |  / 
  |   
______|__
`,
`
  +---+
  |  💀
  |  /|\\
  |  / \\
  |   
______|__
`
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
    let time = 10;
    return new Promise((resolve) => {
        process.stdout.write(prompt);
        let answered = false;
        readline.cursorTo(process.stdout, 0); 
    
        const onLine = (input) => {
            if (answered) return;
            answered = true;
            if (timerInterval) clearInterval(timerInterval);
            if (timeoutHandle) clearTimeout(timeoutHandle);
            rl.removeListener("line", onLine);
            rl.removeListener("close", onClose);
            resolve(input);
        };

        const onClose = () => {
            if (answered) return;
            answered = true;
            if (timerInterval) clearInterval(timerInterval);
            if (timeoutHandle) clearTimeout(timeoutHandle);
            rl.removeListener("line", onLine);
            rl.removeListener("close", onClose);
            resolve(null);
        };

        rl.once("line", onLine);
        rl.once("close", onClose);

        const timerInterval = setInterval(() => {
            if (answered) return;
            time--;
            const displayTime = Math.max(0, time);
            process.stdout.write(`\r⏰ Tempo restante: ${displayTime} segundos`);
            process.stdout.write('\n');
            rl.prompt(true);
        }, timeoutMs);

        const timeoutHandle = setTimeout(() => {
            if (answered) return;
            answered = true;
            if (timerInterval) clearInterval(timerInterval);
            rl.removeListener("line", onLine);
            rl.removeListener("close", onClose);
            resolve(null);
        }, timeoutMs * (time + 1));
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

            const chuteFinal = await tempoPergunta(`${vezAtual}, digite a palavra completa: `, 1000);

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
    console.log("🎯 Bem-vindo ao Jogo da Forca — Melhor de 3!");

    grupo1 = await perguntar("Digite o nome do Grupo 1: ");
    grupo2 = await perguntar("Digite o nome do Grupo 2: ");

    const placar = { [grupo1]: 0, [grupo2]: 0 };

    let vezAtual = Math.random() < 0.5 ? grupo1 : grupo2;
    console.log(`\nSorteio: quem começa é "${vezAtual}"\n`);

    while (placar[grupo1] < 2 && placar[grupo2] < 2) {
        const PalavraSorteada = sortearPalavra();
        if (!PalavraSorteada) {
            console.log("🚫 Não há mais palavras disponíveis para continuar o jogo.");
            break;
        }

        vezAtual = await rodada(PalavraSorteada, placar, vezAtual);

        console.log(`PLACAR: ${grupo1} ${placar[grupo1]} x ${placar[grupo2]} ${grupo2}\n`);
        await perguntar("Pressione Enter para a próxima rodada...");
        console.clear();
    }

    const vencedor = placar[grupo1] > placar[grupo2] ? grupo1 : grupo2;
    console.log(`🏆 FIM DE JOGO! O vencedor é: ${vencedor} 🎉`);

    rl.close();
})();
