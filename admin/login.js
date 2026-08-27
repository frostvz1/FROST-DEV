const form = document.getElementById("loginForm");
const statusBox = document.getElementById("loginStatus");

form.addEventListener("submit", async (event) => {

    event.preventDefault();

    statusBox.textContent = "Verificando acesso...";
    statusBox.className = "status";

    const username =
        document.getElementById("username").value.trim();

    const password =
        document.getElementById("password").value;


    try {

        const response = await fetch(
            "/api/admin/login",
            {
                method: "POST",

                credentials: "same-origin",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    username,
                    password
                })
            }
        );


        const result = await response.json();


        if (!response.ok) {
            throw new Error(
                result.message ||
                "Usuário ou senha incorretos."
            );
        }


        if (!result.success) {
            throw new Error(
                result.message ||
                "Não foi possível entrar."
            );
        }


        statusBox.textContent =
            "Acesso autorizado. Abrindo painel...";

        statusBox.className =
            "status success";


        window.location.replace("/admin/");


    } catch (error) {

        statusBox.textContent =
            error.message;

        statusBox.className =
            "status error";

    }

});
