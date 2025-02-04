import { fastify } from 'fastify';
import cors from '@fastify/cors';
import { randomUUID } from "crypto";
import { sql } from './db.js';

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
    
    // Converter data para o formato correto (YYYY-MM-DD)
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

server.listen({ port: 3000 }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`🚀 Servidor rodando em ${address}`);
});
