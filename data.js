// data.js

// FUNÇÃO HELPER: Retorna a carta pelo ID, que será usada no script.js
function obterCartaPorId(id) {
    return bancoDeCartas.find(c => c.id === parseInt(id));
}

// ATUALIZADO: Lista completa das Cartas com Descrição e Artista
const bancoDeCartas = [
    { id: 101, nome: "Katara", raridade: "Comum", set: "Novos Rostos", imagem: "imagens/katara01.jpg", descricao: "A dominadora de água que tem a visão do jogo. Essencial no time para manter a defesa.", artista: "A. Sereia" },
    { id: 102, nome: "Sailor Mars", raridade: "Comum", set: "Novos Rostos", imagem: "imagens/sailor mars.jpeg", descricao: "Uma guerreira incansável, utiliza o fogo para queimar a concorrência. Renda estável.", artista: "R. Hino" },
    { id: 103, nome: "Toph", raridade: "Comum", set: "Novos Rostos", imagem: "imagens/toph.jpeg", descricao: "Mestra no domínio de terra, pode parecer cega, mas enxerga mais que todos.", artista: "O. Terroso" },
    { id: 104, nome: "Katara (V2)", raridade: "Raro", set: "Novos Rostos", imagem: "imagens/katara02.jpg", descricao: "Versão aprimorada. Possui bônus em dias de chuva e é imune a ataques de gelo.", artista: "A. Sereia" },
    { id: 105, nome: "Nami", raridade: "Raro", set: "Novos Rostos", imagem: "imagens/nami01.jpeg", descricao: "Gênio da navegação e finanças. Com ela, a grana nunca se perde. Média renda.", artista: "E. Oda" },
    { id: 106, nome: "Evelyn Chevalier", raridade: "Épico", set: "Novos Rostos", imagem: "imagens/evelynchevalier.jpeg", descricao: "Uma amazona lendária que protege seus aliados. Seu poder é a lealdade e a força.", artista: "J. Cavaleiro" },
    { id: 107, nome: "Kasumi", raridade: "Épico", set: "Novos Rostos", imagem: "imagens/kasumi01.jpeg", descricao: "A ninja fantasma. Ataca sorrateiramente. Alta taxa de acerto crítico de renda.", artista: "T. Fantasma" },
    { id: 108, nome: "Tsunade", raridade: "Lendário", set: "Novos Rostos", imagem: "imagens/tsunade01.jpg", descricao: "O poder do dragão adormecido. Desbloqueia novas táticas de alto risco e retorno.", artista: "D. Zard" },
    { id: 109, nome: "Goldship", raridade: "Mítico", set: "Novos Rostos", imagem: "imagens/goldship.jpeg", descricao: "A personificação da sorte bruta. Seu RNG é lendário. Traz sorte para toda a equipe.", artista: "M. Zilla" },
    { id: 110, nome: "Mabel & Pacifica", raridade: "Secreto", set: "Novos Rostos", imagem: "imagens/mabel01.jpg", descricao: "Extremamente rara. Sua existência desafia as probabilidades. Aumenta a renda da base em 500%.", artista: "O. Oculto" },

    { id: 201, nome: "Carta B-1", raridade: "Comum", set: "Pacote B", imagem: "imagens/201.png", descricao: "A carta base, essencial para começar sua jornada no asfalto.", artista: "Time B" },
    { id: 202, nome: "Carta B-2", raridade: "Comum", set: "Pacote B", imagem: "imagens/202.png", descricao: "Um lutador de rua que conhece os truques para sobreviver na periferia.", artista: "Time B" },
    { id: 203, nome: "Carta B-3", raridade: "Comum", set: "Pacote B", imagem: "imagens/203.png", descricao: "O olheiro. Ajuda a identificar as melhores oportunidades de lucro.", artista: "Time B" },
    { id: 204, nome: "Carta B-4", raridade: "Raro", set: "Pacote B", imagem: "imagens/204.png", descricao: "O negociador, sempre consegue fechar um bom negócio. Renda melhorada.", artista: "Time B" },
    { id: 205, nome: "Carta B-5", raridade: "Raro", set: "Pacote B", imagem: "imagens/205.png", descricao: "O investidor de baixo risco, lucra pouco, mas sempre lucra.", artista: "Time B" },
    { id: 206, nome: "Carta B-6", raridade: "Épico", set: "Pacote B", imagem: "imagens/206.png", descricao: "Um hacker que encontra falhas no sistema financeiro para lucrar discretamente.", artista: "Time B" },
    { id: 207, nome: "Carta B-7", raridade: "Épico", set: "Pacote B", imagem: "imagens/207.png", descricao: "O estrategista que planeja o futuro do time. Ganho de longo prazo garantido.", artista: "Time B" },
    { id: 208, nome: "Carta B-8", raridade: "Lendário", set: "Pacote B", imagem: "imagens/208.png", descricao: "O chefão do crime. Seu domínio garante renda constante em qualquer condição.", artista: "Time B" },
    { id: 209, nome: "Carta B-9", raridade: "Mítico", set: "Pacote B", imagem: "imagens/209.png", descricao: "O mestre da alquimia do dinheiro. Transforma pequenas somas em grandes fortunas.", artista: "Time B" },
    { id: 210, nome: "Carta B-10", raridade: "Secreto", set: "Pacote B", imagem: "imagens/210.png", descricao: "A lenda urbana que controla tudo. Dá um bônus massivo e secreto a todos os membros da equipe.", artista: "O. Oculto" }
];

// Dados para a Meta (Conquistas)
const bancoConquistas = [
    { id: 1, nome: "Primeiro Passo", desc: "Junte 500 de Grana", icone: "🪙", condicao: () => grana >= 500, recompensa: () => { grana += 100; mostrarNotificacao("Prêmio: +100 Grana!", "sucesso"); } },
    { id: 2, nome: "Barão", desc: "Junte 5.000 de Grana", icone: "💰", condicao: () => grana >= 5000, recompensa: () => { grana += 500; mostrarNotificacao("Prêmio: +500 Grana!", "sucesso"); } },
    { id: 3, nome: "Colecionador Brabo", desc: "Tenha 10 cartas diferentes", icone: "🃏", condicao: () => Object.keys(inventario).length >= 10, recompensa: () => { inventarioPacotes["Novos Rostos"] = (inventarioPacotes["Novos Rostos"] || 0) + 1; salvarTudo(); mostrarNotificacao("Prêmio: +1 Pacote Novos Rostos!", "sucesso"); } },
    { id: 4, nome: "Chefe de Equipe", desc: "Tenha 5 cartas na equipe", icone: "👥", condicao: () => equipe.length >= 5, recompensa: () => mostrarNotificacao("Prêmio: Equipe completa! Moral em alta.", "info") },
    { id: 5, nome: "Abre-Pacotes", desc: `Abra 2000 cartas. (Progresso: 0/2000)`, icone: "⚡", condicao: () => (inventarioPacotes["Novos Rostos_aberto"] || 0) + (inventarioPacotes["Pacote B_aberto"] || 0) >= 2000, recompensa: () => { chancePacoteExtra = 33; salvarTudo(); mostrarNotificacao("Prêmio: BÔNUS RNG! Carta extra (33%) DESBLOQUEADA!", "sucesso"); } }
];