const membersContainer =
    document.getElementById("membersContainer");

const memberCount =
    document.getElementById("memberCount");

const generateButton =
    document.getElementById("generateButton");

const role =
    document.getElementById("role");

const inviteResult =
    document.getElementById("inviteResult");

const logoutButton =
    document.getElementById("logoutButton");


async function loadTeam() {

    try {

        const response =
            await fetch("/api/admin/team");

        if (!response.ok) {
            throw new Error(
                "Não foi possível carregar a equipe."
            );
        }

        const members =
            await response.json();

        memberCount.textContent =
            `${members.length} membro(s)`;


        if (!members.length) {

            membersContainer.innerHTML = `
                <div class="member">
                    Nenhum membro cadastrado.
                </div>
            `;

            return;
        }


        membersContainer.innerHTML =
            members.map(member => `

                <article class="member">

                    <div class="member-top">

                        <div>

                            <div class="member-name">
                                ${escapeHtml(member.name)}
                            </div>

                            <div class="member-username">
                                @${escapeHtml(member.username)}
                            </div>

                        </div>

                        <div class="member-role">
                            ${escapeHtml(member.role)}
                        </div>

                    </div>

                    <div class="member-email">
                        ${escapeHtml(member.email)}
                    </div>

                    <div class="member-status">
                        ${member.active
                            ? "Conta ativa"
                            : "Conta desativada"}
                    </div>

                </article>

            `).join("");


    } catch (error) {

        membersContainer.innerHTML = `
            <div class="member">
                ${escapeHtml(error.message)}
            </div>
        `;

    }

}


generateButton.addEventListener(
    "click",
    async () => {

        generateButton.disabled = true;

        generateButton.textContent =
            "Gerando...";

        inviteResult.style.display =
            "none";


        try {

            const response =
                await fetch(
                    "/api/admin/invites",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            role: role.value
                        })
                    }
                );


            const result =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    result.message ||
                    "Não foi possível gerar o convite."
                );

            }


            const inviteCode =
                result.invite.code;


            inviteResult.innerHTML = `

                <div class="invite-generated">

                    <div>
                        Convite gerado
                    </div>

                    <strong>
                        ${escapeHtml(inviteCode)}
                    </strong>

                    <p>
                        Cargo:
                        ${escapeHtml(result.invite.role)}
                    </p>

                    <button
                        type="button"
                        class="copy-invite-button"
                        id="copyInviteButton"
                    >
                        Copiar convite
                    </button>

                </div>

            `;


            inviteResult.style.display =
                "block";


            const copyButton =
                document.getElementById(
                    "copyInviteButton"
                );


            copyButton.addEventListener(
                "click",
                async () => {

                    try {

                        await navigator.clipboard.writeText(
                            inviteCode
                        );

                        copyButton.textContent =
                            "✓ Convite copiado";

                        copyButton.disabled =
                            true;


                        setTimeout(() => {

                            copyButton.textContent =
                                "Copiar convite";

                            copyButton.disabled =
                                false;

                        }, 2000);


                    } catch (error) {

                        copyButton.textContent =
                            "Não foi possível copiar";

                        setTimeout(() => {

                            copyButton.textContent =
                                "Copiar convite";

                        }, 2000);

                    }

                }
            );


        } catch (error) {

            inviteResult.textContent =
                error.message;

            inviteResult.style.display =
                "block";

        }


        generateButton.disabled =
            false;

        generateButton.textContent =
            "Gerar convite";

    }
);


logoutButton.addEventListener(
    "click",
    async () => {

        await fetch(
            "/api/admin/logout",
            {
                method: "POST"
            }
        );

        window.location.href =
            "/admin/login";

    }
);


function escapeHtml(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


loadTeam();
