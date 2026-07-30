import { supabase } from '../scripts/supabase.js';

export function AuthUI() {
    const container = document.createElement('div');
    container.className = 'auth-overlay';
    
    // SVG do Google
    const googleIcon = `
        <svg class="auth-google-icon" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
    `;

    container.innerHTML = `
        <div class="auth-card">
            <div class="auth-logo">✨</div>
            <h2 class="auth-title">Fábula Zen</h2>
            <p class="auth-subtitle">Um refúgio mágico para pais e filhos.<br>Entre para salvar o progresso do seu herói.</p>
            
            <button id="btn-google-login" class="auth-google-btn">
                ${googleIcon}
                Entrar com o Google
            </button>
            
            <div id="auth-loading" class="auth-loading">Conectando à magia...</div>
            
            <div class="auth-footer">
                Ao entrar, você concorda com nossos <br>
                <a href="termos-de-uso.html" target="_blank">Termos Mágicos</a> & <a href="termos-de-uso.html" target="_blank">Privacidade Zen</a>
            </div>
        </div>
    `;

    // Delay curto para a animação de fade-in da interface
    setTimeout(() => container.classList.add('visible'), 50);

    const btnGoogle = container.querySelector('#btn-google-login');
    const loadingText = container.querySelector('#auth-loading');

    btnGoogle.addEventListener('click', async () => {
        btnGoogle.style.display = 'none';
        loadingText.classList.add('active');

        // Dispara o login OAuth via Google usando o Supabase
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin + window.location.pathname
            }
        });

        if (error) {
            console.error('Erro no login com Google:', error.message);
            alert('Ops! A magia falhou: ' + error.message);
            btnGoogle.style.display = 'flex';
            loadingText.classList.remove('active');
        }
        // Se sucesso, o redirecionamento será feito pela página (o usuário sai e volta para a URL base)
    });

    return container;
}
