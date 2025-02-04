import { fastify } from 'fastify';
import cors from '@fastify/cors';
import postgres from 'postgres';
import { randomUUID } from "crypto";
import dotenv from 'dotenv';

dotenv.config(); // Carregar variáveis de ambiente localmente

// Conectar ao banco de dados PostgreSQL (local ou Neon)
const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

const server = fastify();

// Configuração do CORS
server.register(cors, {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
});

// Rota para adicionar um gasto
server.post('/gasto', async (request, reply) => {
    const { descricao, valor, data } = request.body;
    const id = randomUUID();
    
    const dataFormatada = new Date(data).toISOString().split('T')[0];

    await sql`
        INSERT INTO gastos (id, descricao, valor, data) 
        VALUES (${id}, ${descricao}, ${valor}, ${dataFormatada})
    `;

    return reply.status(200).send({ message: '✅ Gasto salvo com sucesso!', ok: true });
});

// Rota para buscar todos os gastos
server.get('/gastos', async () => {
    return await sql`SELECT * FROM gastos ORDER BY data DESC`;
});

// Rota para buscar gastos por mês e ano
server.get('/gastos/:ano/:mes', async (request) => {
    const { ano, mes } = request.params;

    return await sql`
        SELECT * FROM gastos 
        WHERE EXTRACT(YEAR FROM data) = ${ano} 
        AND EXTRACT(MONTH FROM data) = ${mes} 
        ORDER BY data DESC
    `;
});

// Rota para obter o total gasto por ano
server.get('/total-gastos/:ano', async (request) => {
    const { ano } = request.params;

    const result = await sql`
        SELECT COALESCE(SUM(valor), 0) AS total 
        FROM gastos 
        WHERE EXTRACT(YEAR FROM data) = ${ano}
    `;

    return result[0];
});

// Rota para obter o total gasto por mês
server.get('/total-gastos/:ano/:mes', async (request) => {
    const { ano, mes } = request.params;

    const result = await sql`
        SELECT COALESCE(SUM(valor), 0) AS total 
        FROM gastos 
        WHERE EXTRACT(YEAR FROM data) = ${ano} 
        AND EXTRACT(MONTH FROM data) = ${mes}
    `;

    return result[0];
});

server.listen({ port: process.env.PORT || 3000, host: '0.0.0.0' }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`🚀 Servidor rodando na porta ${process.env.PORT || 3000}`);
});
