const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { exec, spawn } = require('child_process');
const WebSocket = require('ws');
const cron = require('node-cron');

const app = express();
const port = process.env.PORT || 3333;

// WebSocket server for real-time updates
const wss = new WebSocket.Server({ port: process.env.WS_PORT || 3334 });

// Middleware
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Utility function to execute ord commands
const executeOrdCommand = (command, args = []) => {
  return new Promise((resolve, reject) => {
    // Verify ord binary exists
    if (!fs.existsSync('/usr/local/bin/ord')) {
      reject(new Error('ord binary not found. Please ensure ord is installed.'));
      return;
    }

    const ordCommand = spawn('ord', command.split(' ').concat(args), {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        BITCOIN_RPC_URL: `http://${process.env.BITCOIN_RPC_USER}:${process.env.BITCOIN_RPC_PASS}@${process.env.BITCOIN_RPC_HOST}:${process.env.BITCOIN_RPC_PORT}`,
        ORD_DATADIR: process.env.ORD_DATADIR || '/app/wallets'
      }
    });

    let stdout = '';
    let stderr = '';

    ordCommand.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    ordCommand.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    ordCommand.on('close', (code) => {
      if (code === 0) {
        resolve(stdout.trim());
      } else {
        reject(new Error(stderr || `Command failed with code ${code}`));
      }
    });
  });
};

// Broadcast to all WebSocket clients
const broadcast = (data) => {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

// API Routes

// Get wallet balance
app.get('/api/wallet/balance', async (req, res) => {
  try {
    const balance = await executeOrdCommand('wallet balance');
    res.json({ success: true, balance });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get wallet addresses
app.get('/api/wallet/addresses', async (req, res) => {
  try {
    const addresses = await executeOrdCommand('wallet addresses');
    res.json({ success: true, addresses: addresses.split('\n') });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get receive address
app.get('/api/wallet/receive', async (req, res) => {
  try {
    const address = await executeOrdCommand('wallet receive');
    res.json({ success: true, address });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get inscriptions with detailed info
app.get('/api/wallet/inscriptions', async (req, res) => {
  try {
    const inscriptionsRaw = await executeOrdCommand('wallet inscriptions');
    const inscriptionIds = inscriptionsRaw.split('\n').filter(i => i.trim());
    
    // Get detailed info for each inscription
    const inscriptions = [];
    for (const id of inscriptionIds) {
      try {
        const info = await executeOrdCommand(`inscription ${id}`);
        inscriptions.push({
          id,
          info: JSON.parse(info)
        });
      } catch (error) {
        inscriptions.push({
          id,
          info: null,
          error: error.message
        });
      }
    }
    
    res.json({ success: true, inscriptions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get specific inscription details
app.get('/api/inscription/:id', async (req, res) => {
  try {
    const info = await executeOrdCommand(`inscription ${req.params.id}`);
    res.json({ success: true, inscription: JSON.parse(info) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get wallet outputs (UTXOs)
app.get('/api/wallet/outputs', async (req, res) => {
  try {
    const outputs = await executeOrdCommand('wallet outputs');
    res.json({ success: true, outputs: outputs.split('\n').filter(o => o) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get wallet sats
app.get('/api/wallet/sats', async (req, res) => {
  try {
    const sats = await executeOrdCommand('wallet sats');
    res.json({ success: true, sats: sats.split('\n').filter(s => s) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new wallet address
app.post('/api/wallet/create', async (req, res) => {
  try {
    const address = await executeOrdCommand('wallet create');
    res.json({ success: true, address });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send inscription
app.post('/api/wallet/send/inscription', async (req, res) => {
  try {
    const { inscriptionId, destination, feeRate = 5 } = req.body;
    
    if (!inscriptionId || !destination) {
      return res.status(400).json({ 
        success: false, 
        error: 'Inscription ID and destination are required' 
      });
    }

    const command = `wallet send --fee-rate ${feeRate} ${destination} ${inscriptionId}`;
    const result = await executeOrdCommand(command);
    
    broadcast({
      type: 'inscription_sent',
      inscriptionId,
      destination,
      result
    });

    res.json({ 
      success: true, 
      result,
      message: 'Inscription sent successfully'
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send sats
app.post('/api/wallet/send/sats', async (req, res) => {
  try {
    const { destination, amount, feeRate = 5 } = req.body;
    
    if (!destination || !amount) {
      return res.status(400).json({ 
        success: false, 
        error: 'Destination and amount are required' 
      });
    }

    const command = `wallet send --fee-rate ${feeRate} ${destination} ${amount}sat`;
    const result = await executeOrdCommand(command);
    
    broadcast({
      type: 'sats_sent',
      destination,
      amount,
      result
    });

    res.json({ 
      success: true, 
      result,
      message: 'Sats sent successfully'
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create batch inscription
app.post('/api/wallet/batch', upload.array('files'), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: 'No files uploaded' });
    }

    const {
      feeRate = 5,
      destination,
      postage = 10000,
      compress = false
    } = req.body;

    const batchFile = path.join(__dirname, 'uploads', `batch-${Date.now()}.yaml`);
    
    // Create batch YAML file
    let batchContent = 'mode: separate-outputs\n';
    if (destination) batchContent += `parent: ${destination}\n`;
    batchContent += 'inscriptions:\n';

    req.files.forEach((file, index) => {
      batchContent += `  - file: ${file.path}\n`;
      if (postage !== 10000) batchContent += `    postage: ${postage}\n`;
    });

    fs.writeFileSync(batchFile, batchContent);

    let command = `wallet batch --fee-rate ${feeRate} --batch ${batchFile}`;
    if (compress) command += ' --compress';

    const result = await executeOrdCommand(command);
    
    // Clean up files
    req.files.forEach(file => fs.unlinkSync(file.path));
    fs.unlinkSync(batchFile);

    broadcast({
      type: 'batch_inscription_completed',
      fileCount: req.files.length,
      result
    });

    res.json({ 
      success: true, 
      result,
      message: `Batch inscription of ${req.files.length} files created successfully`
    });

  } catch (error) {
    // Clean up files on error
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mint runes
app.post('/api/wallet/mint', async (req, res) => {
  try {
    const { rune, destination, feeRate = 5 } = req.body;
    
    if (!rune) {
      return res.status(400).json({ 
        success: false, 
        error: 'Rune name is required' 
      });
    }

    let command = `wallet mint --fee-rate ${feeRate} --rune ${rune}`;
    if (destination) command += ` --destination ${destination}`;

    const result = await executeOrdCommand(command);
    
    broadcast({
      type: 'rune_minted',
      rune,
      destination,
      result
    });

    res.json({ 
      success: true, 
      result,
      message: 'Rune minted successfully'
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Burn inscription
app.post('/api/wallet/burn', async (req, res) => {
  try {
    const { inscriptionId, feeRate = 5 } = req.body;
    
    if (!inscriptionId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Inscription ID is required' 
      });
    }

    const command = `wallet burn --fee-rate ${feeRate} ${inscriptionId}`;
    const result = await executeOrdCommand(command);
    
    broadcast({
      type: 'inscription_burned',
      inscriptionId,
      result
    });

    res.json({ 
      success: true, 
      result,
      message: 'Inscription burned successfully'
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Estimate fees (simplified - you'd want to integrate with mempool API)
app.get('/api/fees', async (req, res) => {
  try {
    // This is a simplified fee estimation
    // In production, integrate with mempool.space API or similar
    const fees = {
      slow: 1,
      medium: 5,
      fast: 10
    };
    res.json({ success: true, fees });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get wallet transactions
app.get('/api/wallet/transactions', async (req, res) => {
  try {
    const transactions = await executeOrdCommand('wallet transactions');
    res.json({ success: true, transactions: transactions.split('\n').filter(t => t) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get cardinals (non-inscription UTXOs)
app.get('/api/wallet/cardinals', async (req, res) => {
  try {
    const cardinals = await executeOrdCommand('wallet cardinals');
    res.json({ success: true, cardinals: cardinals.split('\n').filter(c => c) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Dump wallet data
app.get('/api/wallet/dump', async (req, res) => {
  try {
    const dump = await executeOrdCommand('wallet dump');
    res.json({ success: true, dump });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Restore wallet from dump
app.post('/api/wallet/restore', async (req, res) => {
  try {
    const { dumpData } = req.body;
    
    if (!dumpData) {
      return res.status(400).json({ 
        success: false, 
        error: 'Dump data is required' 
      });
    }

    // Write dump data to temporary file
    const dumpFile = path.join(__dirname, 'uploads', `dump-${Date.now()}.json`);
    fs.writeFileSync(dumpFile, dumpData);

    const result = await executeOrdCommand(`wallet restore ${dumpFile}`);
    
    // Clean up temp file
    fs.unlinkSync(dumpFile);

    res.json({ 
      success: true, 
      result,
      message: 'Wallet restored successfully'
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Wallet sign message
app.post('/api/wallet/sign', async (req, res) => {
  try {
    const { message, address } = req.body;
    
    if (!message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Message is required' 
      });
    }

    let command = `wallet sign '${message}'`;
    if (address) command += ` --address ${address}`;

    const signature = await executeOrdCommand(command);
    
    res.json({ 
      success: true, 
      signature,
      message: 'Message signed successfully'
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Upload and inscribe file
app.post('/api/inscribe', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const {
      feeRate = 5,
      metaprotocol,
      metadata,
      destination,
      postage = 10000,
      compress = false
    } = req.body;

    const filePath = req.file.path;
    
    // Build ord inscribe command
    let command = `wallet inscribe --fee-rate ${feeRate} --file ${filePath}`;
    
    if (destination) command += ` --destination ${destination}`;
    if (metaprotocol) command += ` --metaprotocol ${metaprotocol}`;
    if (metadata) command += ` --json-metadata ${metadata}`;
    if (postage !== 10000) command += ` --postage ${postage}sat`;
    if (compress) command += ` --compress`;

    // Add dry-run first to estimate
    const dryRunResult = await executeOrdCommand(command + ' --dry-run');
    
    broadcast({
      type: 'inscription_started',
      file: req.file.originalname,
      estimatedCost: 'Calculating...'
    });

    // Execute actual inscription
    const result = await executeOrdCommand(command);
    
    // Clean up uploaded file
    fs.unlinkSync(filePath);

    broadcast({
      type: 'inscription_completed',
      result,
      file: req.file.originalname
    });

    res.json({ 
      success: true, 
      result,
      message: 'Inscription created successfully'
    });

  } catch (error) {
    // Clean up file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    broadcast({
      type: 'inscription_error',
      error: error.message
    });

    res.status(500).json({ success: false, error: error.message });
  }
});

// Get transaction status
app.get('/api/transaction/:txid', async (req, res) => {
  try {
    // This would integrate with your Bitcoin node to check transaction status
    const txid = req.params.txid;
    // Placeholder implementation
    res.json({ 
      success: true, 
      status: 'pending',
      confirmations: 0
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('WebSocket client connected');
  
  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });
});

// Periodic status updates
cron.schedule('*/30 * * * * *', () => {
  // Broadcast periodic updates if needed
  broadcast({
    type: 'heartbeat',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`Ordinals Inscriber server running on port ${port}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  process.exit(0);
});
