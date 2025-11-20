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
    const areaEquipeHome = document.getElementById('area-equipe-home');

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

    const autoAbrirBtn = document.getElementById('auto-abrir-pacote');
    const stopAutoAbrirBtn = document.getElementById('stop-auto-abrir');
    const qtdAutoAbrirSelect = document.getElementById('quantidade-auto-abrir');

    // --- 2. CONFIG ---
    const CONFIG = {
        custoNormal: 100,
        custoDesconto: 35,
        tempoRefreshLoja: 15 * 60 * 1000,
        tamanhoMaxEquipe: 5
    };
    const CUSTOS_UPGRADE = { 1: 2, 2: 4, 3: 8, 4: 10 };
    const NIVEL_MAXIMO = 5;
    const PRECOS_VENDA = { 'comum': 1, 'raro': 5, 'épico': 20, 'lendário': 50, 'mítico': 100, 'secreto': 250 };
    const PRECOS_LOJA = { 'comum': 500, 'raro': 2500, 'épico': 10000, 'lendário': 75000, 'mítico': 500000, 'secreto': 2000000 };
    const RENDAS_BASE = { 'comum': 1, 'raro': 5, 'épico': 15, 'lendário': 50, 'mítico': 150, 'secreto': 500 };

    window.estadoJogo = {
        grana: 0,
        inventario: {},
        pacotes: {},
        equipe: [],
        primeiraCompra: true,
        nivelPacote: 1,
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
    let autoAbrirInterval = null;
    let pacoteAtualSendoAberto = null;

    // --- 3. PERSISTÊNCIA ---
    function salvar() { localStorage.setItem('rng_estado_v2', JSON.stringify(window.estadoJogo)); }
    function carregar() {
        const salvo = localStorage.getItem('rng_estado_v2');
        if (salvo) {
            try {
                const carregado = JSON.parse(salvo);
                window.estadoJogo = { ...window.estadoJogo, ...carregado };
                if (!window.estadoJogo.inventario) window.estadoJogo.inventario = {};
                if (!window.estadoJogo.pacotes) window.estadoJogo.pacotes = {};
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
            btnDesbloquearZona.textContent = `Desbloquear ($${zona.custoDesbloqueio})`;
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

    // --- 5. LOJA ---
    function renderizarLojaLocal(zona) {
        areaCompraZona.innerHTML = '';
        const btn = document.createElement('button');
        btn.className = 'botao-pacote';
        const custo = window.estadoJogo.primeiraCompra ? CONFIG.custoDesconto : CONFIG.custoNormal;
        const textoPreco = window.estadoJogo.primeiraCompra ? `Promoção (${custo})` : `Comprar (${custo})`;
        btn.innerHTML = `Comprar [${zona.pacoteFoco}] <br><small>${textoPreco}</small>`;
        if (window.estadoJogo.grana < custo) btn.disabled = true;
        btn.onclick = () => comprarPacote(zona.pacoteFoco);
        areaCompraZona.appendChild(btn);
    }

    function comprarPacote(nomeSet) {
        const custo = window.estadoJogo.primeiraCompra ? CONFIG.custoDesconto : CONFIG.custoNormal;
        if (window.estadoJogo.grana >= custo) {
            window.estadoJogo.grana -= custo;
            if (window.estadoJogo.primeiraCompra) window.estadoJogo.primeiraCompra = false;
            window.estadoJogo.pacotes[nomeSet] = (window.estadoJogo.pacotes[nomeSet] || 0) + 1;
            mostrarNotificacao(`+1 Pacote ${nomeSet}`, "sucesso");
            salvar();
            atualizarDisplayGeral();
        } else {
            mostrarNotificacao("Dinheiro insuficiente.", "erro");
        }
    }

    // --- 6. ABERTURA DE PACOTES ---
    let animando = false;
    function abrirPacote(nomeSet, isAuto = false) {
        if (!isAuto && animando) return;
        if (!window.estadoJogo.pacotes[nomeSet] || window.estadoJogo.pacotes[nomeSet] <= 0) {
            if (isAuto) pararAutoAbrir("Estoque vazio.");
            else mostrarNotificacao("Você não tem esse pacote.", "erro");
            return;
        }

        pacoteAtualSendoAberto = nomeSet;
        
        animando = !isAuto;
        window.estadoJogo.pacotes[nomeSet]--;
        window.estadoJogo.pacotes[`${nomeSet}_aberto`] = (window.estadoJogo.pacotes[`${nomeSet}_aberto`] || 0) + 1;
        salvar();
        if(!isAuto) atualizarDisplayPacotes();
        
        let qtd = window.estadoJogo.nivelPacote >= 2 ? (window.estadoJogo.nivelPacote >= 3 ? 5 : 3) : 1;
        const cartasSorteadas = [];
        for(let i=0; i<qtd; i++) cartasSorteadas.push(sortearCarta(nomeSet));
        
        if (window.estadoJogo.chanceExtra > 0 && Math.random() * 100 < window.estadoJogo.chanceExtra) {
            cartasSorteadas.push(sortearCarta(nomeSet));
            if(!isAuto) mostrarNotificacao("Bônus! +1 Carta", "info");
        }

        cartasSorteadas.forEach(c => {
            if (window.estadoJogo.inventario[c.id]) window.estadoJogo.inventario[c.id].quantidade++;
            else window.estadoJogo.inventario[c.id] = { ...c, quantidade: 1, nivel: 1 };
        });

        salvar();
        atualizarRenda();

        if (isAuto) {
            const melhor = cartasSorteadas.sort((a,b) => getRaridadeValor(b.raridade) - getRaridadeValor(a.raridade))[0];
            renderizarCartaResultado(melhor, 0, true);
            animando = false;
        } else {
            iniciarCinematica(cartasSorteadas);
        }
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
        
        let loops = 0;
        const intervalo = setInterval(() => {
            const randomCard = bancoDeCartas[Math.floor(Math.random() * bancoDeCartas.length)];
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
                if (window.estadoJogo.pacotes[pacoteAtualSendoAberto] > 0) {
                    btnAbrirOutro.classList.remove('tela-escondida');
                    btnAbrirOutro.innerText = `Abrir Outro (${window.estadoJogo.pacotes[pacoteAtualSendoAberto]})`;
                }
                animando = false;
            }
        }, 500);
    }

    btnProximaCarta.onclick = () => mostrarProximaCartaDaFila();
    btnFecharAbertura.onclick = () => { modalAbertura.classList.add('tela-escondida'); mostrarTela('inicio'); atualizarDisplayGeral(); };
    btnAbrirOutro.onclick = () => { if (pacoteAtualSendoAberto) { btnAbrirOutro.classList.add('tela-escondida'); btnFecharAbertura.classList.add('tela-escondida'); abrirPacote(pacoteAtualSendoAberto, false); } };

    function sortearCarta(set) {
        const raridade = rolarRaridade();
        const pool = bancoDeCartas.filter(c => c.set === set && c.raridade === raridade);
        if (pool.length === 0) {
            const poolComum = bancoDeCartas.filter(c => c.set === set && c.raridade === "Comum");
            if(poolComum.length === 0) return bancoDeCartas[0];
            return {...poolComum[Math.floor(Math.random() * poolComum.length)]};
        }
        return {...pool[Math.floor(Math.random() * pool.length)]};
    }

    function rolarRaridade() {
        const r = Math.random() * 100;
        if (r <= 60) return "Comum";
        if (r <= 85) return "Raro";
        if (r <= 95) return "Épico";
        if (r <= 99) return "Lendário";
        if (r <= 99.9) return "Mítico";
        return "Secreto";
    }
    
    function getRaridadeValor(r) {
        const mapa = { 'Comum':1, 'Raro':2, 'Épico':3, 'Lendário':4, 'Mítico':5, 'Secreto':6 };
        return mapa[r] || 0;
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
        mostradorGrana.innerText = Math.floor(window.estadoJogo.grana);
        atualizarRenda();
        atualizarDisplayPacotes();
        const zonaAtualObj = bancoZonas.find(z => z.id === window.estadoJogo.zonaAtual);
        if (zonaAtualObj && window.estadoJogo.zonasDesbloqueadas.includes(window.estadoJogo.zonaAtual)) {
            renderizarLojaLocal(zonaAtualObj);
        }
        document.getElementById('nome-jogador').innerText = window.estadoJogo.perfil.nome;
        document.getElementById('img-avatar-mini').src = window.estadoJogo.perfil.avatar;
        renderizarEquipeHome();
        atualizarDisplayEquipe();
    }
    
    function atualizarRenda() {
        let total = 0;
        window.estadoJogo.equipe.forEach(id => {
            const c = window.estadoJogo.inventario[id];
            if(c) total += (RENDAS_BASE[c.raridade.toLowerCase()] || 0) * c.nivel;
        });
        mostradorRenda.textContent = total;
        rendaPorSegundo = total;
    }

    function atualizarDisplayPacotes() {
        areaPacotes.innerHTML = '';
        let temPacote = false;
        for (const [nomeSet, qtd] of Object.entries(window.estadoJogo.pacotes)) {
            if (qtd > 0 && !nomeSet.includes('_aberto')) {
                temPacote = true;
                const btn = document.createElement('button');
                btn.className = 'botao-abrir-pacote';
                btn.innerHTML = `Abrir [${nomeSet}] <span>(x${qtd})</span>`;
                btn.onclick = () => abrirPacote(nomeSet);
                areaPacotes.appendChild(btn);
            }
        }
        if(!temPacote) areaPacotes.innerHTML = '<p style="color:#555; font-size:0.8rem">Nenhum pacote.</p>';
    }
    
    function renderizarEquipeHome() {
        areaEquipeHome.innerHTML = '';
        for(let i=0; i<CONFIG.tamanhoMaxEquipe; i++) {
            const id = window.estadoJogo.equipe[i];
            if(id && window.estadoJogo.inventario[id]) {
                const c = window.estadoJogo.inventario[id];
                const div = document.createElement('div');
                div.className = `carta ${c.raridade.toLowerCase()} inventario`;
                div.innerHTML = `<img src="${c.imagem}" class="imagem-carta"><div class="area-info-gradiente"><span class="nome-carta-gradiente">${c.nome}</span><span class="renda-carta">Lvl ${c.nivel}</span></div>`;
                div.onclick = () => abrirDetalheCarta(c.id);
                areaEquipeHome.appendChild(div);
            } else {
                areaEquipeHome.innerHTML += `<div class="slot-vazio">Vazio</div>`;
            }
        }
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
            const custoUp = CUSTOS_UPGRADE[c.nivel];
            const max = c.nivel >= NIVEL_MAXIMO;
            const podeUpar = !max && c.quantidade > custoUp;
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
                    ${!max ? `<button class="btn-upar" ${podeUpar?'':'disabled'} onclick="upar(${c.id})">Upar (${custoUp})</button>` : ''}
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
        const custo = CUSTOS_UPGRADE[c.nivel];
        if(c.quantidade > custo) {
            c.quantidade -= custo;
            c.nivel++;
            salvar(); atualizarRenda(); atualizarDisplayGeral(); atualizarDisplayInventario();
            mostrarNotificacao(`Level Up!`, "sucesso");
        }
    };

    btnVenderDuplicatas.addEventListener('click', () => {
        let totalGrana = 0, totalCartas = 0;
        for (const id in window.estadoJogo.inventario) {
            const c = window.estadoJogo.inventario[id];
            const custo = CUSTOS_UPGRADE[c.nivel];
            const max = (c.nivel >= NIVEL_MAXIMO || !custo);
            let excesso = 0;
            if (c.quantidade > 1) {
                if (max) excesso = c.quantidade - 1;
                else if (c.quantidade > custo) excesso = c.quantidade - (custo + 1);
            }
            if (excesso > 0) {
                const preco = PRECOS_VENDA[c.raridade.toLowerCase()] || 1;
                totalGrana += preco * excesso;
                totalCartas += excesso;
                window.estadoJogo.inventario[id].quantidade -= excesso;
            }
        }
        if (totalCartas > 0) {
            window.estadoJogo.grana += totalGrana;
            salvar(); atualizarDisplayGeral(); atualizarDisplayInventario();
            mostrarNotificacao(`Vendeu ${totalCartas} cartas por $${totalGrana}!`, "sucesso");
        } else {
            mostrarNotificacao("Nada para vender.", "info");
        }
    });

    btnLimparInventario.onclick = () => {
        if(confirm("ATENÇÃO: ISSO APAGA TUDO!")) { localStorage.removeItem('rng_estado_v2'); location.reload(); }
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
        for(let i=0; i<6; i++) {
            let card;
            if(Math.random() < 0.3) {
                 const pool = bancoDeCartas.filter(c => c.set === 'Mercado Negro');
                 card = pool[Math.floor(Math.random() * pool.length)];
            } else {
                 const pool = bancoDeCartas.filter(c => c.set !== 'Mercado Negro');
                 card = pool[Math.floor(Math.random() * pool.length)];
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
            const preco = PRECOS_LOJA[c.raridade.toLowerCase()] || 1000;
            div.innerHTML = `
                <div class="carta ${c.raridade.toLowerCase()}" style="transform:scale(0.8); margin-bottom:-30px">
                    ${tag}
                    <img src="${c.imagem}" class="imagem-carta">
                    <div class="area-info-gradiente">
                        <span class="nome-carta-gradiente">${c.nome}</span>
                        <span class="raridade-carta-gradiente">[${c.raridade}]</span>
                    </div>
                </div>
                <div style="text-align:center; width:100%">
                     <span class="preco-carta">💰 ${preco}</span>
                     <button class="btn-comprar-carta" onclick="comprarMercado(${idx}, ${preco})" ${oferta.comprado ? 'disabled' : ''}>${oferta.comprado ? 'Esgotado' : 'Comprar'}</button>
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
            salvar(); renderizarMercadoNegro(); atualizarDisplayGeral(); mostrarNotificacao("Comprado!", "sucesso");
        } else if (window.estadoJogo.grana < preco) {
            mostrarNotificacao("Sem grana!", "erro");
        }
    }

    function atualizarDisplayAlbum() {
        const areaAlbum = document.getElementById('area-album');
        areaAlbum.innerHTML = ''; 
        bancoDeCartas.forEach(carta => {
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
            areaAlbum.appendChild(div);
        });
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

    function iniciarAutoAbrir() {
        const qtd = parseInt(qtdAutoAbrirSelect.value);
        const zona = bancoZonas.find(z => z.id === window.estadoJogo.zonaAtual);
        if (!zona) return;
        const set = zona.pacoteFoco;
        let disponivel = window.estadoJogo.pacotes[set] || 0;
        let restante = qtd === 999 ? disponivel : Math.min(qtd, disponivel);
        if(restante <= 0) return mostrarNotificacao("Sem pacotes!", "erro");

        autoAbrirBtn.disabled = true;
        stopAutoAbrirBtn.disabled = false;
        mostrarTela('inicio');

        autoAbrirInterval = setInterval(() => {
            if(restante > 0) { abrirPacote(set, true); restante--; } 
            else { clearInterval(autoAbrirInterval); autoAbrirBtn.disabled = false; stopAutoAbrirBtn.disabled = true; mostrarNotificacao("Concluído", "info"); }
        }, 500);
    }
    autoAbrirBtn.addEventListener('click', iniciarAutoAbrir);
    stopAutoAbrirBtn.addEventListener('click', () => { clearInterval(autoAbrirInterval); autoAbrirBtn.disabled = false; stopAutoAbrirBtn.disabled = true; });

    function mostrarTela(nome) {
        Object.values(telas).forEach(t => { t.classList.add('tela-escondida'); t.classList.remove('tela-ativa'); });
        telas[nome].classList.remove('tela-escondida');
        telas[nome].classList.add('tela-ativa');
        navBtns.forEach(b => b.classList.remove('active'));
        document.getElementById('nav-'+nome).classList.add('active');
    }

    document.getElementById('nav-loja').onclick = () => mostrarTela('loja');
    document.getElementById('nav-inicio').onclick = () => mostrarTela('inicio');
    document.getElementById('nav-inventario').onclick = () => mostrarTela('inventario');
    document.getElementById('nav-album').onclick = () => { mostrarTela('album'); atualizarDisplayAlbum(); };
    document.getElementById('nav-metas').onclick = () => { mostrarTela('metas'); renderizarMetas(); };

    setInterval(() => {
        if(rendaPorSegundo > 0) {
            window.estadoJogo.grana += rendaPorSegundo;
            salvar();
            mostradorGrana.innerText = Math.floor(window.estadoJogo.grana);
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