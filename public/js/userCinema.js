const findButton = document.getElementById('findButton')
const resetButton = document.getElementById('resetButton')
const search = document.getElementById('search')
const dateSearch = document.getElementById('date')

let allTickets = []

function searchItems(searchText, items) {
    const searchLower = searchText.toLowerCase();
    
    return items.filter(item => {
        if (item.name && item.name.toLowerCase().includes(searchLower)) return true;
        if (item.address && item.address.toLowerCase().includes(searchLower)) return true;
        if (item.time && item.time.toLowerCase().includes(searchLower)) return true;
        
        return false;
    });
}

function loadCards(tickets) {
    const container = document.getElementById('grid');
    const loader = document.getElementById('loading');
    
    if (!container) return;
    
    container.innerHTML = '';
    
    if (tickets.length === 0) {
        container.innerHTML = '<div class="no-results">По вашему запросу ничего не найдено</div>';
        if (loader) loader.style.display = 'none';
        return;
    }
    
    if (!localStorage.getItem("token")) {
        document.getElementById('noAccount').style.display = 'block';
    }
    
    tickets.forEach(ticket => {
        const cardDiv = document.createElement('div');
        cardDiv.classList.add('flight-card');
        
        cardDiv.innerHTML = 
        `
        <div class="flight-content">
            <h3 class="flight-route">${ticket.name}</h3>
            <div class="flight-time">${ticket.address}</div>
            <div class="flight-time">${ticket.time}</div>
            <div class="flight-date">${ticket.date}</div>
            <div class="flight-price">${ticket.price}</div>
        </div>
        `
        
        if(localStorage.getItem("token")){
            cardDiv.innerHTML = 
            `
            <div class="flight-content">
                <h3 class="flight-route">${ticket.name}</h3>
                <div class="flight-time">${ticket.address}</div>
                <div class="flight-time">${ticket.time}</div>
                <div class="flight-date">${ticket.date}</div>
                <div class="flight-price">${ticket.price}</div>
                <a href="/cinema-ticket/${ticket.id}" class="btn btn-primary flight-btn">Выбрать билет</a>
            </div>
            `
        }
        
        container.appendChild(cardDiv);
    });
    
    if (loader) {
        loader.style.display = 'none';
    }
}

function performSearch() {
    const searchText = search ? search.value.trim() : '';
    const dateValue = dateSearch ? dateSearch.value : '';
    
    let filteredTickets = [...allTickets];
    
    if (searchText) {
        filteredTickets = searchItems(searchText, filteredTickets);
    }
    
    if (dateValue) {
        filteredTickets = filteredTickets.filter(ticket => ticket.date === dateValue);
    }
    
    loadCards(filteredTickets);
}

function resetSearch() {
    if (search) {
        search.value = '';
    }
    if (dateSearch) {
        dateSearch.value = '';
    }
    
    loadCards(allTickets);
}

async function getTickets() {
    const response = await fetch("/cinema-tickets", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
    });

    const data = await response.json(); 
    allTickets = data.cinema;
    loadCards(allTickets);
    
    if (findButton) {
        findButton.addEventListener('click', performSearch);
    }
    
    if (resetButton) {
        resetButton.addEventListener('click', resetSearch);
    }
    
    if (search) {
        search.addEventListener('input', performSearch);
        search.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                performSearch();
            }
        });
    }
    
    if (dateSearch) {
        dateSearch.addEventListener('change', performSearch);
    }
}

getTickets()