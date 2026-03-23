const cardNumber = document.getElementById('card-number')
const cvv = document.getElementById('card-cvv')
const expiry = document.getElementById('card-expiry')
const phone = document.getElementById('phone')

phone.addEventListener('input', function() {
    maskPhone(this);
});

cvv.addEventListener('input', function() {
    maskCVV(this);
});

cardNumber.addEventListener('input', function() {
    maskCardNumber(this);
});

expiry.addEventListener('input', function() {
    maskExpiryDate(this);
});

function maskCardNumber(input) {
    let value = input.value.replace(/\D/g, ''); 
    value = value.substring(0, 16); 
    
    let formattedValue = '';
    for (let i = 0; i < value.length; i++) {
        if (i > 0 && i % 4 === 0) {
            formattedValue += ' ';
        }
        formattedValue += value[i];
    }
    
    input.value = formattedValue;
}


function maskCVV(input) {
    let value = input.value.replace(/\D/g, ''); 
    value = value.substring(0, 3); 
    input.value = value;
}

function maskExpiryDate(input) {
    let value = input.value.replace(/\D/g, ''); 
    value = value.substring(0, 4); 
    
    if (value.length > 0) {
        let month = value.substring(0, 2);
        let year = value.substring(2, 4);
        
        if (month.length === 2) {
            const monthNum = parseInt(month);
            if (monthNum < 1) month = '01';
            if (monthNum > 12) month = '12';
        }
        
        if (year.length === 0) {
            input.value = month;
        } else {
            input.value = month + '/' + year;
        }
    } else {
        input.value = '';
    }
}
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

document.getElementById('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem("token");
    const ticketId = parseInt(window.location.href.split('/').pop());
    
    window.scrollTo(0, 0);
    document.getElementById('booking').style.display = 'none';
    document.getElementById('payment').style.display = 'block';
    
    try {

        const response = await fetch("/api-write-avia-ticket", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                ticketId,
                token
            })
        });

        if (!response.ok) {
            throw new Error('Ошибка при отправке запроса');
        }

        const data = await response.json();
        console.log('Запрос успешно выполнен:', data);

        setTimeout(() => {
            document.getElementById('loader').classList.add('hidden');
            document.getElementById('checkmark').classList.remove('hidden');
            document.getElementById('container').style.display = 'none';
            
            const payment = document.getElementById('payment');
            payment.style.display = 'flex';
            payment.style.flexDirection = 'column';
            payment.style.gap = '20px';
            
            document.getElementById('status-title').textContent = 'Оплата прошла успешно';
            document.getElementById('status-message').textContent = 'Ваш билет отправлен на указанную почту';
            document.getElementById('continue-btn').style.display = 'block';
        }, 3000);

    } catch (error) {
        console.error('Ошибка:', error);
        
        document.getElementById('status-title').textContent = 'Ошибка оплаты';
        document.getElementById('status-message').textContent = 'Попробуйте снова или обратитесь в поддержку';
        document.getElementById('loader').classList.add('hidden');
    }
});