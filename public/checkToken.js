if (localStorage.getItem("token")) {
    const headerActions = document.querySelector(".header-actions");
    
    if (headerActions) {
        const currentLinks = headerActions.querySelectorAll('a');
        currentLinks.forEach(link => {
            link.style.display = "none";
        });
        
        const userMenu = document.createElement('div');
        userMenu.className = 'user-menu';
        userMenu.innerHTML = `
            <a href="/profile" class="btn btn-outline">Личный кабинет</a>
        `;
        
        headerActions.appendChild(userMenu);
    }
}