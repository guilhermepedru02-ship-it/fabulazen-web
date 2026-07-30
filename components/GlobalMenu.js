import { supabase } from '../scripts/supabase.js';

export function GlobalMenu(isOpen, onClose, onNavigate) {
    const container = document.createElement('div');
    container.className = `global-menu-overlay ${isOpen ? 'open' : ''}`;
    container.id = 'global-menu-overlay';
    
    // Close when clicking outside
    container.addEventListener('click', (e) => {
        if (e.target === container) {
            onClose();
        }
    });

    const menuContent = document.createElement('div');
    menuContent.className = 'global-menu-content';

    const header = document.createElement('div');
    header.className = 'global-menu-header';
    header.innerHTML = `
        <h2 class="global-menu-title">Menu</h2>
        <button class="btn-close-menu" aria-label="Fechar Menu">
            <i data-lucide="x"></i>
        </button>
    `;

    const btnClose = header.querySelector('.btn-close-menu');
    btnClose.addEventListener('click', onClose);

    const navList = document.createElement('nav');
    navList.className = 'global-menu-nav';

    const items = [
        { id: 'lib', label: 'Estante de Livros', icon: 'book-open', view: 'SHELF' },
        { id: 'games', label: 'Games', icon: 'gamepad-2', view: 'GAMES' },
        { id: 'custom', label: 'Faça seu Ebook Mágico', icon: 'sparkles', view: 'CUSTOM_ORDER' },
        { id: 'payments', label: 'Central de Pagamentos', icon: 'credit-card', view: 'PAYMENTS' },
        { id: 'sobre-nos', label: 'Sobre Nós (Suporte)', icon: 'info', action: () => {
             onClose();
             window.open('sobre-nos.html', '_blank');
        } },
        { id: 'profile', label: 'Meu Perfil', icon: 'user', action: () => {
             onClose();
             if (window.AvatarSystem) AvatarSystem.abrirPerfil();
        } },
        { id: 'logout', label: 'Sair da Conta', icon: 'log-out', action: async () => {
             onClose();
             // Limpa TODAS as chaves fz_* para isolamento total entre contas
             Object.keys(localStorage).forEach(key => {
                 if (key.startsWith('fz_')) localStorage.removeItem(key);
             });
             // Remove chaves legadas sem sufixo
             localStorage.removeItem('fz_perfil');
             localStorage.removeItem('fz_gamificacao');
             console.log('🧹 [Menu] localStorage limpo antes do logout.');
             await supabase.auth.signOut();
        } }
    ];

    items.forEach(item => {
        const btn = document.createElement('button');
        btn.className = 'global-menu-item';
        btn.innerHTML = `
            <i data-lucide="${item.icon}"></i>
            <span>${item.label}</span>
        `;
        btn.addEventListener('click', () => {
            if (item.action) {
                item.action();
            } else if (item.view) {
                onClose();
                onNavigate(item.view);
            }
        });
        navList.appendChild(btn);
    });

    menuContent.appendChild(header);
    menuContent.appendChild(navList);
    container.appendChild(menuContent);

    // Initialize Lucide icons
    setTimeout(() => {
        if (window.lucide) {
            window.lucide.createIcons({ root: container });
        }
    }, 0);

    return container;
}
