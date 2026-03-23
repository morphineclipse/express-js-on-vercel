if(!localStorage.getItem("token")){
    window.location.replace("/authorization")
}   

let token = localStorage.getItem("token")
let Username = document.getElementById("firstname")
let surname = document.getElementById("lastname")
let phoneNumber = document.getElementById("phone")
let email = document.getElementById("email")

const logout = document.getElementById('logout')
const saveBtn = document.getElementById("save-btn")

logout.addEventListener("click", ()=>{
    localStorage.removeItem("token")
    window.location.replace('/main')
})

phoneNumber.addEventListener("input", function(e){
    maskPhone(this)
})

function maskPhone(input) {
    let value = input.value.replace(/\D/g, '');
    
    if (value.startsWith('8')) {
        value = '7' + value.substring(1);
    } else if (value.startsWith('7')) {
        value = '7' + value.substring(1);
    } else if (!value.startsWith('7')) {
        value = '7' + value;
    }
    
    value = value.substring(0, 11);
    
    let formattedValue = '';
    
    if (value.length > 0) {
        formattedValue = '+' + value.charAt(0); 
    }
    
    if (value.length > 1) {
        formattedValue += ' (' + value.substring(1, 4); 
    }
    
    if (value.length > 4) {
        formattedValue += ') ' + value.substring(4, 7); 
    }
    
    if (value.length > 7) {
        formattedValue += '-' + value.substring(7, 9); 
    }
    
    if (value.length > 9) {
        formattedValue += '-' + value.substring(9, 11);
    }
    
    input.value = formattedValue;
}

function isValidPhone(phone) {
    const digits = phone.replace(/\D/g, '');
    return digits.length === 11 && digits.startsWith('7');
}

function formatPhoneNumber(phoneNumber) {
    const digits = phoneNumber.replace(/\D/g, '');
    
    if (digits.length === 11) {
        return `+${digits[0]} (${digits.substring(1, 4)}) ${digits.substring(4, 7)}-${digits.substring(7, 9)}-${digits.substring(9, 11)}`;
    }
    
    return phoneNumber;
}

async function getData () {
    try {
        const title = document.getElementById("profile-title")
        const form = document.getElementById("form")
        form.style.display = "none"
        title.textContent = "Загрузка..."
        const response = await fetch("/api-get-user-data", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                token
            })
        });

        const data = await response.json(); 

        if (response.ok) {
            form.style.display = ""
            title.textContent = "Личные данные"
            email.value = data.user.email
            Username.value = data.user.name
            surname.value = data.user.surname
            phoneNumber.value = data.user.phoneNumber
        } 
    } catch (error) {
        console.error("Ошибка:", error);
        alert("Ошибка сервера");
    }
}
getData()

async function getHistory() {
    const token = localStorage.getItem("token")
    try {
        const response = await fetch('/api-get-tickets', {
            method: 'POST',
            headers:{
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                token
            })
        });

        const data = await response.json();
        
        console.log(data)
        const container = document.getElementById('ticketsList')
        const tickets = data.tickets
        tickets.forEach(ticket => {
            const element = document.createElement("div")
            element.classList.add('ticket-item')
            if(ticket.category == "avia"){
            element.innerHTML = 
                `
                    <div class="ticket-icon">✈️</div>
                    <div class="ticket-info">
                        <div class="ticket-title">${ticket.from} - ${ticket.to}</div>
                        <div class="ticket-details">${ticket.date}, ${ticket.timeFrom}, рейс ${ticket.number}</div>
                    </div>
                    <div class="ticket-price">${ticket.price}</div>
                `
            }
            else if(ticket.category == "cinema"){
            element.innerHTML = 
                `
                    <div class="ticket-icon">🎬</div>
                    <div class="ticket-info">
                        <div class="ticket-title">${ticket.name}</div>
                        <div class="ticket-details">${ticket.date}, ${ticket.time}, ${ticket.address}</div>
                    </div>
                    <div class="ticket-price">${ticket.price}</div>
                `
            }
            else if(ticket.category == "theatre"){
            element.innerHTML = 
                `
                    <div class="ticket-icon">🎭</div>
                    <div class="ticket-info">
                        <div class="ticket-title">${ticket.name}</div>
                        <div class="ticket-details">${ticket.date}, ${ticket.time}, ${ticket.address}</div>
                    </div>
                    <div class="ticket-price">${ticket.price}</div>
                `
            }

            container.appendChild(element)
        });
    } catch (e) {
        console.error('Ошибка загрузки билетов:', e);
        return [];
    }

}

getHistory()

const form = document.getElementById("form").addEventListener("submit", async(e) =>{
    e.preventDefault()

    let Username = document.getElementById("firstname")
    let surname = document.getElementById("lastname")
    let phoneNumber = document.getElementById("phone")
    let email = document.getElementById("email")
    const phoneDigits = phoneNumber.value.replace(/\D/g, '');
    if (phoneDigits.length !== 11) {
        alert('Номер телефона должен содержать 11 цифр');
        phoneNumber.focus();
        return
    }

    Username = Username.value
    surname = surname.value
    phoneNumber = phoneNumber.value
    email = email.value
    saveBtn.disabled = true
    saveBtn.textContent = "Сохранение..."
    saveBtn.style.backgroundColor = "#ffc107"

    try 
    {
        token = localStorage.getItem("token")
        const response = await fetch("/api-write-user-data", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                Username,
                surname,
                phoneNumber,
                token
            })
        });
        if (response.ok) {
            saveBtn.style.backgroundColor = "#28a745" 
            saveBtn.textContent = "Сохранено"
            
            setTimeout(() => {
                saveBtn.disabled = false
                saveBtn.textContent = "Сохранить"
                saveBtn.style.backgroundColor = "" 
            }, 2000)
        }
    }
     
    catch (error) {
        console.error("Ошибка:", error);
    }
}
)