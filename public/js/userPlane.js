tickets = []

async function getTickets() {
    const response = await fetch("/plane-tickets", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    });

    const data = await response.json(); 

    console.log(data)
    tickets = data.plane
    loadCards(tickets)
}

function loadCards(tickets){
    const container = document.getElementById('grid');
    const loader = document.getElementById('loading')
    tickets.forEach(ticket => {
            console.log("Processing ticket:", ticket);

            const cardDiv = document.createElement('div');
            cardDiv.classList.add('flight-card');

            const contentDiv = document.createElement('div')
            contentDiv.classList.add('flight-content')
            cardDiv.appendChild(contentDiv)
            
            const h3 = document.createElement('h3');
            h3.textContent = `${ticket.from} - ${ticket.to}`
            h3.classList.add('flight-route');
            contentDiv.appendChild(h3);
            
            const timeDiv = document.createElement('div');
            timeDiv.textContent = ticket.time
            timeDiv.classList.add('flight-time');
            contentDiv.appendChild(timeDiv);
            
            const dateDiv = document.createElement('div');
            dateDiv.textContent = ticket.date
            dateDiv.classList.add('flight-date');
            contentDiv.appendChild(dateDiv);
            
            const priceDiv = document.createElement('div');
            priceDiv.textContent = ticket.price
            priceDiv.classList.add('flight-price');
            contentDiv.appendChild(priceDiv);
            
            const button = document.createElement('a');
            button.textContent = "Выбрать билет"
            button.href = `/ticket/${ticket.id}`;
            button.classList.add('btn', 'btn-primary', 'flight-btn');
            contentDiv.appendChild(button);
            
            container.appendChild(cardDiv);
    })
    loader.style.display = 'none';
};

getTickets()