// script.js

// --- HELPER: FORMATADOR DE NÚMEROS (K, M, B) ---
function formatarNumero(num) {
    if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return Math.floor(num).toString();
}

window.addEventListener('DOMContentLoaded', () => {

    // --- 1. ELEMENTOS DOM ---
    const telas = {
        loja: document.getElementById('tela-loja'),
        inicio: document.getElementById('tela-inicio'),
        inventario: document.getElementById('tela-inventario'),
        album: document.getElementById('tela-album'),
        metas: document.getElementById('tela-metas')
    };
    const navBtns = document.querySelectorAll('.nav-button');
    
    const seletorZona = document.getElementById('seletor-zona');
    const btnDesbloquearZona = document.getElementById('btn-desbloquear-zona');
    const descZona = document.getElementById('desc-zona');
    const areaCompraZona = document.getElementById('area-compra-zona');
    const tituloPacotesZona = document.getElementById('titulo-pacotes-zona');
    const areaLojaDiaria = document.getElementById('area-loja-diaria');

    const areaResultado = document.getElementById('resultado');
    const areaPacotes = document.getElementById('area-pacotes');
    const areaInventario = document.getElementById('area-inventario');
    const areaAlbum = document.getElementById('area-album');
    const areaEquipe = document.getElementById('area-equipe');
    const containerNotificacoes = document.getElementById('container-notificacoes');
    // REMOVIDO: const areaEquipeHome = document.getElementById('area-equipe-home');

    const mostradorGrana = document.getElementById('valor-grana');
    const mostradorRenda = document.getElementById('valor-renda');
    const contadorEquipe = document.getElementById('contador-equipe');

    const modalPerfil = document.getElementById('modal-perfil');
    const modalCartaDetalhe = document.getElementById('modal-carta-detalhe');
    const conteudoCartaDetalhe = document.getElementById('conteudo-carta-detalhe');
    const fecharCartaDetalheBtn = document.getElementById('fechar-carta-detalhe');
    const perfilResumo = document.getElementById('perfil-resumo');
    const fecharPerfilBtn = document.getElementById('fechar-perfil');
    const editarPerfilBtn = document.getElementById('btn-editar-perfil');
    const areaMetas = document.getElementById('area-metas');

    const modalAbertura = document.getElementById('modal-abertura-pacote');
    const imgCartaAnimada = document.getElementById('img-carta-animada');
    const divCartaAnimada = document.getElementById('carta-animada');
    const infoCartaAnimada = document.getElementById('info-carta-animada');
    const nomeCartaAnimada = document.getElementById('nome-carta-animada');
    const raridadeCartaAnimada = document.getElementById('raridade-carta-animada');
    const btnProximaCarta = document.getElementById('btn-proxima-carta');
    const btnFecharAbertura = document.getElementById('btn-fechar-abertura');
    const btnAbrirOutro = document.getElementById('btn-abrir-outro');
    const tituloAbertura = document.getElementById('titulo-abertura');

    const btnLimparInventario = document.getElementById('btn-limpar-inventario');
    const btnVenderDuplicatas = document.getElementById('btn-vender-duplicatas');
    const btnToggleMercado = document.getElementById('btn-toggle-mercado');
    const containerMercado = document.getElementById('container-mercado');

    // --- 2. CONFIGURAÇÃO MATEMÁTICA ---
    const MATH_CONFIG = {
        maxNivel: 60, 
        baseRenda: { 'comum': 1, 'incomum': 3, 'raro': 8, 'épico': 40, 'lendário': 250, 'mítico': 1000, 'secreto': 5000 },
        multiplicadorRenda: { 'comum': 1.30, 'incomum': 1.32, 'raro': 1.35, 'épico': 1.40, 'lendário': 1.50, 'mítico': 1.60, 'secreto': 1.80 },
        multiplicadorZona: 2.0, 
        baseCustoMoney: { 'comum': 50, 'incomum': 120, 'raro': 250, 'épico': 1500, 'lendário': 10000, 'mítico': 50000, 'secreto': 250000 },
        multiplicadorCusto: 1.6, 
        baseCustoCartas: 1
    };

    const CONFIG = {
        tamanhoMaxEquipe: 5,
        tempoRefreshLoja: 15 * 60 * 1000
    };

    // --- FUNÇÕES DE CÁLCULO ---
    function getRendaCarta(carta) {
        const r = carta.raridade.toLowerCase();
        const base = MATH_CONFIG.baseRenda[r] || 1;
        const multRaridade = MATH_CONFIG.multiplicadorRenda[r] || 1.3;
        const fatorZona = Math.pow(MATH_CONFIG.multiplicadorZona, (carta.zona || 1) - 1);
        return base * fatorZona * Math.pow(multRaridade, carta.nivel - 1);
    }

    function getCustoUpgradeMoney(raridade, nivel) {
        const base = MATH_CONFIG.baseCustoMoney[raridade.toLowerCase()] || 50;
        return Math.floor(base * Math.pow(MATH_CONFIG.multiplicadorCusto, nivel));
    }

    function getCustoUpgradeCartas(nivel) {
        return Math.floor((nivel + 1) * MATH_CONFIG.baseCustoCartas);
    }
    
    function getPrecoVenda(raridade) {
         const base = { 'comum': 5, 'incomum': 10, 'raro': 20, 'épico': 100, 'lendário': 500, 'mítico': 2500, 'secreto': 10000 };
         return base[raridade.toLowerCase()] || 1;
    }

    // --- ESTADO DO JOGO ---
    window.estadoJogo = {
        grana: 0,
        sorte: 0,
        inventario: {},
        pacotes: {},
        equipe: [],
        upgradesComprados: [],
        zonasDesbloqueadas: [1],
        zonaAtual: 1,            
        perfil: { nome: "Visitante", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mandrake" },
        conquistas: [],
        chanceExtra: 0,
        lojaDiaria: { ofertas: [], proximoRefresh: 0 }
    };
    
    window.salvar = salvar;
    window.mostrarNotificacao = mostrarNotificacao;
    let rendaPorSegundo = 0;
    let pacoteAtualSendoAberto = null;

    // --- 3. PERSISTÊNCIA ---
    function salvar() { localStorage.setItem('rng_estado_v7', JSON.stringify(window.estadoJogo)); }
    function carregar() {
        const salvo = localStorage.getItem('rng_estado_v7');
        if (salvo) {
            try {
                const carregado = JSON.parse(salvo);
                window.estadoJogo = { ...window.estadoJogo, ...carregado };
                if (!window.estadoJogo.inventario) window.estadoJogo.inventario = {};
                if (!window.estadoJogo.pacotes) window.estadoJogo.pacotes = {};
                if (!window.estadoJogo.upgradesComprados) window.estadoJogo.upgradesComprados = [];
                if (typeof window.estadoJogo.sorte === 'undefined') window.estadoJogo.sorte = 0;
            } catch (e) { console.error("Erro save:", e); }
        }
        if (!window.estadoJogo.zonasDesbloqueadas || window.estadoJogo.zonasDesbloqueadas.length === 0) window.estadoJogo.zonasDesbloqueadas = [1];
        if (!window.estadoJogo.zonaAtual) window.estadoJogo.zonaAtual = 1;
        checarNovoJogador();
        atualizarDisplayGeral();
    }

    function checarNovoJogador() {
        const temCartas = Object.keys(window.estadoJogo.inventario).length > 0;
        if (!temCartas) {
            const cartaInicial = bancoDeCartas.find(c => c.id === 101);
            if (cartaInicial) {
                window.estadoJogo.inventario[cartaInicial.id] = { ...cartaInicial, quantidade: 1, nivel: 1 };
                window.estadoJogo.equipe.push(cartaInicial.id.toString());
                salvar();
            }
        }
    }

    function mostrarNotificacao(msg, tipo='sucesso') {
        const n = document.createElement('div');
        n.className = `notificacao ${tipo}`;
        n.innerText = msg;
        containerNotificacoes.appendChild(n);
        setTimeout(()=>n.remove(), 3000);
    }

    // --- 4. ZONAS ---
    function renderizarSeletorZonas() {
        seletorZona.innerHTML = '';
        bancoZonas.forEach(zona => {
            const bloqueada = !window.estadoJogo.zonasDesbloqueadas.includes(zona.id);
            const option = document.createElement('option');
            option.value = zona.id;
            option.text = bloqueada ? `🔒 Zona ${zona.id}: Bloqueada` : `📍 Zona ${zona.id}: ${zona.nome}`;
            seletorZona.appendChild(option);
        });
        seletorZona.value = window.estadoJogo.zonaAtual;
        atualizarInfoZona();
    }

    function atualizarInfoZona() {
        const id = parseInt(seletorZona.value);
        const zona = bancoZonas.find(z => z.id === id);
        const bloqueada = !window.estadoJogo.zonasDesbloqueadas.includes(id);
        window.estadoJogo.zonaAtual = id; 
        descZona.innerText = zona.descricao;
        tituloPacotesZona.innerText = `Pacotes de: ${zona.nome}`;
        if (bloqueada) {
            btnDesbloquearZona.style.display = 'inline-block';
            btnDesbloquearZona.textContent = `Desbloquear (${formatarNumero(zona.custoDesbloqueio)})`;
            btnDesbloquearZona.onclick = () => desbloquearZona(id);
            areaCompraZona.innerHTML = '<p style="color:#888; padding: 20px; text-align:center;">Vá ao Início e desbloqueie a zona para ver os pacotes.</p>';
        } else {
            btnDesbloquearZona.style.display = 'none';
            renderizarLojaLocal(zona);
        }
        salvar();
    }

    function desbloquearZona(id) {
        const zona = bancoZonas.find(z => z.id === id);
        if (window.estadoJogo.grana >= zona.custoDesbloqueio) {
            window.estadoJogo.grana -= zona.custoDesbloqueio;
            window.estadoJogo.zonasDesbloqueadas.push(id);
            mostrarNotificacao(`Zona "${zona.nome}" liberada!`, "sucesso");
            renderizarSeletorZonas(); 
            salvar();
            atualizarDisplayGeral();
        } else {
            mostrarNotificacao("Sem grana pro pedágio!", "erro");
        }
    }
    seletorZona.addEventListener('change', atualizarInfoZona);

    // --- 5. LOJA COM TOOLTIP ---
    function renderizarLojaLocal(zona) {
        areaCompraZona.innerHTML = '';
        zona.pacotes.forEach(pacote => {
            const container = document.createElement('div');
            container.className = 'pacote-container';

            const btn = document.createElement('button');
            btn.className = 'botao-pacote';
            btn.dataset.custo = pacote.custo; 
            btn.innerHTML = `${pacote.nome}<br><small>$${formatarNumero(pacote.custo)}</small>`;
            
            if (window.estadoJogo.grana < pacote.custo) btn.disabled = true;
            
            btn.onclick = () => comprarPacote(pacote.nome, pacote.id_interno, pacote.custo);
            btn.style.margin = "0";
            btn.style.minWidth = "120px";

            // TOOLTIP
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip-info';
            
            const htmlCartas = gerarHtmlTooltipCartas(pacote.id_interno);
            
            tooltip.innerHTML = `
                <div class="tooltip-titulo">Conteúdo</div>
                <div class="tooltip-grid">${htmlCartas}</div>
                <div style="margin-top:5px; color:#fca311; text-align:center; font-size:0.7rem;">
                    Secreto: ???% <br> Sorte Atual: +${window.estadoJogo.sorte}
                </div>
            `;

            container.appendChild(btn);
            container.appendChild(tooltip);
            areaCompraZona.appendChild(container);
        });
        atualizarBotoesLoja();
    }

    // FUNÇÃO ATUALIZADA: GERA TOOLTIP COM CHECK DE BLOQUEIO
    function gerarHtmlTooltipCartas(idPacote) {
        const taxas = bancoTaxasDrop[idPacote] || bancoTaxasDrop["Padrao"];
        let html = '';
        
        const raridades = ['Comum', 'Incomum', 'Raro', 'Épico', 'Lendário', 'Mítico'];
        
        raridades.forEach(raridade => {
            const cartasPossiveis = bancoDeCartas.filter(c => c.pacote === idPacote && c.raridade === raridade);
            const chanceTotalRaridade = taxas[raridade] || 0;
            
            if (cartasPossiveis.length > 0 && chanceTotalRaridade > 0) {
                const chanceIndividual = chanceTotalRaridade / cartasPossiveis.length;
                
                cartasPossiveis.forEach(c => {
                    // VERIFICA SE TEM A CARTA PRA APLICAR O CINZA
                    const isLocked = !window.estadoJogo.inventario[c.id];
                    const classeLocked = isLocked ? 'locked' : '';

                    html += `
                        <div class="tooltip-card-box ${classeLocked} borda-${raridade.toLowerCase()}" title="${c.nome}">
                            <img src="${c.imagem}" class="tooltip-card-img">
                            <span class="tooltip-card-chance">${chanceIndividual.toFixed(1)}%</span>
                        </div>`;
                });
            }
        });
        return html;
    }

    function atualizarBotoesLoja() {
        const botoes = document.querySelectorAll('.botao-pacote');
        botoes.forEach(btn => {
            const custo = parseInt(btn.dataset.custo);
            if (!isNaN(custo)) {
                btn.disabled = window.estadoJogo.grana < custo;
            }
        });
    }

    function comprarPacote(nomePacote, idInterno, custo) {
        if (window.estadoJogo.grana >= custo) {
            window.estadoJogo.grana -= custo;
            const chave = `${nomePacote}|${idInterno}`;
            window.estadoJogo.pacotes[chave] = (window.estadoJogo.pacotes[chave] || 0) + 1;
            mostrarNotificacao(`+1 ${nomePacote}`, "sucesso");
            salvar();
            atualizarDisplayGeral();
        } else {
            mostrarNotificacao("Dinheiro insuficiente.", "erro");
        }
    }

    function renderizarUpgrades() {
        const area = document.getElementById('area-upgrades');
        if(!area) return;
        area.innerHTML = '';
        bancoUpgrades.forEach(item => {
            const comprado = window.estadoJogo.upgradesComprados.includes(item.id);
            const div = document.createElement('div');
            div.style = "background: #2a2d35; border: 1px solid #fca311; border-radius: 8px; padding: 15px; width: 140px; display: flex; flex-direction: column; align-items: center; gap: 5px;";
            if(comprado) div.style.opacity = "0.5";
            div.innerHTML = `
                <div style="font-size: 2rem;">${item.icone}</div>
                <strong style="font-size: 0.9rem; color: #fff;">${item.nome}</strong>
                <p style="font-size: 0.7rem; color: #ccc; line-height: 1.2;">${item.desc}</p>
                <button class="botao-acao" style="width: 100%; margin-top: auto; background: ${comprado ? '#555' : '#2a9d8f'}" 
                    onclick="comprarUpgrade('${item.id}')" ${comprado ? 'disabled' : ''}>
                    ${comprado ? 'Comprado' : '$ ' + formatarNumero(item.custo)}
                </button>
            `;
            area.appendChild(div);
        });
    }

    window.comprarUpgrade = function(id) {
        const item = bancoUpgrades.find(u => u.id === id);
        if(window.estadoJogo.grana >= item.custo) {
            window.estadoJogo.grana -= item.custo;
            window.estadoJogo.upgradesComprados.push(id);
            
            if(item.efeito === 'sorte_add') window.estadoJogo.sorte += item.valor;
            if(item.efeito === 'chance_extra') window.estadoJogo.chanceExtra += item.valor;

            salvar();
            atualizarDisplayGeral();
            mostrarNotificacao(`${item.nome} adquirido!`, "sucesso");
        } else {
            mostrarNotificacao("Sem verba, chefe!", "erro");
        }
    };

    // --- 6. ABERTURA DE PACOTES ---
    let animando = false;
    function abrirPacote(chavePacote) {
        if (animando) return;
        if (!window.estadoJogo.pacotes[chavePacote] || window.estadoJogo.pacotes[chavePacote] <= 0) {
            mostrarNotificacao("Você não tem esse pacote.", "erro");
            return;
        }

        const [nomePacote, idInterno] = chavePacote.split('|');
        pacoteAtualSendoAberto = idInterno;
        
        animando = true;
        window.estadoJogo.pacotes[chavePacote]--;
        window.estadoJogo.pacotes[`${idInterno}_aberto`] = (window.estadoJogo.pacotes[`${idInterno}_aberto`] || 0) + 1;
        salvar();
        atualizarDisplayPacotes();
        
        let qtd = 1; 
        const cartasSorteadas = [];
        for(let i=0; i<qtd; i++) cartasSorteadas.push(sortearCarta(idInterno));
        
        if (window.estadoJogo.chanceExtra > 0 && Math.random() * 100 < window.estadoJogo.chanceExtra) {
            cartasSorteadas.push(sortearCarta(idInterno));
            mostrarNotificacao("Bônus! +1 Carta", "info");
        }

        cartasSorteadas.forEach(c => {
            if (window.estadoJogo.inventario[c.id]) window.estadoJogo.inventario[c.id].quantidade++;
            else window.estadoJogo.inventario[c.id] = { ...c, quantidade: 1, nivel: 1 };

            if (c.raridade === 'Secreto') {
                const zonaDaCarta = c.zona || 1;
                const proximaZona = zonaDaCarta + 1;
                const zonaExiste = bancoZonas.find(z => z.id === proximaZona);
                const jaDesbloqueada = window.estadoJogo.zonasDesbloqueadas.includes(proximaZona);
                
                if (zonaExiste && !jaDesbloqueada) {
                    window.estadoJogo.zonasDesbloqueadas.push(proximaZona);
                    mostrarNotificacao(`💎 SORTE GRANDE! Zona ${proximaZona} liberada de graça!`, "sucesso");
                    salvar();
                }
            }
        });

        salvar();
        atualizarRenda();
        iniciarCinematica(cartasSorteadas);
        atualizarDisplayInventario();
    }

    let filaCartasParaAbrir = [];
    function iniciarCinematica(cartas) {
        filaCartasParaAbrir = cartas;
        modalAbertura.classList.remove('tela-escondida');
        btnAbrirOutro.classList.add('tela-escondida');
        btnFecharAbertura.classList.add('tela-escondida');
        mostrarProximaCartaDaFila();
    }

    function mostrarProximaCartaDaFila() {
        if (filaCartasParaAbrir.length === 0) return;
        const cartaAtual = filaCartasParaAbrir[0];
        
        divCartaAnimada.className = 'carta-gigante animacao-roleta'; 
        divCartaAnimada.style.borderColor = '#555';
        infoCartaAnimada.classList.add('tela-escondida');
        btnProximaCarta.classList.add('tela-escondida');
        
        const cartasParaAnimacao = bancoDeCartas.filter(c => c.pacote === pacoteAtualSendoAberto && c.raridade !== "Secreto");
        const poolFinal = cartasParaAnimacao.length > 0 ? cartasParaAnimacao : bancoDeCartas;
        
        let loops = 0;
        const intervalo = setInterval(() => {
            const randomCard = poolFinal[Math.floor(Math.random() * poolFinal.length)];
            imgCartaAnimada.src = randomCard.imagem;
            loops++;
            if (loops >= 15) {
                clearInterval(intervalo);
                revelarCartaReal(cartaAtual);
            }
        }, 80);
    }

    function revelarCartaReal(carta) {
        divCartaAnimada.classList.remove('animacao-roleta');
        divCartaAnimada.classList.add('revelada');
        divCartaAnimada.classList.add(`revelada-${carta.raridade.toLowerCase()}`);

        imgCartaAnimada.src = carta.imagem;
        nomeCartaAnimada.innerText = carta.nome;
        raridadeCartaAnimada.innerText = carta.raridade;
        raridadeCartaAnimada.className = carta.raridade.toLowerCase(); 

        renderizarCartaResultado(carta, 0, filaCartasParaAbrir.length === 1);

        setTimeout(() => {
            infoCartaAnimada.classList.remove('tela-escondida');
            filaCartasParaAbrir.shift();

            if (filaCartasParaAbrir.length > 0) {
                btnProximaCarta.classList.remove('tela-escondida');
                tituloAbertura.innerText = "Próxima Carta...";
            } else {
                tituloAbertura.innerText = "Pacote Finalizado!";
                btnFecharAbertura.classList.remove('tela-escondida');
                animando = false;
            }
        }, 500);
    }

    btnProximaCarta.onclick = () => mostrarProximaCartaDaFila();
    
    btnFecharAbertura.onclick = () => { 
        modalAbertura.classList.add('tela-escondida'); 
        document.getElementById('area-compra-zona').innerHTML = '';
        mostrarTela('inicio'); 
        atualizarDisplayGeral(); 
    };

    function sortearCarta(idPacote) {
        const raridade = rolarRaridade(idPacote);
        const pool = bancoDeCartas.filter(c => c.pacote === idPacote && c.raridade === raridade);
        if (pool.length === 0) {
            const poolComum = bancoDeCartas.filter(c => c.pacote === idPacote && c.raridade === "Comum");
            if(poolComum.length === 0) return bancoDeCartas[0]; 
            return {...poolComum[Math.floor(Math.random() * poolComum.length)]};
        }
        return {...pool[Math.floor(Math.random() * pool.length)]};
    }

    function rolarRaridade(idPacote) {
        const taxas = bancoTaxasDrop[idPacote] || bancoTaxasDrop["Padrao"];
        const sorte = window.estadoJogo.sorte || 0;
        const r = Math.random() * 100;
        let acumulado = 0;
        
        acumulado += taxas["Comum"];
        if (r <= acumulado) {
            if (Math.random() * 100 < sorte) return "Incomum"; 
            return "Comum";
        }
        
        acumulado += taxas["Incomum"] || 0;
        if (r <= acumulado) {
            if (Math.random() * 100 < (sorte * 0.8)) return "Raro";
            return "Incomum";
        }

        acumulado += taxas["Raro"];
        if (r <= acumulado) {
            if (Math.random() * 100 < (sorte * 0.5)) return "Épico";
            return "Raro";
        }
        
        acumulado += taxas["Épico"];
        if (r <= acumulado) return "Épico";
        acumulado += taxas["Lendário"];
        if (r <= acumulado) return "Lendário";
        acumulado += taxas["Mítico"];
        if (r <= acumulado) return "Mítico";
        return "Secreto";
    }

    function renderizarCartaResultado(c, delay, clean) {
        if (clean) while (areaResultado.children.length > 1) areaResultado.removeChild(areaResultado.firstChild);
        const div = document.createElement('div');
        div.className = `carta ${c.raridade.toLowerCase()}`;
        const tag = c.set === "Mercado Negro" ? '<span class="tag-exclusiva">⭐ Exclusiva</span>' : '';
        div.innerHTML = `${tag}<img src="${c.imagem}" class="imagem-carta"><div class="area-info-gradiente"><span class="nome-carta-gradiente">${c.nome}</span><span class="raridade-carta-gradiente">[${c.raridade}]</span></div>`;
        areaResultado.appendChild(div);
    }

    // --- UI UPDATES ---
    function atualizarDisplayGeral() {
        mostradorGrana.innerText = formatarNumero(window.estadoJogo.grana);
        atualizarRenda();
        atualizarDisplayPacotes();
        renderizarUpgrades();
        
        const zonaAtualObj = bancoZonas.find(z => z.id === window.estadoJogo.zonaAtual);
        if (zonaAtualObj && window.estadoJogo.zonasDesbloqueadas.includes(window.estadoJogo.zonaAtual)) {
            if(areaCompraZona.children.length === 0) renderizarLojaLocal(zonaAtualObj);
            else atualizarBotoesLoja();
        }

        document.getElementById('nome-jogador').innerText = window.estadoJogo.perfil.nome;
        document.getElementById('img-avatar-mini').src = window.estadoJogo.perfil.avatar;
        atualizarDisplayEquipe();
    }
    
    function atualizarRenda() {
        let total = 0;
        window.estadoJogo.equipe.forEach(id => {
            const c = window.estadoJogo.inventario[id];
            if(c) total += getRendaCarta(c);
        });

        const temCorrente = window.estadoJogo.upgradesComprados.includes('upg_renda_1');
        if (temCorrente) total = total * 1.10;

        mostradorRenda.textContent = formatarNumero(total);
        rendaPorSegundo = total;
    }

    function atualizarDisplayPacotes() {
        areaPacotes.innerHTML = '';
        let temPacote = false;
        for (const [chave, qtd] of Object.entries(window.estadoJogo.pacotes)) {
            if (qtd > 0 && !chave.includes('_aberto')) {
                temPacote = true;
                const [nomePacote, idInterno] = chave.split('|');
                const btn = document.createElement('button');
                btn.className = 'botao-abrir-pacote';
                btn.innerHTML = `Abrir ${nomePacote} <span>(x${qtd})</span>`;
                btn.onclick = () => abrirPacote(chave);
                areaPacotes.appendChild(btn);
            }
        }
        if(!temPacote) areaPacotes.innerHTML = '<p style="color:#555; font-size:0.8rem">Nenhum pacote no inventário.</p>';
    }
    
    function atualizarDisplayEquipe() {
        areaEquipe.innerHTML = '';
        contadorEquipe.innerText = `(${window.estadoJogo.equipe.length}/${CONFIG.tamanhoMaxEquipe})`;
        for(let i=0; i<CONFIG.tamanhoMaxEquipe; i++) {
            const id = window.estadoJogo.equipe[i];
            if(id && window.estadoJogo.inventario[id]) {
                const c = window.estadoJogo.inventario[id];
                const div = document.createElement('div');
                div.className = `carta ${c.raridade.toLowerCase()} inventario`;
                div.innerHTML = `<img src="${c.imagem}" class="imagem-carta"><div class="area-info-gradiente"><span class="nome-carta-gradiente">${c.nome}</span></div>`;
                div.onclick = () => remover(c.id);
                areaEquipe.appendChild(div);
            } else {
                areaEquipe.innerHTML += `<div class="slot-vazio">Vazio</div>`;
            }
        }
    }

    function atualizarDisplayInventario() {
        areaInventario.innerHTML = '';
        const lista = Object.values(window.estadoJogo.inventario).sort((a,b) => a.id - b.id);
        if(lista.length === 0) { areaInventario.innerHTML = '<p style="color:#888">Inventário vazio</p>'; return; }
        lista.forEach(c => {
            const div = document.createElement('div');
            div.className = `carta ${c.raridade.toLowerCase()} inventario`;
            const isMax = c.nivel >= MATH_CONFIG.maxNivel;
            const custoCartas = getCustoUpgradeCartas(c.nivel);
            const custoMoney = getCustoUpgradeMoney(c.raridade, c.nivel);
            const podeUpar = !isMax && c.quantidade > custoCartas && window.estadoJogo.grana >= custoMoney;
            const estaEquipada = window.estadoJogo.equipe.includes(c.id.toString());
            div.innerHTML = `
                <img src="${c.imagem}" class="imagem-carta">
                <span class="nivel-carta">Nvl. ${c.nivel}</span>
                <span class="quantidade-carta">x${c.quantidade}</span>
                <div class="area-info-gradiente">
                    <span class="nome-carta-gradiente">${c.nome}</span>
                    <span class="raridade-carta-gradiente">[${c.raridade}]</span>
                    ${!estaEquipada ? 
                        `<button class="btn-equipar" onclick="equipar(${c.id})">Equipar</button>` : 
                        `<button class="btn-equipar btn-remover" onclick="remover(${c.id})">Remover</button>`}
                    ${isMax 
                        ? `<button class="btn-upar" disabled style="background:#444; color:#888;">MAX (Lvl 60)</button>` 
                        : `<button class="btn-upar" ${podeUpar?'':'disabled'} onclick="upar(${c.id})">Upar ($${formatarNumero(custoMoney)} + ${custoCartas}📦)</button>`
                    }
                </div>`;
            div.onclick = (e) => { if(e.target === div || e.target.classList.contains('imagem-carta')) abrirDetalheCarta(c.id); };
            areaInventario.appendChild(div);
        });
    }

    window.equipar = function(id) {
        if(window.estadoJogo.equipe.length >= CONFIG.tamanhoMaxEquipe) return mostrarNotificacao("Equipe cheia!", "erro");
        if(!window.estadoJogo.equipe.includes(id.toString())) {
            window.estadoJogo.equipe.push(id.toString());
            salvar(); atualizarRenda(); atualizarDisplayGeral(); atualizarDisplayInventario();
            mostrarNotificacao("Equipado!", "sucesso");
        }
    };
    window.remover = function(id) {
        window.estadoJogo.equipe = window.estadoJogo.equipe.filter(e => e !== id.toString());
        salvar(); atualizarRenda(); atualizarDisplayGeral(); atualizarDisplayInventario();
    };
    
    window.upar = function(id) {
        const c = window.estadoJogo.inventario[id];
        if (c.nivel >= MATH_CONFIG.maxNivel) {
            return mostrarNotificacao("Nível Máximo (60) atingido!", "info");
        }
        const custoCartas = getCustoUpgradeCartas(c.nivel);
        const custoMoney = getCustoUpgradeMoney(c.raridade, c.nivel);
        if(c.quantidade > custoCartas && window.estadoJogo.grana >= custoMoney) {
            c.quantidade -= custoCartas;
            window.estadoJogo.grana -= custoMoney;
            c.nivel++;
            salvar(); 
            atualizarRenda(); 
            atualizarDisplayGeral(); 
            atualizarDisplayInventario();
            mostrarNotificacao(`Level Up! ${c.nivel}/${MATH_CONFIG.maxNivel}`, "sucesso");
        } else {
            if(window.estadoJogo.grana < custoMoney) mostrarNotificacao(`Grana insuficiente! (${formatarNumero(custoMoney)})`, "erro");
            else mostrarNotificacao(`Cartas insuficientes! (+${custoCartas})`, "erro");
        }
    };

    btnVenderDuplicatas.addEventListener('click', () => {
        let totalGrana = 0, totalCartas = 0;
        for (const id in window.estadoJogo.inventario) {
            const c = window.estadoJogo.inventario[id];
            const custo = getCustoUpgradeCartas(c.nivel);
            const max = c.nivel >= MATH_CONFIG.maxNivel;
            let excesso = 0;
            if (c.quantidade > 1) {
                if (max) excesso = c.quantidade - 1;
                else if (c.quantidade > custo) excesso = c.quantidade - (custo + 1);
            }
            if (excesso > 0) {
                const preco = getPrecoVenda(c.raridade);
                totalGrana += preco * excesso;
                totalCartas += excesso;
                window.estadoJogo.inventario[id].quantidade -= excesso;
            }
        }
        if (totalCartas > 0) {
            window.estadoJogo.grana += totalGrana;
            salvar(); atualizarDisplayGeral(); atualizarDisplayInventario();
            mostrarNotificacao(`Vendeu ${totalCartas} cartas por $${formatarNumero(totalGrana)}!`, "sucesso");
        } else {
            mostrarNotificacao("Nada para vender.", "info");
        }
    });

    btnLimparInventario.onclick = () => {
        if(confirm("ATENÇÃO: ISSO APAGA TUDO!")) { localStorage.removeItem('rng_estado_v7'); location.reload(); }
    };

    if (btnToggleMercado && containerMercado) {
        btnToggleMercado.addEventListener('click', () => containerMercado.classList.toggle('fechado'));
    }

    function carregarLojaDiaria() {
        const agora = Date.now();
        if (!window.estadoJogo.lojaDiaria.proximoRefresh || agora >= window.estadoJogo.lojaDiaria.proximoRefresh) {
            gerarNovaLojaDiaria();
        } else {
            renderizarMercadoNegro();
        }
        setInterval(() => {
             const restante = window.estadoJogo.lojaDiaria.proximoRefresh - Date.now();
             if(restante <= 0) gerarNovaLojaDiaria();
             else {
                 const m = Math.floor(restante/60000);
                 const s = Math.floor((restante%60000)/1000);
                 const el = document.getElementById('tempo-restante-loja');
                 if(el) el.innerText = `${m}:${s<10?'0'+s:s}`;
             }
        }, 1000);
    }

    function gerarNovaLojaDiaria() {
        window.estadoJogo.lojaDiaria.ofertas = [];
        window.estadoJogo.lojaDiaria.proximoRefresh = Date.now() + CONFIG.tempoRefreshLoja;
        
        const maxZonaJogador = Math.max(...window.estadoJogo.zonasDesbloqueadas);

        for(let i=0; i<6; i++) {
            let card;
            const poolValida = bancoDeCartas.filter(c => {
                if ((c.zona || 1) > maxZonaJogador) return false;
                if (c.raridade === 'Secreto') return c.set === 'Mercado Negro';
                return true; 
            });

            if (poolValida.length === 0) {
                card = bancoDeCartas[0];
            } else {
                if(Math.random() < 0.3) {
                     const poolMN = poolValida.filter(c => c.set === 'Mercado Negro');
                     if (poolMN.length > 0) {
                         card = poolMN[Math.floor(Math.random() * poolMN.length)];
                     } else {
                         card = poolValida[Math.floor(Math.random() * poolValida.length)];
                     }
                } else {
                     const poolGeral = poolValida.filter(c => c.set !== 'Mercado Negro');
                     if (poolGeral.length > 0) {
                        card = poolGeral[Math.floor(Math.random() * poolGeral.length)];
                     } else {
                        card = poolValida[Math.floor(Math.random() * poolValida.length)];
                     }
                }
            }

            if(!card) card = bancoDeCartas[0];
            window.estadoJogo.lojaDiaria.ofertas.push({ id: card.id, comprado: false });
        }
        salvar();
        renderizarMercadoNegro();
        mostrarNotificacao("Mercado Negro renovado!", "info");
    }

    function renderizarMercadoNegro() {
        areaLojaDiaria.innerHTML = '';
        window.estadoJogo.lojaDiaria.ofertas.forEach((oferta, idx) => {
            const c = obterCartaPorId(oferta.id);
            if(!c) return;
            const div = document.createElement('div');
            div.className = 'item-loja';
            div.style.opacity = oferta.comprado ? 0.5 : 1;
            const tag = c.set === "Mercado Negro" ? '<span class="tag-exclusiva">⭐ Exclusiva</span>' : '';
            
            const baseMercado = { 'comum': 500, 'incomum': 1200, 'raro': 2500, 'épico': 10000, 'lendário': 100000, 'mítico': 1000000, 'secreto': 5000000 };
            const precoBase = baseMercado[c.raridade.toLowerCase()] || 999999;
            const fatorZona = Math.pow(MATH_CONFIG.multiplicadorZona, (c.zona || 1) - 1);
            const precoFinal = Math.floor(precoBase * fatorZona);

            div.innerHTML = `
                <div class="carta ${c.raridade.toLowerCase()}" style="transform:scale(0.8); margin-bottom:-30px">
                    ${tag}
                    <img src="${c.imagem}" class="imagem-carta">
                    <div class="area-info-gradiente">
                        <span class="nome-carta-gradiente">${c.nome}</span>
                        <span class="raridade-carta-gradiente">[${c.raridade}]</span>
                        <span style="font-size: 0.7rem; color: #aaa; display:block;">Zona ${c.zona || 1}</span>
                    </div>
                </div>
                <div style="text-align:center; width:100%">
                     <span class="preco-carta">💰 ${formatarNumero(precoFinal)}</span>
                     <button class="btn-comprar-carta" onclick="comprarMercado(${idx}, ${precoFinal})" ${oferta.comprado ? 'disabled' : ''}>${oferta.comprado ? 'Esgotado' : 'Comprar'}</button>
                </div>`;
            areaLojaDiaria.appendChild(div);
        });
    }

    window.comprarMercado = function(idx, preco) {
        const oferta = window.estadoJogo.lojaDiaria.ofertas[idx];
        if(window.estadoJogo.grana >= preco && !oferta.comprado) { 
            window.estadoJogo.grana -= preco;
            oferta.comprado = true;
            const c = obterCartaPorId(oferta.id);
            if(window.estadoJogo.inventario[c.id]) window.estadoJogo.inventario[c.id].quantidade++;
            else window.estadoJogo.inventario[c.id] = { ...c, quantidade: 1, nivel: 1 };
            document.getElementById('area-compra-zona').innerHTML = '';
            salvar(); renderizarMercadoNegro(); atualizarDisplayGeral(); mostrarNotificacao("Comprado!", "sucesso");
        } else if (window.estadoJogo.grana < preco) {
            mostrarNotificacao("Sem grana!", "erro");
        }
    }

    // FILTRO DO ÁLBUM
    let filtroRaridadeAtual = 'Todos';
    window.mudarFiltroAlbum = function(raridade) {
        filtroRaridadeAtual = raridade;
        document.querySelectorAll('.btn-filtro').forEach(btn => {
            btn.classList.remove('active');
            if (btn.innerText === raridade || (raridade === 'Todos' && btn.innerText === 'Todos')) {
                btn.classList.add('active');
            }
        });
        atualizarDisplayAlbum();
    };

    function atualizarDisplayAlbum() {
        const areaAlbum = document.getElementById('area-album');
        areaAlbum.innerHTML = ''; 
        const setsUnicos = [...new Set(bancoDeCartas.map(c => c.set))];
        let achouAlgumaCarta = false;

        setsUnicos.forEach(nomeSet => {
            const cartasDoSet = bancoDeCartas.filter(c => 
                c.set === nomeSet && 
                (filtroRaridadeAtual === 'Todos' || c.raridade === filtroRaridadeAtual)
            );

            if (cartasDoSet.length > 0) {
                achouAlgumaCarta = true;
                const titulo = document.createElement('h3');
                titulo.className = 'titulo-set';
                titulo.innerText = `📦 ${nomeSet}`;
                areaAlbum.appendChild(titulo);

                const containerSet = document.createElement('div');
                containerSet.className = 'grid-album-set';

                cartasDoSet.forEach(carta => {
                    const itemNoInventario = window.estadoJogo.inventario[carta.id];
                    const div = document.createElement('div');
                    div.className = 'carta'; 
                    
                    if (itemNoInventario) {
                        div.classList.add(carta.raridade.toLowerCase());
                        const tag = carta.set === "Mercado Negro" ? '<span class="tag-exclusiva">⭐ Exclusiva</span>' : '';
                        div.innerHTML = `${tag}<img src="${carta.imagem}" class="imagem-carta"><span class="nivel-carta">Nvl. ${itemNoInventario.nivel}</span><div class="area-info-gradiente"><span class="nome-carta-gradiente">${carta.nome}</span><span class="raridade-carta-gradiente">[${carta.raridade}]</span></div>`;
                        div.onclick = () => abrirDetalheCarta(carta.id);
                    } else {
                        div.classList.add('escondida');
                        div.innerHTML = `<img src="${carta.imagem}" class="imagem-carta"><div class="area-info-gradiente"><span class="nome-carta-gradiente">??????</span><span class="raridade-carta-gradiente">[${carta.raridade}]</span></div>`;
                    }
                    containerSet.appendChild(div);
                });
                areaAlbum.appendChild(containerSet);
            }
        });

        if (!achouAlgumaCarta) {
            areaAlbum.innerHTML = '<p style="color:#777; padding:30px;">Nenhuma carta encontrada com esse filtro.</p>';
        }
    }

    function renderizarMetas() {
        areaMetas.innerHTML = '';
        bancoConquistas.forEach(cq => {
            const feita = window.estadoJogo.conquistas.includes(cq.id);
            const div = document.createElement('div');
            div.className = `meta-card ${feita ? 'desbloqueada' : ''}`;
            div.innerHTML = `
                <div class="meta-icone-container">${feita ? cq.icone : '🔒'}</div>
                <div class="meta-info"><span class="meta-titulo">${cq.nome}</span><span class="meta-desc">${cq.desc}</span></div>
                <div class="meta-recompensa"><span class="meta-status-tag ${feita?'tag-concluida':'tag-pendente'}">${feita?'FEITO':'PENDENTE'}</span></div>
            `;
            areaMetas.appendChild(div);
        });
    }
    
    function abrirDetalheCarta(id) {
        const c = obterCartaPorId(id);
        if(!c) return;
        const i = window.estadoJogo.inventario[id];
        const status = i ? `Em posse (x${i.quantidade})` : 'Não obtida';
        conteudoCartaDetalhe.innerHTML = `<img id="detalhe-imagem" class="${c.raridade.toLowerCase()}" src="${c.imagem}"><h2 id="detalhe-nome">${c.nome}</h2><span id="detalhe-raridade" class="${c.raridade.toLowerCase()}">${c.raridade} - ${status}</span><p id="detalhe-descricao">${c.descricao}</p><p id="detalhe-artista">Art: ${c.artista}</p>`;
        modalCartaDetalhe.classList.remove('tela-escondida');
    }
    fecharCartaDetalheBtn.onclick = () => modalCartaDetalhe.classList.add('tela-escondida');

    perfilResumo.onclick = () => {
        modalPerfil.classList.remove('tela-escondida');
        document.getElementById('img-avatar-grande').src = window.estadoJogo.perfil.avatar;
        document.getElementById('nome-jogador-modal').innerText = window.estadoJogo.perfil.nome;
        document.getElementById('conquistas-modal').innerText = window.estadoJogo.conquistas.length;
    };
    fecharPerfilBtn.onclick = () => modalPerfil.classList.add('tela-escondida');
    
    editarPerfilBtn.onclick = () => {
        const nome = prompt("Novo Nome:", window.estadoJogo.perfil.nome);
        if(nome) {
            window.estadoJogo.perfil.nome = nome;
            window.estadoJogo.perfil.avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${nome}`;
            salvar(); atualizarDisplayGeral();
        }
    };

    function mostrarTela(nome) {
        Object.values(telas).forEach(t => { t.classList.add('tela-escondida'); t.classList.remove('tela-ativa'); });
        telas[nome].classList.remove('tela-escondida');
        telas[nome].classList.add('tela-ativa');
        navBtns.forEach(b => b.classList.remove('active'));
        document.getElementById('nav-'+nome).classList.add('active');
        window.scrollTo(0, 0);
    }

    document.getElementById('nav-loja').onclick = () => {
        document.getElementById('area-compra-zona').innerHTML = '';
        mostrarTela('loja');
        atualizarDisplayGeral();
    };
    document.getElementById('nav-inicio').onclick = () => mostrarTela('inicio');
    document.getElementById('nav-inventario').onclick = () => mostrarTela('inventario');
    document.getElementById('nav-album').onclick = () => { mostrarTela('album'); atualizarDisplayAlbum(); };
    document.getElementById('nav-metas').onclick = () => { mostrarTela('metas'); renderizarMetas(); };

    setInterval(() => {
        if(rendaPorSegundo > 0) {
            window.estadoJogo.grana += rendaPorSegundo;
            salvar();
            mostradorGrana.innerText = formatarNumero(window.estadoJogo.grana);
            if(!telas.loja.classList.contains('tela-escondida')) atualizarBotoesLoja();
        }
        bancoConquistas.forEach(cq => {
            if(!window.estadoJogo.conquistas.includes(cq.id) && cq.condicao()) {
                window.estadoJogo.conquistas.push(cq.id);
                cq.recompensa();
            }
        });
    }, 1000);

    carregar();
    renderizarSeletorZonas();
    carregarLojaDiaria();
    mostrarTela('inicio');
});