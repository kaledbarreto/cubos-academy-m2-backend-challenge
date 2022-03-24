const { format } = require('date-fns');
const bancodedados = require('../bancodedados');

const msg_01 = 'A senha informada é inválida.';
const msg_02 = 'É necessário o preenchimento de todos os campos.';
const msg_03 = 'Já existe uma conta com o cpf ou e-mail informado.';
const msg_04 = 'O número da conta informado é inválido.';
const msg_05 = 'A conta só pode ser excluida se o saldo da mesma for zero.';
const msg_06 = 'O valor do deposito deve ser superior a 0 (Zero).'
const msg_07 = 'Não há saldo disponível para realizar a operação.';

const listarContasBancarias = (req, res) => {
  if (!req.query.senha_banco || req.query.senha_banco !== bancodedados.banco.senha) {
    return res.status(401).send({ mensagem: msg_01 });
  } else {
    return res.status(200).send(bancodedados.contas);
  }
}

let num = 1;
const criarContaBancaria = (req, res) => {
  if (!req.body.nome || !req.body.cpf || !req.body.data_nascimento || !req.body.telefone || !req.body.email || !req.body.senha) {
    return res.status(400).send({ mensagem: msg_02 });
  }

  const found = bancodedados.contas.find(function (conta) {
    return conta.usuario.cpf === req.body.cpf || conta.usuario.email === req.body.email;
  });

  if (found) {
    return res.status(400).send({ mensagem: msg_03 });
  }

  bancodedados.contas.push({
    numero: num,
    saldo: 0,
    usuario: {
      nome: req.body.nome,
      cpf: req.body.cpf,
      data_nascimento: req.body.data_nascimento,
      telefone: req.body.telefone,
      email: req.body.email,
      senha: req.body.senha
    }
  });
  num++;
  return res.status(201).send();
}

const atualizarUsuarioDaContaBancaria = (req, res) => {
  id = bancodedados.contas.findIndex((c) => c.numero === Number(req.params.numeroConta));

  if (!req.body.nome || !req.body.cpf || !req.body.data_nascimento || !req.body.telefone || !req.body.email || !req.body.senha) {
    return res.status(400).send({ mensagem: msg_02 });
  }

  for (let i = 0; i < bancodedados.contas.length; i++) {
    if (req.body.cpf === bancodedados.contas[i].usuario.cpf && bancodedados.contas[i].numero !== Number(req.params.numeroConta) || req.body.email === bancodedados.contas[i].usuario.email && bancodedados.contas[i].numero !== Number(req.params.numeroConta)) {
      return res.status(400).send({ mensagem: msg_03 });
    }
  }

  if (!bancodedados.contas[id]) {
    return res.status(404).send({ mensagem: msg_04 });
  } else {
    bancodedados.contas[id].usuario = {
      nome: req.body.nome,
      cpf: req.body.cpf,
      data_nascimento: req.body.data_nascimento,
      telefone: req.body.telefone,
      email: req.body.email,
      senha: req.body.senha
    }
    return res.status(204).send();
  }
}

const excluirConta = (req, res) => {
  id = bancodedados.contas.findIndex((c) => c.numero === Number(req.params.numeroConta));

  if (!bancodedados.contas[id]) {
    return res.status(404).send({ mensagem: msg_04 });
  }

  if (bancodedados.contas[id].saldo !== 0) {
    return res.status(400).send({ mensagem: msg_05 });
  } else {
    const conta = bancodedados.contas[id];

    const indice = bancodedados.contas.indexOf(conta);

    bancodedados.contas.splice(indice, 1);
    return res.status(204).send();
  }
}

const depositar = (req, res) => {
  id = bancodedados.contas.findIndex((c) => c.numero === Number(req.body.numero_conta));

  if (!bancodedados.contas[id]) {
    return res.status(404).send({ mensagem: msg_04 });
  }

  if (!req.body.numero_conta || req.body.valor === '') {
    return res.status(400).send({ mensagem: msg_02 });
  }

  if (req.body.valor <= 0) {
    return res.status(400).send({ mensagem: msg_06 });
  }

  bancodedados.contas[id].saldo += req.body.valor;

  const dataAtual = format(new Date(), "yyyy-mm-dd HH:mm:ss");

  bancodedados.depositos.push({
    data: dataAtual,
    numero_conta: req.body.numero_conta,
    valor: req.body.valor
  });
  return res.status(204).send();
}

const sacar = (req, res) => {
  id = bancodedados.contas.findIndex((c) => c.numero === Number(req.body.numero_conta));

  if (!req.body.numero_conta || req.body.valor === '' || !req.body.senha) {
    return res.status(400).send({ mensagem: msg_02 });
  }

  if (!bancodedados.contas[id]) {
    return res.status(404).send({ mensagem: msg_04 });
  }

  if (bancodedados.contas[id].usuario.senha !== req.body.senha) {
    return res.status(401).send({ mensagem: msg_01 });
  }

  if (bancodedados.contas[id].saldo < req.body.valor) {
    return res.status(400).send({ mensagem: msg_07 });
  }

  if (req.body.valor <= 0) {
    return res.status(400).send({ mensagem: msg_06 });
  }

  bancodedados.contas[id].saldo -= req.body.valor;

  const dataAtual = format(new Date(), "yyyy-mm-dd HH:mm:ss");

  bancodedados.saques.push({
    data: dataAtual,
    numero_conta: req.body.numero_conta,
    valor: req.body.valor
  });
  return res.status(204).send();
}

const transferir = (req, res) => {
  id_origem = bancodedados.contas.findIndex((c) => c.numero === Number(req.body.numero_conta_origem));
  id_destino = bancodedados.contas.findIndex((c) => c.numero === Number(req.body.numero_conta_destino));

  if (!req.body.numero_conta_origem || !req.body.numero_conta_destino || req.body.valor === '' || !req.body.senha) {
    return res.status(400).send({ mensagem: msg_02 });
  }

  if (!bancodedados.contas[id_origem] || !bancodedados.contas[id_destino]) {
    return res.status(404).send({ mensagem: msg_04 });
  }

  if (bancodedados.contas[id_origem].usuario.senha !== req.body.senha) {
    return res.status(401).send({ mensagem: msg_01 });
  }

  if (bancodedados.contas[id_origem].saldo < req.body.valor) {
    return res.status(400).send({ mensagem: msg_07 });
  }

  bancodedados.contas[id_origem].saldo -= req.body.valor;
  bancodedados.contas[id_destino].saldo += req.body.valor;

  const dataAtual = format(new Date(), "yyyy-mm-dd HH:mm:ss");

  bancodedados.transferencias.push({
    data: dataAtual,
    numero_conta_origem: req.body.numero_conta_origem,
    numero_conta_destino: req.body.numero_conta_destino,
    valor: req.body.valor
  });
  return res.status(204).send();
}

const saldo = (req, res) => {
  id = bancodedados.contas.findIndex((c) => c.numero === Number(req.query.numero_conta));

  if (!req.query.numero_conta || !req.query.senha) {
    return res.status(400).send({ mensagem: msg_02 });
  }

  if (!bancodedados.contas[id]) {
    return res.status(404).send({ mensagem: msg_04 });
  }

  if (bancodedados.contas[id].usuario.senha !== req.query.senha) {
    return res.status(401).send({ mensagem: msg_01 });
  }

  return res.status(200).send({ saldo: bancodedados.contas[id].saldo });
}

const extrato = (req, res) => {
  id = bancodedados.contas.findIndex((c) => c.numero === Number(req.query.numero_conta));

  if (!req.query.numero_conta || !req.query.senha) {
    return res.status(400).send({ mensagem: msg_02 });
  }

  if (!bancodedados.contas[id]) {
    return res.status(400).send({ mensagem: msg_04 });
  }

  if (bancodedados.contas[id].usuario.senha !== req.query.senha) {
    return res.status(400).send({ mensagem: msg_01 });
  }

  const depositoArr = [];
  for (let i = 0; i < bancodedados.depositos.length; i++) {
    if (req.query.numero_conta === bancodedados.depositos[i].numero_conta) {
      depositoArr.push(bancodedados.depositos[i]);
    }
  }

  const saqueArr = [];
  for (let i = 0; i < bancodedados.saques.length; i++) {
    if (req.query.numero_conta === bancodedados.saques[i].numero_conta) {
      saqueArr.push(bancodedados.saques[i]);
    }
  }

  const transferenciasEnviadasArr = [];
  for (let i = 0; i < bancodedados.transferencias.length; i++) {
    if (req.query.numero_conta === bancodedados.transferencias[i].numero_conta_origem) {
      transferenciasEnviadasArr.push(bancodedados.transferencias[i]);
    }
  }

  const transferenciasRecebidasArr = [];
  for (let i = 0; i < bancodedados.transferencias.length; i++) {
    if (req.query.numero_conta === bancodedados.transferencias[i].numero_conta_destino) {
      transferenciasRecebidasArr.push(bancodedados.transferencias[i]);
    }
  }
  return res.status(200).send({
    depositos: depositoArr,
    saques: saqueArr,
    transferenciasEnviadas: transferenciasEnviadasArr,
    transferenciasRecebidas: transferenciasRecebidasArr
  });
}

module.exports = {
  listarContasBancarias,
  criarContaBancaria,
  atualizarUsuarioDaContaBancaria,
  excluirConta,
  depositar,
  sacar,
  transferir,
  saldo,
  extrato
}