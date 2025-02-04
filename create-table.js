import { sql } from './db.js';

sql`
  CREATE TABLE gastos (
      id TEXT PRIMARY KEY,
      descricao VARCHAR(255),
      valor NUMERIC(10,2),
      data DATE
  );
`.then(() => {
  console.log('✅ Tabela gastos criada com sucesso!');
});
