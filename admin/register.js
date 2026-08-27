const normalModeButton =
    document.getElementById("normalModeButton");

const inviteModeButton =
    document.getElementById("inviteModeButton");

const registerForm =
    document.getElementById("registerForm");

const inviteMode =
    document.getElementById("inviteMode");

const registerStatus =
    document.getElementById("registerStatus");

const inviteStatus =
    document.getElementById("inviteStatus");

const validateInviteButton =
    document.getElementById(
        "validateInviteButton"
    );

const inviteDetails =
    document.getElementById(
        "inviteDetails"
    );

const inviteRole =
    document.getElementById(
        "inviteRole"
    );

const inviteRegisterForm =
    document.getElementById(
        "inviteRegisterForm"
    );


let validatedInvite = null;


/*
 * TROCAR PARA CADASTRO NORMAL
 */

normalModeButton.addEventListener(
    "click",
    () => {

        normalModeButton.classList.add(
            "active"
        );

        inviteModeButton.classList.remove(
            "active"
        );

        registerForm.style.display =
            "block";

        inviteMode.style.display =
            "none";

    }
);


/*
 * TROCAR PARA CONVITE
 */

inviteModeButton.addEventListener(
    "click",
    () => {

        inviteModeButton.classList.add(
            "active"
        );

        normalModeButton.classList.remove(
            "active"
        );

        registerForm.style.display =
            "none";

        inviteMode.style.display =
            "block";

    }
);


/*
 * CADASTRO NORMAL
 */

registerForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const name =
            document
                .getElementById("name")
                .value
                .trim();

        const username =
            document
                .getElementById("username")
                .value
                .trim();

        const email =
            document
                .getElementById("email")
                .value
                .trim();

        const password =
            document
                .getElementById("password")
                .value;

        const confirmPassword =
            document
                .getElementById(
                    "confirmPassword"
                )
                .value;

        registerStatus.textContent = "";
        registerStatus.className =
            "status";


        if (
            password !==
            confirmPassword
        ) {

            registerStatus.textContent =
                "As senhas não coincidem.";

            registerStatus.className =
                "status error";

            return;

        }


        const button =
            document.getElementById(
                "registerButton"
            );


        button.disabled = true;

        button.textContent =
            "Criando identidade...";


        try {

            const response =
                await fetch(
                    "/api/admin/register",
                    {
                        method: "POST",

                        credentials:
                            "same-origin",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                name,
                                username,
                                email,
                                password
                            })
                    }
                );


            const result =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    result.message ||
                    "Não foi possível criar a identidade."
                );

            }


            registerStatus.textContent =
                "Identidade criada com sucesso.";

            registerStatus.className =
                "status success";


            setTimeout(() => {

                window.location.href =
                    "/login";

            }, 1000);


        } catch (error) {

            registerStatus.textContent =
                error.message;

            registerStatus.className =
                "status error";


            button.disabled =
                false;

            button.textContent =
                "Criar identidade";

        }

    }
);


/*
 * VALIDAR CONVITE
 */

validateInviteButton.addEventListener(
    "click",
    async () => {

        const code =
            document
                .getElementById(
                    "inviteCode"
                )
                .value
                .trim()
                .toUpperCase();


        inviteStatus.textContent = "";
        inviteStatus.className =
            "status";


        if (!code) {

            inviteStatus.textContent =
                "Digite o código de convite.";

            inviteStatus.className =
                "status error";

            return;

        }


        validateInviteButton.disabled =
            true;

        validateInviteButton.textContent =
            "Validando...";


        try {

            const response =
                await fetch(
                    "/api/invites/validate",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                code
                            })
                    }
                );


            const result =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    result.message ||
                    "Convite inválido."
                );

            }


            validatedInvite =
                code;


            inviteRole.textContent =
                result.invite.role;


            inviteDetails.style.display =
                "block";


            inviteStatus.textContent =
                "Convite validado.";

            inviteStatus.className =
                "status success";


            validateInviteButton.style.display =
                "none";


        } catch (error) {

            inviteStatus.textContent =
                error.message;

            inviteStatus.className =
                "status error";


            validatedInvite =
                null;


        }


        validateInviteButton.disabled =
            false;

        validateInviteButton.textContent =
            "Validar convite";

    }
);


/*
 * CADASTRO COM CONVITE
 */

inviteRegisterForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        if (!validatedInvite) {

            inviteStatus.textContent =
                "Valide o convite primeiro.";

            inviteStatus.className =
                "status error";

            return;

        }


        const name =
            document
                .getElementById(
                    "inviteName"
                )
                .value
                .trim();

        const username =
            document
                .getElementById(
                    "inviteUsername"
                )
                .value
                .trim();

        const email =
            document
                .getElementById(
                    "inviteEmail"
                )
                .value
                .trim();

        const password =
            document
                .getElementById(
                    "invitePassword"
                )
                .value;

        const confirmPassword =
            document
                .getElementById(
                    "inviteConfirmPassword"
                )
                .value;


        if (
            password !==
            confirmPassword
        ) {

            inviteStatus.textContent =
                "As senhas não coincidem.";

            inviteStatus.className =
                "status error";

            return;

        }


        const button =
            document.getElementById(
                "inviteRegisterButton"
            );


        button.disabled = true;

        button.textContent =
            "Criando identidade...";


        try {

            const response =
                await fetch(
                    "/api/admin/register",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                name,
                                username,
                                email,
                                password,
                                inviteCode:
                                    validatedInvite
                            })
                    }
                );


            const result =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    result.message ||
                    "Não foi possível criar a identidade."
                );

            }


            inviteStatus.textContent =
                "Identidade criada com sucesso.";

            inviteStatus.className =
                "status success";


            setTimeout(() => {

                window.location.href =
                    "/login";

            }, 1000);


        } catch (error) {

            inviteStatus.textContent =
                error.message;

            inviteStatus.className =
                "status error";


            button.disabled =
                false;

            button.textContent =
                "Criar identidade";

        }

    }
);
