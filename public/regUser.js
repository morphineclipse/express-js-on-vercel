const form = document.getElementById("reg-form");
console.log(1)
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    if (password !== confirmPassword) {
        alert("Пароли не совпадают");
        return;
    }

    try {
        const href = window.location.href + "/register"
        const response = await fetch('/register', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name,
                email,
                password
            })
        });

        const data = await response.json();
        console.log(data);
        window.location.replace('/authorization')        

    } catch (error) {
        console.error(error);
        alert("Ошибка сервера");
    }
});