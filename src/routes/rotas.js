const express = require('express');
const banco = require('../controllers/banco');

const rotas = express();

rotas.get('/contas', banco.listarContasBancarias);
rotas.post('/contas', banco.criarContaBancaria);
rotas.put('/contas/:numeroConta/usuario', banco.atualizarUsuarioDaContaBancaria);
rotas.delete('/contas/:numeroConta', banco.excluirConta);
rotas.post('/transacoes/depositar', banco.depositar);
rotas.post('/transacoes/sacar', banco.sacar);
rotas.post('/transacoes/transferir', banco.transferir);
rotas.get('/contas/saldo', banco.saldo);
rotas.get('/contas/extrato', banco.extrato);

module.exports = rotas;