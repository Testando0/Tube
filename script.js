// --- APIs FUNCIONAIS (ATÉ A DATA ATUAL) ---
// AVISO: Estas APIs são públicas e podem deixar de funcionar a qualquer momento.
const API_SEARCH_URL = 'https://invidious.io.lol/api/v1/search'; // API para buscar vídeos por nome
const API_DOWNLOAD_URL = 'https://co.wuk.sh/api/json';         // API para obter links de download a partir de uma URL

// --- SELEÇÃO DE ELEMENTOS DO HTML ---
document.addEventListener('DOMContentLoaded', () => {
    const tabName = document.getElementById('tab-name');
    const tabLink = document.getElementById('tab-link');
    const formName = document.getElementById('form-name');
    const formLink = document.getElementById('form-link');
    const searchNameInput = document.getElementById('search-name-input');
    const searchNameBtn = document.getElementById('search-name-btn');
    const searchLinkInput = document.getElementById('search-link-input');
    const searchLinkBtn = document.getElementById('search-link-btn');
    const resultsDiv = document.getElementById('results');

    // --- LÓGICA DAS ABAS ---
    tabName.addEventListener('click', () => {
        tabName.classList.add('active');
        tabLink.classList.remove('active');
        formName.classList.add('active');
        formLink.classList.remove('active');
    });

    tabLink.addEventListener('click', () => {
        tabLink.classList.add('active');
        tabName.classList.remove('active');
        formLink.classList.add('active');
        formName.classList.remove('active');
    });

    // --- FUNÇÕES AUXILIARES ---
    const showLoader = (element = resultsDiv) => {
        element.innerHTML = '<div class="loader"></div>';
    };

    const showError = (message, element = resultsDiv) => {
        element.innerHTML = `<p style="color: #ff4d4d; text-align: center;">${message}</p>`;
    };

    // --- FUNÇÃO 1: BUSCAR VÍDEOS POR NOME ---
    const searchByName = async () => {
        const query = searchNameInput.value.trim();
        if (!query) {
            showError('Por favor, digite o nome de uma música ou vídeo.');
            return;
        }
        showLoader();

        try {
            const response = await fetch(`${API_SEARCH_URL}?q=${encodeURIComponent(query)}&type=video`);
            if (!response.ok) throw new Error('A API de busca não respondeu.');
            
            const data = await response.json();
            displaySearchResults(data);
        } catch (error) {
            console.error('Erro ao buscar:', error);
            showError('Não foi possível buscar os resultados. A API pode estar offline.');
        }
    };
    
    // --- FUNÇÃO 2: MOSTRAR RESULTADOS DA BUSCA ---
    const displaySearchResults = (items) => {
        resultsDiv.innerHTML = '';
        if (!items || items.length === 0) {
            showError('Nenhum resultado encontrado. 😕');
            return;
        }

        items.slice(0, 10).forEach(item => { // Mostra os 10 primeiros resultados
            const resultHtml = `
                <div class="result-item" id="item-${item.videoId}">
                    <img src="${item.videoThumbnails[0]?.url || 'https://i.imgur.com/uG9T6lG.png'}" alt="Thumbnail">
                    <div class="info">
                        <p>${item.title}</p>
                        <span>${item.author}</span>
                    </div>
                    <div class="actions">
                        <button onclick="getDownloadLinks('${item.videoId}')">Baixar</button>
                    </div>
                </div>
            `;
            resultsDiv.innerHTML += resultHtml;
        });
    };

    // --- FUNÇÃO 3: OBTER LINKS DE DOWNLOAD PARA UM VÍDEO ESPECÍFICO ---
    window.getDownloadLinks = async (videoId) => {
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
        const itemDiv = document.getElementById(`item-${videoId}`);
        const actionsDiv = itemDiv.querySelector('.actions');
        showLoader(actionsDiv);

        try {
            const response = await fetch(API_DOWNLOAD_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ url: videoUrl, isAudioOnly: true })
            });
            if (!response.ok) throw new Error('A API de download não respondeu.');
            
            const data = await response.json();
            if (data.status === 'error') throw new Error(data.text);
            
            const downloadButtons = `
                <div class="download-links">
                    <a href="${data.url}" target="_blank" download><button>MP3</button></a>
                    ${data.picker ? `<a href="${data.picker[0].url}" target="_blank" download><button>MP4</button></a>` : ''}
                </div>
            `;
            actionsDiv.innerHTML = downloadButtons;

        } catch (error) {
            console.error('Erro ao obter links:', error);
            showError('Falhou', actionsDiv);
        }
    };
    
    // --- FUNÇÃO 4: BAIXAR DIRETAMENTE POR LINK ---
    const downloadByLink = async () => {
        const link = searchLinkInput.value.trim();
        if (!link) {
            showError('Por favor, cole um link válido.');
            return;
        }
        showLoader();

        try {
            const response = await fetch(API_DOWNLOAD_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ url: link, isAudioOnly: true })
            });

            if (!response.ok) throw new Error('A API de download não respondeu.');
            
            const data = await response.json();
            if (data.status === 'error') throw new Error(data.text);
            
            displayDirectDownloadLinks(data);

        } catch (error) {
            console.error('Erro ao baixar por link:', error);
            showError(`Erro: ${error.message}. O link pode ser inválido ou não suportado.`);
        }
    };
    
    // --- FUNÇÃO 5: MOSTRAR LINKS DE DOWNLOAD DIRETO ---
    const displayDirectDownloadLinks = (data) => {
        const resultHtml = `
            <div class="result-item">
                <img src="${data.thumbnail || 'https://i.imgur.com/uG9T6lG.png'}" alt="Thumbnail">
                <div class="info">
                    <p>${data.title || 'Download Pronto'}</p>
                </div>
                <div class="actions">
                    <a href="${data.url}" target="_blank" download><button>Áudio</button></a>
                    ${data.picker ? data.picker.map(p => `<a href="${p.url}" target="_blank" download><button>${p.quality}</button></a>`).join('') : ''}
                </div>
            </div>
        `;
        resultsDiv.innerHTML = resultHtml;
    };


    // --- EVENT LISTENERS PARA OS BOTÕES E TECLA ENTER ---
    searchNameBtn.addEventListener('click', searchByName);
    searchLinkBtn.addEventListener('click', downloadByLink);
    
    searchNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchByName();
    });
    searchLinkInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') downloadByLink();
    });
});