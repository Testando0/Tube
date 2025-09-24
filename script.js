document.addEventListener('DOMContentLoaded', () => {
    // Selecionando os elementos do HTML
    const tabName = document.getElementById('tab-name');
    const tabLink = document.getElementById('tab-link');
    const formName = document.getElementById('form-name');
    const formLink = document.getElementById('form-link');
    const searchNameInput = document.getElementById('search-name-input');
    const searchNameBtn = document.getElementById('search-name-btn');
    const searchLinkInput = document.getElementById('search-link-input');
    const searchLinkBtn = document.getElementById('search-link-btn');
    const resultsDiv = document.getElementById('results');

    // !!! IMPORTANTE: URL DA API PÚBLICA !!!
    // Você precisa encontrar uma API pública e colocar a URL base aqui.
    // APIs para isso mudam constantemente. Procure por "youtube downloader api free" ou similar.
    // Exemplo de como a URL pode parecer: 'https://api.exemplo.com/v1/'
    const API_BASE_URL = 'URL_DA_SUA_API_AQUI'; 
    
    // Gerenciador das abas
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

    // Função para mostrar o spinner de carregamento
    const showLoader = () => {
        resultsDiv.innerHTML = '<div class="loader"></div>';
    };

    // Função para mostrar erros
    const showError = (message) => {
        resultsDiv.innerHTML = `<p style="color: #ff4d4d; text-align: center;">${message}</p>`;
    };
    
    // Função para buscar por NOME
    const searchByName = async () => {
        const query = searchNameInput.value.trim();
        if (!query) {
            showError('Por favor, digite o nome de uma música ou vídeo.');
            return;
        }

        if (API_BASE_URL === 'https://kuromi-system-tech.onrender.com') {
            showError('ERRO: A URL da API não foi configurada no arquivo script.js!');
            return;
        }

        showLoader();

        try {
            // A rota da API para busca pode variar. Ex: '/search', '/query', etc.
            const response = await fetch(`${API_BASE_URL}/api/pesquisayt?query='${encodeURIComponent(query)}`);
            if (!response.ok) {
                throw new Error('A API não respondeu corretamente. Código: ' + response.status);
            }
            const data = await response.json();
            displayResults(data.results); // O formato da resposta (ex: data.results) depende da API
        } catch (error) {
            console.error('Erro ao buscar:', error);
            showError('Não foi possível buscar os resultados. A API pode estar offline.');
        }
    };

    // Função para baixar por LINK
    const downloadByLink = async () => {
        const link = searchLinkInput.value.trim();
        if (!link) {
            showError('Por favor, cole um link válido.');
            return;
        }
        
        if (API_BASE_URL === 'https://kuromi-system-tech.onrender.com') {
            showError('ERRO: A URL da API não foi configurada no arquivo script.js!');
            return;
        }

        showLoader();

        try {
            // A rota da API para download por link pode variar. Ex: '/info', '/download'
            const response = await fetch(`${API_BASE_URL}/api/play?name=${encodeURIComponent(link)}`);
            if (!response.ok) {
                throw new Error('A API não respondeu corretamente. Código: ' + response.status);
            }
            const data = await response.json(); // A API deve retornar os links de download
            displayDownloadLinks([data]); // Reutiliza a função de display
        } catch (error) {
            console.error('Erro ao buscar link:', error);
            showError('Não foi possível obter as informações do link. A API pode não suportá-lo.');
        }
    };

    // Função para mostrar os resultados na tela
    const displayResults = (items) => {
        resultsDiv.innerHTML = '';
        if (!items || items.length === 0) {
            resultsDiv.innerHTML = '<p style="text-align: center;">Nenhum resultado encontrado. 😕</p>';
            return;
        }

        items.forEach(item => {
            // Os nomes das propriedades (thumbnail, title, mp3Url, etc) dependem da API!
            const resultHtml = `
                <div class="result-item">
                    <img src="${item.thumbnail || 'https://i.imgur.com/uG9T6lG.png'}" alt="Thumbnail">
                    <div class="info">
                        <p>${item.title || 'Título indisponível'}</p>
                    </div>
                    <div class="actions">
                        <a href="${item.mp3Url}" target="_blank" download><button>MP3</button></a>
                        <a href="${item.mp4Url}" target="_blank" download><button>MP4</button></a>
                    </div>
                </div>
            `;
            resultsDiv.innerHTML += resultHtml;
        });
    };
    
    // Adicionando os eventos aos botões
    searchNameBtn.addEventListener('click', searchByName);
    searchLinkBtn.addEventListener('click', downloadByLink);
    
    // Permitir buscar com a tecla "Enter"
    searchNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchByName();
    });
    searchLinkInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') downloadByLink();
    });
});