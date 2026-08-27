const express = require("express");
const path = require("path");
const fs = require("fs");
const session = require("express-session");

const app = express();

const PORT = process.env.PORT || 3000;

const DATABASE_DIR = path.join(__dirname, "database");
const MESSAGES_FILE = path.join(DATABASE_DIR, "messages.json");


/*
 * CONFIGURAÇÃO
 */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: "FROST-DEV-SESSION-2026",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 8
    }
}));


app.get("/", (req, res) => {

    res.redirect("/admin/login");

});


app.use(express.static(path.join(__dirname, "public")));

app.use(
    "/admin",
    express.static(
        path.join(__dirname, "admin")
    )
);


/*
 * PÁGINA PRINCIPAL
 */

/*
 * API DE STATUS
 */

app.get("/api/status", (req, res) => {

    res.json({
        success: true,
        app: "FROST DEV",
        version: "1.0.0",
        status: "online"
    });

});


/*
 * API DE CONTATO
 */

app.post("/api/contact", (req, res) => {

    try {

        const {
            name,
            email,
            phone,
            service,
            budget,
            message
        } = req.body;


        /*
         * VALIDAÇÃO
         */

        if (
            !name ||
            !email ||
            !service ||
            !message
        ) {

            return res.status(400).json({
                success: false,
                message: "Preencha todos os campos obrigatórios."
            });

        }


        /*
         * VALIDAÇÃO BÁSICA DE E-MAIL
         */

        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {

            return res.status(400).json({
                success: false,
                message: "Digite um e-mail válido."
            });

        }


        /*
         * GARANTE QUE O BANCO EXISTE
         */

        if (!fs.existsSync(DATABASE_DIR)) {

            fs.mkdirSync(
                DATABASE_DIR,
                { recursive: true }
            );

        }


        /*
         * LÊ MENSAGENS EXISTENTES
         */

        let messages = [];

        if (fs.existsSync(MESSAGES_FILE)) {

            try {

                const file = fs.readFileSync(
                    MESSAGES_FILE,
                    "utf8"
                );

                messages = file
                    ? JSON.parse(file)
                    : [];

            } catch {

                messages = [];

            }

        }


        /*
         * NOVA SOLICITAÇÃO
         */

        const newMessage = {

            id: Date.now(),

            name: name.trim(),

            email: email.trim(),

            phone: phone
                ? phone.trim()
                : "",

            service: service.trim(),

            budget: budget
                ? budget.trim()
                : "",

            message: message.trim(),

            status: "novo",

            createdAt: new Date().toISOString()

        };


        /*
         * SALVA
         */

        messages.push(newMessage);

        fs.writeFileSync(
            MESSAGES_FILE,
            JSON.stringify(messages, null, 2),
            "utf8"
        );


        /*
         * RESPOSTA
         */

        console.log("");
        console.log("=================================");
        console.log("NOVA SOLICITAÇÃO");
        console.log("=================================");
        console.log(`Nome: ${newMessage.name}`);
        console.log(`E-mail: ${newMessage.email}`);
        console.log(`Serviço: ${newMessage.service}`);
        console.log("=================================");
        console.log("");


        res.status(201).json({

            success: true,

            message:
                "Solicitação enviada com sucesso.",

            id: newMessage.id

        });


    } catch (error) {

        console.error(
            "Erro ao processar contato:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Erro interno do servidor."

        });

    }

});




/*
 * ADMIN — LOGIN
 */


/*
 * LOGIN GERAL DA FROST DEV
 */

app.get("/login", (req, res) => {

    if (req.session.userId) {

        if (
            req.session.user &&
            (
                req.session.user.role === "CEO" ||
                req.session.user.role === "ADMINISTRADOR"
            )
        ) {

            return res.redirect("/admin/");

        }

        return res.redirect("/dashboard/");

    }

    res.sendFile(
        path.join(
            __dirname,
            "public",
            "login.html"
        )
    );

});


/*
 * API — LOGIN GERAL
 */

app.post("/api/login", (req, res) => {

    const {
        username,
        password
    } = req.body;


    if (!username || !password) {

        return res.status(400).json({
            success: false,
            message: "Informe usuário/e-mail e senha."
        });

    }


    const usersFile =
        path.join(
            __dirname,
            "database",
            "users.json"
        );


    if (!fs.existsSync(usersFile)) {

        return res.status(500).json({
            success: false,
            message: "Banco de usuários não encontrado."
        });

    }


    let users;

    try {

        users =
            JSON.parse(
                fs.readFileSync(
                    usersFile,
                    "utf8"
                )
            );

    } catch (error) {

        console.error(
            "Erro ao ler usuários:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Erro ao carregar usuários."
        });

    }


    const identifier =
        username
            .trim()
            .toLowerCase();


    const user =
        users.find(item =>
            item.username &&
            item.username.toLowerCase() === identifier
            ||
            item.email &&
            item.email.toLowerCase() === identifier
        );


    if (!user || !user.active) {

        return res.status(401).json({
            success: false,
            message: "Usuário ou senha incorretos."
        });

    }


    let passwordValid = false;


    if (
        user.passwordHash &&
        user.passwordSalt
    ) {

        passwordValid =
            verifyPassword(
                password,
                user.passwordHash,
                user.passwordSalt
            );

    }


    if (
        !passwordValid &&
        user.password
    ) {

        passwordValid =
            password === user.password;

    }


    if (!passwordValid) {

        return res.status(401).json({
            success: false,
            message: "Usuário ou senha incorretos."
        });

    }


    req.session.userId =
        user.id;


    req.session.user =
        {
            id: user.id,
            name: user.name,
            username: user.username,
            email: user.email,
            role: user.role
        };


    let redirect =
        "/dashboard/";


    if (
        user.role === "CEO" ||
        user.role === "ADMINISTRADOR"
    ) {

        redirect =
            "/admin/";

    }


    res.json({

        success: true,

        user: req.session.user,

        redirect: redirect

    });

});



app.get("/admin/login", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "admin",
            "login.html"
        )
    );

});


app.post("/api/admin/login", (req, res) => {

    const {
        username,
        password
    } = req.body;


    if (!username || !password) {

        return res.status(400).json({
            success: false,
            message: "Informe usuário/e-mail e senha."
        });

    }


    const usersFile =
        path.join(
            __dirname,
            "database",
            "users.json"
        );


    if (!fs.existsSync(usersFile)) {

        return res.status(500).json({
            success: false,
            message: "Banco de usuários não encontrado."
        });

    }


    const users =
        JSON.parse(
            fs.readFileSync(
                usersFile,
                "utf8"
            )
        );


    const identifier =
        username.trim().toLowerCase();


    const user =
        users.find(item =>
            item.username.toLowerCase() === identifier ||
            item.email.toLowerCase() === identifier
        );


    if (!user || !user.active) {

        return res.status(401).json({
            success: false,
            message: "Usuário ou senha incorretos."
        });

    }


    let passwordValid = false;


    if (
        user.passwordHash &&
        user.passwordSalt
    ) {

        passwordValid =
            verifyPassword(
                password,
                user.passwordHash,
                user.passwordSalt
            );

    }


    if (
        !passwordValid &&
        user.password
    ) {

        passwordValid =
            password === user.password;

    }


    if (!passwordValid) {

        return res.status(401).json({
            success: false,
            message: "Usuário ou senha incorretos."
        });

    }


    req.session.userId =
        user.id;


    req.session.user =
        {
            id: user.id,
            name: user.name,
            username: user.username,
            email: user.email,
            role: user.role
        };


    res.json({
        success: true,
        user: req.session.user
    });

});


/*
 * ADMIN — CADASTRO DE NOVOS MEMBROS
 */

const crypto = require("crypto");

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {

    const hash = crypto
        .scryptSync(password, salt, 64)
        .toString("hex");

    return {
        salt,
        hash
    };

}


function verifyPassword(password, storedHash, salt) {

    const hash = crypto
        .scryptSync(password, salt, 64)
        .toString("hex");

    return crypto.timingSafeEqual(
        Buffer.from(hash, "hex"),
        Buffer.from(storedHash, "hex")
    );

}



/*
 * API — VALIDAR CONVITE
 */

app.post("/api/invites/validate", (req, res) => {

    try {

        const code =
            String(
                req.body.code || ""
            )
            .trim()
            .toUpperCase();


        if (!code) {

            return res.status(400).json({
                success: false,
                message: "Informe o código de convite."
            });

        }


        const invitesFile =
            path.join(
                __dirname,
                "database",
                "invites.json"
            );


        if (!fs.existsSync(invitesFile)) {

            return res.status(404).json({
                success: false,
                message: "Nenhum convite encontrado."
            });

        }


        const content =
            fs.readFileSync(
                invitesFile,
                "utf8"
            );


        const invites =
            content
                ? JSON.parse(content)
                : [];


        const invite =
            invites.find(item =>
                String(item.code)
                    .toUpperCase() === code &&
                item.used === false
            );


        if (!invite) {

            return res.status(403).json({
                success: false,
                message:
                    "Código de convite inválido ou já utilizado."
            });

        }


        res.json({

            success: true,

            invite: {
                code: invite.code,
                role: invite.role
            }

        });


    } catch (error) {

        console.error(
            "Erro ao validar convite:",
            error
        );


        res.status(500).json({
            success: false,
            message:
                "Erro ao validar convite."
        });

    }

});



/*
 * PÁGINA — CRIAR IDENTIDADE
 */

app.get("/admin/register", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "admin",
            "register.html"
        )
    );

});

app.post("/api/admin/register", (req, res) => {

    const {
        name,
        username,
        email,
        password,
        inviteCode,
        role
    } = req.body;


    if (
        !name ||
        !username ||
        !email ||
        !password
    ) {

        return res.status(400).json({
            success: false,
            message: "Preencha todos os campos."
        });

    }


    if (password.length < 8) {

        return res.status(400).json({
            success: false,
            message:
                "A senha deve ter pelo menos 8 caracteres."
        });

    }


    /*
     * CADASTRO POR CONVITE
     */

    let invite = null;


    if (inviteCode) {

        const invitesFile =
            path.join(
                __dirname,
                "database",
                "invites.json"
            );


        if (!fs.existsSync(invitesFile)) {

            return res.status(404).json({
                success: false,
                message:
                    "Banco de convites não encontrado."
            });

        }


        const invites =
            JSON.parse(
                fs.readFileSync(
                    invitesFile,
                    "utf8"
                )
            );


        const normalizedCode =
            inviteCode
                .trim()
                .toUpperCase();


        invite =
            invites.find(item =>
                String(item.code)
                    .toUpperCase() ===
                    normalizedCode &&
                item.used === false
            );


        if (!invite) {

            return res.status(403).json({
                success: false,
                message:
                    "Código de convite inválido ou já utilizado."
            });

        }

    }


    /*
     * CADASTRO NORMAL
     *
     * Só CEO ou ADMINISTRADOR.
     */

    if (!invite) {

        if (!req.session.userId) {

            return res.status(401).json({
                success: false,
                message:
                    "Faça login para criar uma identidade."
            });

        }


        if (
            !req.session.user ||
            (
                req.session.user.role !== "CEO" &&
                req.session.user.role !==
                    "ADMINISTRADOR"
            )
        ) {

            return res.status(403).json({
                success: false,
                message:
                    "Apenas CEO ou Administrador pode criar identidades."
            });

        }


        const allowedRoles = [
            "MEMBRO",
            "DESENVOLVEDOR",
            "DESIGNER",
            "ADMINISTRADOR"
        ];


        if (!allowedRoles.includes(role)) {

            return res.status(400).json({
                success: false,
                message: "Cargo inválido."
            });

        }

    }


    const usersFile =
        path.join(
            __dirname,
            "database",
            "users.json"
        );


    if (!fs.existsSync(usersFile)) {

        return res.status(500).json({
            success: false,
            message:
                "Banco de usuários não encontrado."
        });

    }


    const users =
        JSON.parse(
            fs.readFileSync(
                usersFile,
                "utf8"
            )
        );


    const normalizedUsername =
        username
            .trim()
            .toLowerCase();


    const normalizedEmail =
        email
            .trim()
            .toLowerCase();


    const existingUser =
        users.find(user =>
            (
                user.username &&
                user.username.toLowerCase() ===
                    normalizedUsername
            )
            ||
            (
                user.email &&
                user.email.toLowerCase() ===
                    normalizedEmail
            )
        );


    if (existingUser) {

        return res.status(409).json({
            success: false,
            message:
                "Usuário ou e-mail já cadastrado."
        });

    }


    const passwordData =
        hashPassword(password);


    const user = {

        id:
            crypto.randomUUID(),

        name:
            name.trim(),

        username:
            normalizedUsername,

        email:
            normalizedEmail,

        passwordHash:
            passwordData.hash,

        passwordSalt:
            passwordData.salt,

        role:
            invite
                ? (
                    invite.role ||
                    "MEMBRO"
                )
                : role,

        avatar:
            "",

        active:
            true,

        createdAt:
            new Date().toISOString()

    };


    users.push(user);


    /*
     * CONSUME O CONVITE
     */

    if (invite) {

        const invitesFile =
            path.join(
                __dirname,
                "database",
                "invites.json"
            );


        const invites =
            JSON.parse(
                fs.readFileSync(
                    invitesFile,
                    "utf8"
                )
            );


        const storedInvite =
            invites.find(item =>
                item.code === invite.code &&
                item.used === false
            );


        if (!storedInvite) {

            return res.status(409).json({
                success: false,
                message:
                    "Este convite acabou de ser utilizado."
            });

        }


        storedInvite.used =
            true;

        storedInvite.usedBy =
            user.id;

        storedInvite.usedAt =
            new Date().toISOString();


        fs.writeFileSync(
            invitesFile,
            JSON.stringify(
                invites,
                null,
                4
            )
        );

    }


    fs.writeFileSync(
        usersFile,
        JSON.stringify(
            users,
            null,
            4
        )
    );


    res.status(201).json({

        success:
            true,

        message:
            "Identidade criada com sucesso."

    });

});


/*
 * ADMIN — EQUIPE
 */

function requireCEO(req, res, next) {

    if (!req.session.userId) {

        return res.status(401).json({
            success: false,
            message: "Não autenticado."
        });

    }

    if (
        !req.session.user ||
        req.session.user.role !== "CEO"
    ) {

        return res.status(403).json({
            success: false,
            message: "Apenas o CEO pode realizar esta ação."
        });

    }

    next();

}


/*
 * LISTAR EQUIPE
 */

app.get("/api/admin/team", requireAdmin, (req, res) => {

    try {

        const usersFile =
            path.join(
                __dirname,
                "database",
                "users.json"
            );

        if (!fs.existsSync(usersFile)) {
            return res.json([]);
        }

        const users =
            JSON.parse(
                fs.readFileSync(
                    usersFile,
                    "utf8"
                )
            );

        const team =
            users.map(user => ({
                id: user.id,
                name: user.name,
                username: user.username,
                email: user.email,
                role: user.role,
                avatar: user.avatar || "",
                active: user.active,
                createdAt: user.createdAt
            }));

        res.json(team);

    } catch (error) {

        console.error(
            "Erro ao carregar equipe:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Erro ao carregar equipe."
        });

    }

});


/*
 * GERAR CONVITE
 */

app.post("/api/admin/invites", requireCEO, (req, res) => {

    try {

        const role =
            req.body.role;


        const allowedRoles = [
            "MEMBRO",
            "DESENVOLVEDOR",
            "DESIGNER",
            "ADMINISTRADOR"
        ];


        if (!allowedRoles.includes(role)) {

            return res.status(400).json({
                success: false,
                message: "Cargo inválido."
            });

        }


        const invitesFile =
            path.join(
                __dirname,
                "database",
                "invites.json"
            );


        let invites = [];


        if (fs.existsSync(invitesFile)) {

            const content =
                fs.readFileSync(
                    invitesFile,
                    "utf8"
                );

            invites =
                content
                    ? JSON.parse(content)
                    : [];

        }


        let code;


        do {

            code =
                "FROST-" +
                crypto
                    .randomBytes(5)
                    .toString("hex")
                    .toUpperCase();

        } while (
            invites.some(
                invite =>
                    invite.code === code
            )
        );


        const invite = {

            code: code,

            role: role,

            used: false,

            createdBy:
                req.session.userId,

            createdAt:
                new Date().toISOString()

        };


        invites.push(invite);


        fs.writeFileSync(
            invitesFile,
            JSON.stringify(
                invites,
                null,
                4
            )
        );


        res.status(201).json({
            success: true,
            invite: invite
        });


    } catch (error) {

        console.error(
            "Erro ao gerar convite:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Erro ao gerar convite."
        });

    }

});



app.post("/api/admin/logout", (req, res) => {

    req.session.destroy(() => {

        res.json({
            success: true
        });

    });

});


/*
 * MIDDLEWARE ADMIN
 */

function requireAdmin(req, res, next) {

    if (!req.session.userId) {

        if (req.path.startsWith("/api/")) {

            return res.status(401).json({
                success: false,
                message: "Não autenticado."
            });

        }

        return res.redirect(
            "/admin/login"
        );

    }

    next();

}


/*
 * PROTEGE O PAINEL
 */


/*
 * USUÁRIO AUTENTICADO
 */

app.get("/api/me", (req, res) => {

    if (!req.session.userId) {

        return res.status(401).json({
            success: false,
            message: "Não autenticado."
        });

    }

    res.json({
        success: true,
        user: req.session.user
    });

});


/*
 * ÁREA DOS MEMBROS
 */

app.get("/dashboard/", requireAdmin, (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "dashboard",
            "index.html"
        )
    );

});


app.get("/admin/team", requireAdmin, (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "admin",
            "team.html"
        )
    );

});


app.get("/admin/", requireAdmin, (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "admin",
            "index.html"
        )
    );

});


app.get("/admin", requireAdmin, (req, res) => {

    res.redirect("/admin/");

});


/*
 * API — LISTAR SOLICITAÇÕES
 */

app.get("/api/messages", requireAdmin, (req, res) => {

    try {

        if (!fs.existsSync(MESSAGES_FILE)) {
            return res.json([]);
        }

        const file = fs.readFileSync(
            MESSAGES_FILE,
            "utf8"
        );

        const messages = file
            ? JSON.parse(file)
            : [];

        res.json(messages);

    } catch (error) {

        console.error(
            "Erro ao carregar mensagens:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Erro ao carregar solicitações."
        });

    }

});


/*
 * SERVIDOR
 */



/*
 * NASA API — ASTRONOMY PICTURE OF THE DAY
 */

app.get("/api/nasa/apod", async (req, res) => {

    try {

        const apiKey = process.env.NASA_API_KEY;

        if (!apiKey) {

            return res.status(500).json({
                success: false,
                message: "NASA_API_KEY não configurada."
            });

        }

        const response = await fetch(
            `https://api.nasa.gov/planetary/apod?api_key=${encodeURIComponent(apiKey)}`
        );

        const data = await response.json();

        if (!response.ok) {

            return res.status(response.status).json({
                success: false,
                message:
                    data.error?.message ||
                    "Erro ao consultar a NASA API."
            });

        }

        res.json({
            success: true,
            data
        });

    } catch (error) {

        console.error(
            "Erro NASA API:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Erro interno ao consultar a NASA API."
        });

    }

});


app.listen(PORT, () => {

    console.log("");
    console.log("=================================");
    console.log("          FROST DEV");
    console.log("=================================");
    console.log(`Servidor: http://localhost:${PORT}`);
    console.log("Status: ONLINE");
    console.log("=================================");
    console.log("");

});
