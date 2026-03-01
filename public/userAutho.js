const form = document.getElementById("reg-form");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                password
            })
        });

        const data = await response.json();
        console.log(data);
        localStorage.setItem("token") = "mock-token"
    } catch (error) {
        console.error(error);
        alert("Ошибка сервера");
    }
});