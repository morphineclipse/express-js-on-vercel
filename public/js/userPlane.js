let tickets = []
let filteredTickets = [];

const cities = [
    'Москва', 'Санкт-Петербург', 'Новосибирск', 'Екатеринбург',
    'Казань', 'Нижний Новгород', 'Челябинск', 'Самара',
    'Омск', 'Ростов-на-Дону', 'Уфа', 'Красноярск',
    'Воронеж', 'Пермь', 'Волгоград', 'Краснодар',
    'Саратов', 'Тюмень', 'Тольятти', 'Ижевск', 'Сочи', 'Ереван',
    'Владивосток', 'Мурманск'
];

const from = document.getElementById('from');
const to = document.getElementById('to');
const cityList = document.getElementById('cityList');
const cityList2 = document.getElementById('cityList2');
const cityDisplay = document.getElementById('cityDisplay');
const date = document.getElementById('date')

const findButton = document.getElementById('findButton')
const resetButton = document.getElementById('resetButton')


let selectedIndex = -1;
let filteredCities = [];

const today = new Date().toISOString().split('T')[0];
date.value = today;

function filterCities(searchText) {
    return cities.filter(city => 
        city.toLowerCase().includes(searchText.toLowerCase())
    );
}

function showCities(searchText = '', list) {
    filteredCities = filterCities(searchText);
    
    if (filteredCities.length === 0) {
        list.innerHTML = '<div class="city-item">Города не найдены</div>';
    } else {
        list.innerHTML = filteredCities
            .map((city, index) => `
                <div class="city-item ${index === selectedIndex ? 'highlighted' : ''}" 
                        data-city="${city}">
                    ${city}
                </div>
            `)
            .join('');
    }
    
    list.style.display = 'flex';
}

from.addEventListener('input', (e) => {
    selectedIndex = -1;
    showCities(e.target.value, cityList);
});

to.addEventListener('input', (e) => {
    selectedIndex = -1;
    showCities(e.target.value, cityList2);
});

cityList.addEventListener('click', (e) => {
    const cityItem = e.target.closest('.city-item');
    if (cityItem && cityItem.dataset.city) {
        const selectedCity = cityItem.dataset.city;
        from.value = selectedCity;
        cityList.style.display = 'none';
    }
});

cityList2.addEventListener('click', (e) => {
    const cityItem = e.target.closest('.city-item');
    if (cityItem && cityItem.dataset.city) {
        const selectedCity = cityItem.dataset.city;
        to.value = selectedCity;
        cityList2.style.display = 'none';
    }
});

function scrollToSelected() {
    const selectedElement = cityList.querySelector('.highlighted');
    if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
    }
}

document.addEventListener('click', (e) => {
    if (!e.target.closest('.city-selector')) {
        cityList.style.display = 'none';
        cityList2.style.display = 'none';
    }
});

document.getElementById('searchForm').addEventListener('submit', (e)=>{
    e.preventDefault()
})

function filterTickets() {
    const fromCity = from.value.trim();
    const toCity = to.value.trim();
    const selectedDate = date.value;
    
    filteredTickets = tickets.filter(ticket => {
        if (fromCity && !ticket.from.toLowerCase().includes(fromCity.toLowerCase())) {
            return false;
        }
        
        if (toCity && !ticket.to.toLowerCase().includes(toCity.toLowerCase())) {
            return false;
        }
        
        if (selectedDate && ticket.date !== selectedDate) {
            return false;
        }
        
        return true;
    });
    
    const container = document.getElementById('grid');
    container.innerHTML = ''; 
    
    if (filteredTickets.length === 0) {
        showNoTicketsMessage();
    } else {
        loadCards(filteredTickets);
    }
    
    showFilterSummary(fromCity, toCity, selectedDate, filteredTickets.length);
}

function showNoTicketsMessage() {
    const container = document.getElementById('grid');
    const noTicketsDiv = document.createElement('div');
    noTicketsDiv.innerHTML = `
        <h2>Билетов по заданным критериям не найдено</h2>
    `;
    container.appendChild(noTicketsDiv);
}

function showFilterSummary(fromCity, toCity, selectedDate, count) {
    let summaryDiv = document.getElementById('filterSummary');
    
    if (!summaryDiv) {
        summaryDiv = document.createElement('div');
        summaryDiv.id = 'filterSummary';
        summaryDiv.classList.add('filter-summary');
        
        const filtersSection = document.querySelector('.filters-section') || document.body;
        filtersSection.insertAdjacentElement('afterend', summaryDiv);
    }
    
    const filters = [];
    if (fromCity) filters.push(`откуда: ${fromCity}`);
    if (toCity) filters.push(`куда: ${toCity}`);
    if (selectedDate) filters.push(`дата: ${formatDate(selectedDate)}`);
    
    if (filters.length === 0) {
        summaryDiv.innerHTML = `Найдено билетов: ${count}`;
    } else {
        summaryDiv.innerHTML = `
            <div>Фильтры: ${filters.join(' • ')}</div>
            <div>Найдено билетов: <strong>${count}</strong></div>
        `;
    }
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

function resetFilters() {
    from.value = '';
    to.value = '';
    date.value = today;
    
    cityList.style.display = 'none';
    cityList2.style.display = 'none';
    
    const container = document.getElementById('grid');
    container.innerHTML = '';
    loadCards(tickets);
    showFilterSummary('', '', '', tickets.length);
}

function loadCards(tickets){
    const container = document.getElementById('grid');
    const loader = document.getElementById('loading');
    if(!localStorage.getItem("token")){
       document.getElementById('noAccount').style.display = 'block';
    }

    if (container) {
        tickets.forEach(ticket => {
            const cardDiv = document.createElement('div');
            cardDiv.classList.add('flight-card');

            cardDiv.innerHTML = 
            `
            <div class="flight-content">
                <h3 class="flight-route">${ticket.from} - ${ticket.to}</h3>
                <div class="flight-time">${ticket.timeFrom} - ${ticket.timeTo}</div>
                <div class="flight-date">${ticket.date}</div>
                <div class="flight-price">${ticket.price}</div>
            </div>
            `

            if(localStorage.getItem("token")){
                cardDiv.innerHTML = 
                `
                <div class="flight-content">
                    <h3 class="flight-route">${ticket.from} - ${ticket.to}</h3>
                    <div class="flight-time">${ticket.timeFrom} - ${ticket.timeTo}</div>
                    <div class="flight-date">${ticket.date}</div>
                    <div class="flight-price">${ticket.price}</div>
                    <a href="/avia-ticket/${ticket.id}" class="btn btn-primary flight-btn">Выбрать билет</a>
                </div>
                `
            }
            
            container.appendChild(cardDiv);
        });
    }

    if (loader) {
        loader.style.display = 'none';
    }
};

async function getTickets() {
    const response = await fetch("/plane-tickets", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    });

    const data = await response.json(); 

    tickets = data.plane
    loadCards(tickets)
}

getTickets().then(() => {    
    findButton.addEventListener('click', filterTickets);
    resetButton.addEventListener('click', resetFilters);

    [from, to, date].forEach(input => {
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    filterTickets();
                }
            });
        }
    });
});