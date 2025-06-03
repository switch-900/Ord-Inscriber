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
    const ordCommand = spawn('ord', command.split(' ').concat(args), {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        BITCOIN_RPC_URL: `http://${process.env.BITCOIN_RPC_USER}:${process.env.BITCOIN_RPC_PASS}@${process.env.BITCOIN_RPC_HOST}:${process.env.BITCOIN_RPC_PORT}`
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

// Get inscriptions
app.get('/api/wallet/inscriptions', async (req, res) => {
  try {
    const inscriptions = await executeOrdCommand('wallet inscriptions');
    res.json({ success: true, inscriptions: inscriptions.split('\n').filter(i => i) });
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
