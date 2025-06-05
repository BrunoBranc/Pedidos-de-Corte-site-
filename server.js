
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.'));

// Arquivos de dados
const PEDIDOS_FILE = path.join(__dirname, 'data', 'pedidos.json');
const MATERIAIS_FILE = path.join(__dirname, 'data', 'materiais.json');

// Criar diretório data se não existir
if (!fs.existsSync('data')) {
  fs.mkdirSync('data');
}

// Funções auxiliares para ler/escrever arquivos
function lerArquivo(arquivo, padrao = []) {
  try {
    if (fs.existsSync(arquivo)) {
      const data = fs.readFileSync(arquivo, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error(`Erro ao ler arquivo ${arquivo}:`, error);
  }
  return padrao;
}

function escreverArquivo(arquivo, dados) {
  try {
    fs.writeFileSync(arquivo, JSON.stringify(dados, null, 2));
    return true;
  } catch (error) {
    console.error(`Erro ao escrever arquivo ${arquivo}:`, error);
    return false;
  }
}

// Rotas para Pedidos
app.get('/api/pedidos', (req, res) => {
  const pedidos = lerArquivo(PEDIDOS_FILE);
  res.json(pedidos);
});

app.post('/api/pedidos', (req, res) => {
  const pedidos = lerArquivo(PEDIDOS_FILE);
  const novoPedido = {
    ...req.body,
    id: Date.now().toString(),
    dataHora: new Date().toLocaleString('pt-BR')
  };
  
  // Verificar se já existe pedido com mesmo número
  const numeroExiste = pedidos.some(pedido => pedido.numero === novoPedido.numero);
  if (numeroExiste) {
    return res.status(400).json({ 
      error: `Já existe um pedido com o número "${novoPedido.numero}"` 
    });
  }
  
  pedidos.push(novoPedido);
  
  if (escreverArquivo(PEDIDOS_FILE, pedidos)) {
    res.status(201).json(novoPedido);
  } else {
    res.status(500).json({ error: 'Erro ao salvar pedido' });
  }
});

app.put('/api/pedidos/:id', (req, res) => {
  const pedidos = lerArquivo(PEDIDOS_FILE);
  const pedidoIndex = pedidos.findIndex(p => p.id === req.params.id);
  
  if (pedidoIndex === -1) {
    return res.status(404).json({ error: 'Pedido não encontrado' });
  }
  
  // Verificar duplicação de número (exceto o próprio pedido)
  const numeroExiste = pedidos.some((pedido, index) => 
    index !== pedidoIndex && pedido.numero === req.body.numero
  );
  
  if (numeroExiste) {
    return res.status(400).json({ 
      error: `Já existe um pedido com o número "${req.body.numero}"` 
    });
  }
  
  pedidos[pedidoIndex] = { ...pedidos[pedidoIndex], ...req.body };
  
  if (escreverArquivo(PEDIDOS_FILE, pedidos)) {
    res.json(pedidos[pedidoIndex]);
  } else {
    res.status(500).json({ error: 'Erro ao atualizar pedido' });
  }
});

app.delete('/api/pedidos/:id', (req, res) => {
  const pedidos = lerArquivo(PEDIDOS_FILE);
  const pedidoIndex = pedidos.findIndex(p => p.id === req.params.id);
  
  if (pedidoIndex === -1) {
    return res.status(404).json({ error: 'Pedido não encontrado' });
  }
  
  pedidos.splice(pedidoIndex, 1);
  
  if (escreverArquivo(PEDIDOS_FILE, pedidos)) {
    res.json({ message: 'Pedido removido com sucesso' });
  } else {
    res.status(500).json({ error: 'Erro ao remover pedido' });
  }
});

// Rotas para Materiais
app.get('/api/materiais', (req, res) => {
  const materiais = lerArquivo(MATERIAIS_FILE);
  res.json(materiais);
});

app.post('/api/materiais', (req, res) => {
  const materiais = lerArquivo(MATERIAIS_FILE);
  const novoMaterial = {
    ...req.body,
    id: Date.now().toString(),
    dataHora: new Date().toLocaleString('pt-BR')
  };
  
  materiais.push(novoMaterial);
  
  if (escreverArquivo(MATERIAIS_FILE, materiais)) {
    res.status(201).json(novoMaterial);
  } else {
    res.status(500).json({ error: 'Erro ao salvar material' });
  }
});

app.put('/api/materiais/:id', (req, res) => {
  const materiais = lerArquivo(MATERIAIS_FILE);
  const materialIndex = materiais.findIndex(m => m.id === req.params.id);
  
  if (materialIndex === -1) {
    return res.status(404).json({ error: 'Material não encontrado' });
  }
  
  materiais[materialIndex] = { ...materiais[materialIndex], ...req.body };
  
  if (escreverArquivo(MATERIAIS_FILE, materiais)) {
    res.json(materiais[materialIndex]);
  } else {
    res.status(500).json({ error: 'Erro ao atualizar material' });
  }
});

app.delete('/api/materiais/:id', (req, res) => {
  const materiais = lerArquivo(MATERIAIS_FILE);
  const materialIndex = materiais.findIndex(m => m.id === req.params.id);
  
  if (materialIndex === -1) {
    return res.status(404).json({ error: 'Material não encontrado' });
  }
  
  materiais.splice(materialIndex, 1);
  
  if (escreverArquivo(MATERIAIS_FILE, materiais)) {
    res.json({ message: 'Material removido com sucesso' });
  } else {
    res.status(500).json({ error: 'Erro ao remover material' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando em http://0.0.0.0:${PORT}`);
});
