const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Palavras e dicas
const palavras = [
  { palavra: "COMPUTADOR", dica: "Máquina que usamos para programar" },
  { palavra: "ELEFANTE", dica: "Um animal grande com tromba" },
  { palavra: "GIRASSOL", dica: "Flor que segue o sol" },
  { palavra: "CACHORRO", dica: "Melhor amigo do homem" },
  { palavra: "LIVRO", dica: "Usado para ler" },
];

// Função para perguntar e obter resposta
function perguntar(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

(async function jogo() {
  console.log("🎯 Bem-vindo ao Jogo da Forca (Node.js) — Melhor de 3!");

  // Nomes dos grupos
  const grupo1 = await perguntar("Digite o nome do Grupo 1: ");
  const grupo2 = await perguntar("Digite o nome do Grupo 2: ");

  let placar = { [grupo1]: 0, [grupo2]: 0 };

  let vezAtual = Math.random() < 0.5 ? grupo1 : grupo2;
  console.log(`\nSorteio: quem começa é "${vezAtual}"\n`);

  // Melhor de 3
  while (placar[grupo1] < 2 && placar[grupo2] < 2) {
    const sorteio = palavras[Math.floor(Math.random() * palavras.length)];
    const palavraSecreta = sorteio.palavra.toUpperCase();
    const dica = sorteio.dica;
    let letrasCorretas = [];
    let letrasTentadas = [];
    let restante = palavraSecreta.length;

    let rodadaFinalizada = false;

    while (!rodadaFinalizada) {
      console.log("====================================");
      console.log(`Grupos: 1) ${grupo1} (${placar[grupo1]})  —  2) ${grupo2} (${placar[grupo2]})`);
      console.log(`Dica: ${dica}`);
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

      let letraOuPalavra = await perguntar(`${vezAtual}, digite UMA letra ou tente a palavra completa: `);
      letraOuPalavra = letraOuPalavra.toUpperCase();

      // Se tentar adivinhar a palavra completa
      if (letraOuPalavra.length > 1) {
        if (letraOuPalavra === palavraSecreta) {
          console.log(`🎉 O grupo "${vezAtual}" acertou a palavra! Vitória da rodada!`);
          placar[vezAtual]++;
          rodadaFinalizada = true;
        } else {
          console.log("❌ Palavra incorreta! A vez passa para o outro grupo.");
          vezAtual = vezAtual === grupo1 ? grupo2 : grupo1;
        }
        continue;
      }

      // Se digitou uma letra
      if (letrasTentadas.includes(letraOuPalavra)) {
        console.log("⚠️ Letra já tentada, tente outra.");
        continue;
      }

      letrasTentadas.push(letraOuPalavra);

      if (palavraSecreta.includes(letraOuPalavra)) {
        console.log(`✅ Parabéns! A letra "${letraOuPalavra}" está na palavra.`);
        letrasCorretas.push(letraOuPalavra);
      } else {
        console.log(`❌ A letra "${letraOuPalavra}" NÃO está na palavra. Vez passa para o outro grupo.`);
        vezAtual = vezAtual === grupo1 ? grupo2 : grupo1;
      }

      // Checar se faltam 3 letras
      const letrasFaltando = palavraSecreta
        .split("")
        .filter((l) => !letrasCorretas.includes(l)).length;

      if (letrasFaltando >= 3) {
        console.log(`⚠️ Faltam 3 letras! ${vezAtual} tem 10 segundos para tentar a palavra completa!`);

        let acertouNoTempo = false;

        for (let i = 10; i > 0; i--) {
          process.stdout.write(`Tempo restante: ${i}s\r`);
          await new Promise((r) => setTimeout(r, 1000));
        }
        console.log("");

        let tentativa = await perguntar(`${vezAtual}, digite a palavra completa: `);
        tentativa = tentativa.toUpperCase();
        if (tentativa === palavraSecreta) {
          console.log(`🎉 ${vezAtual} acertou a palavra! Vitória da rodada!`);
          placar[vezAtual]++;
          rodadaFinalizada = true;
          acertouNoTempo = true;
        } else {
          console.log(`❌ Palavra incorreta! A vez passa para o outro grupo.`);
          vezAtual = vezAtual === grupo1 ? grupo2 : grupo1;
        }
      }

      // Checar se todas as letras foram acertadas
      if (palavraSecreta.split("").every((l) => letrasCorretas.includes(l))) {
        console.log(`🎉 O grupo "${vezAtual}" completou a palavra! Vitória da rodada!`);
        placar[vezAtual]++;
        rodadaFinalizada = true;
      }
    }

    console.log(`PLACAR: ${grupo1} ${placar[grupo1]} x ${placar[grupo2]} ${grupo2}\n`);
    await perguntar("Pressione Enter para a próxima rodada...");
    console.clear();
  }

  const vencedor = placar[grupo1] === 2 ? grupo1 : grupo2;
  console.log(`🏆 FIM DE JOGO! O vencedor do melhor de 3 é: ${vencedor} 🎉`);

  rl.close();
})();