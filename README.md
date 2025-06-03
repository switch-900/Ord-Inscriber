# Not yet in production- use at your own risk. 

# Ordinals Inscriber for Umbrel

A user-friendly web interface for creating Bitcoin Ordinal inscriptions on your Umbrel node.

## Features

- 🎨 **Simple File Upload**: Drag-and-drop interface for easy file selection
- ⚡ **Real-time Updates**: Live progress tracking via WebSocket
- 💰 **Fee Management**: Smart fee estimation with visual controls
- 🔗 **Wallet Integration**: Seamless connection to Bitcoin Core
- 📱 **Mobile Friendly**: Responsive design for all devices
- 🔒 **Secure**: Proper file handling and validation
- 📊 **Activity Tracking**: History of all inscriptions

## Supported File Types

- Images (PNG, JPG, GIF, SVG, WebP)
- Text files (TXT, JSON, CSV)
- Documents (PDF, HTML)
- Any file up to 10MB

## 🚀 Quick Deployment

### Option 1: Add to Umbrel (Recommended)
```bash
# SSH into your Umbrel node
sudo ~/umbrel/scripts/app add-repo https://github.com/switch-900/OrdInscriber
sudo ~/umbrel/scripts/app install ordinals-inscriber
```

### Option 2: Manual Installation
```bash
# Clone and build locally
git clone https://github.com/switch-900/OrdInscriber
cd OrdInscriber
docker build -t ordinals-inscriber .
docker run -p 3333:3333 ordinals-inscriber
```

### Troubleshooting
If you get "Repository already exists" error, see `UMBREL_TROUBLESHOOTING.md` or run `umbrel-fix.sh` on your Umbrel node.

## 📋 Requirements

- **Umbrel Node**: Running Bitcoin Core
- **ord binary**: Must be installed at `/usr/local/bin/ord`
- **Storage**: ~100MB for app, additional space for inscriptions

## 🛠️ For Developers

### Build Docker Image
```bash
docker build -t ordinals-inscriber .
```

### Development Mode
```bash
npm install
npm start
# Visit http://localhost:3333
```

1. **Prerequisites**:
   - Umbrel node with Bitcoin Core synced
   - ord binary installed on host (`/usr/local/bin/ord`)

2. **Install**:
   ```bash
   git clone <your-repo>
   cd OrdInscriber
   npm install
   ```

3. **Run Locally**:   ```bash
   npm start
   # App available at http://localhost:3333
   ```

## Development

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Bitcoin Core node (for testing)

### Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Set environment variables:
   ```bash
   export BITCOIN_RPC_HOST=localhost
   export BITCOIN_RPC_PORT=8332
   export BITCOIN_RPC_USER=your_user
   export BITCOIN_RPC_PASS=your_pass
   ```
4. Run the server: `npm start`
5. Open http://localhost:3333

### Building for Umbrel

1. Build multi-architecture Docker image:
   ```bash
   docker buildx build --platform linux/arm64,linux/amd64 \
     --tag getumbrel/ordinals-inscriber:v1.0.0 \
     --output "type=registry" .
   ```

2. Test on umbrel-dev environment

### Testing

The app includes comprehensive error handling and validation:

- File size limits (10MB max)
- File type validation
- Network error recovery
- Transaction status monitoring

## Usage

1. **Upload File**: Click or drag-drop your file
2. **Set Fee**: Choose slow/medium/fast or custom rate
3. **Configure**: Set destination, metadata (optional)
4. **Inscribe**: Click to create inscription
5. **Monitor**: Track progress and view results

## API Endpoints

- `GET /api/wallet/balance` - Get wallet balance
- `GET /api/wallet/addresses` - List wallet addresses
- `GET /api/wallet/receive` - Get receive address
- `GET /api/wallet/inscriptions` - List inscriptions
- `POST /api/inscribe` - Create new inscription
- `GET /api/fees` - Get current fee estimates

## WebSocket Events

- `inscription_started` - Inscription process begun
- `inscription_completed` - Successfully inscribed
- `inscription_error` - Error occurred
- `heartbeat` - Connection health check

## Security Considerations

- Files are temporarily stored and immediately cleaned up
- All ord commands run in isolated containers
- Input validation prevents malicious uploads
- Bitcoin RPC credentials are securely managed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

- Create issues on GitHub for bugs/features
- Join Umbrel community for general support
- Check Bitcoin Ordinals documentation for protocol details

# Ord Wallet
Usage: ord wallet [OPTIONS] <COMMAND>

Commands:
  addresses     Get wallet addresses
  balance       Get wallet balance
  batch         Create inscriptions and runes
  burn          Burn an inscription
  cardinals     List unspent cardinal outputs in wallet
  create        Create new wallet
  dump          Dump wallet descriptors
  inscribe      Create inscription
  inscriptions  List wallet inscriptions
  label         Export output labels
  mint          Mint a rune
  offer         Offer commands
  outputs       List all unspent outputs in wallet
  pending       List pending etchings
  receive       Generate receive address
  restore       Restore wallet
  resume        Resume pending etchings
  runics        List unspent runic outputs in wallet
  sats          List wallet satoshis
  send          Send sat or inscription
  sign          Sign message
  split         Split outputs
  transactions  See wallet transactions
  help          Print this message or the help of the given subcommand(s)

Options:
      --name <NAME>              Use wallet named <WALLET>. [default: ord]
      --no-sync                  Do not update index.
      --server-url <SERVER_URL>  Use ord running at <SERVER_URL>. [default: http://localhost:80]
  -h, --help                     Print help
# Get wallet addresses

Usage: ord wallet addresses

Options:
  -h, --help  Print help
# Get wallet balance

Usage: ord wallet balance

Options:
  -h, --help  Print help
# Create inscriptions and runes

Usage: ord wallet batch [OPTIONS] --fee-rate <FEE_RATE> --batch <BATCH_FILE>

Options:
      --commit-fee-rate <COMMIT_FEE_RATE>
          Use <COMMIT_FEE_RATE> sats/vbyte for commit transaction.
          Defaults to <FEE_RATE> if unset.
      --compress
          Compress inscription content with brotli.
      --fee-rate <FEE_RATE>
          Use fee rate of <FEE_RATE> sats/vB.
      --dry-run
          Don't sign or broadcast transactions.
      --no-backup
          Do not back up recovery key.
      --no-limit
          Allow transactions larger than MAX_STANDARD_TX_WEIGHT of 400,000 weight units and OP_RETURNs greater than 83 bytes. Transactions over this limit are nonstandard and will not be relayed by bitcoind in its default configuration. Do not use this flag unless you understand the implications.
      --batch <BATCH_FILE>
          Inscribe multiple inscriptions and rune defined in YAML <BATCH_FILE>.
  -h, --help
          Print help
# Burn an inscription

Usage: ord wallet burn [OPTIONS] --fee-rate <FEE_RATE> <ASSET>

Arguments:
  <ASSET>

Options:
      --cbor-metadata <PATH>  Include CBOR from <PATH> in OP_RETURN.
      --dry-run               Don't sign or broadcast transaction.
      --fee-rate <FEE_RATE>   Use fee rate of <FEE_RATE> sats/vB.
      --json-metadata <PATH>  Include JSON from <PATH> converted to CBOR in OP_RETURN.
      --no-limit              Allow OP_RETURN greater than 83 bytes. Transactions over this limit are nonstandard and will not be relayed by bitcoind in its default configuration. Do not use this flag unless you understand the implications.
  -h, --help                  Print help
# List unspent cardinal outputs in wallet

Usage: ord wallet cardinals

Options:
  -h, --help  Print help
# Create new wallet

Usage: ord wallet create [OPTIONS]

Options:
      --passphrase <PASSPHRASE>  Use <PASSPHRASE> to derive wallet seed. [default: ]
  -h, --help                     Print help
# Dump wallet descriptors

Usage: ord wallet dump

Options:
  -h, --help  Print help
# Create inscription

Usage: ord wallet inscribe [OPTIONS] --fee-rate <FEE_RATE> <--delegate <DELEGATE>|--file <FILE>>

Options:
      --commit-fee-rate <COMMIT_FEE_RATE>
          Use <COMMIT_FEE_RATE> sats/vbyte for commit transaction.
          Defaults to <FEE_RATE> if unset.
      --compress
          Compress inscription content with brotli.
      --fee-rate <FEE_RATE>
          Use fee rate of <FEE_RATE> sats/vB.
      --dry-run
          Don't sign or broadcast transactions.
      --no-backup
          Do not back up recovery key.
      --no-limit
          Allow transactions larger than MAX_STANDARD_TX_WEIGHT of 400,000 weight units and OP_RETURNs greater than 83 bytes. Transactions over this limit are nonstandard and will not be relayed by bitcoind in its default configuration. Do not use this flag unless you understand the implications.
      --cbor-metadata <CBOR_METADATA>
          Include CBOR in file at <METADATA> as inscription metadata
      --delegate <DELEGATE>
          Delegate inscription content to <DELEGATE>.
      --destination <DESTINATION>
          Send inscription to <DESTINATION>.
      --file <FILE>
          Inscribe sat with contents of <FILE>. May be omitted if `--delegate` is supplied.
      --json-metadata <JSON_METADATA>
          Include JSON in file at <METADATA> converted to CBOR as inscription metadata
      --metaprotocol <METAPROTOCOL>
          Set inscription metaprotocol to <METAPROTOCOL>.
      --parent <PARENT>
          Make inscription a child of <PARENT>.
      --postage <AMOUNT>
          Include <AMOUNT> postage with inscription. [default: 10000sat]
      --reinscribe
          Allow reinscription.
      --sat <SAT>
          Inscribe <SAT>.
      --satpoint <SATPOINT>
          Inscribe <SATPOINT>.
  -h, --help
          Print help
# List wallet inscriptions

Usage: ord wallet inscriptions

Options:
  -h, --help  Print help
# Export output labels

Usage: ord wallet label

Options:
  -h, --help  Print help
# Mint a rune

Usage: ord wallet mint [OPTIONS] --fee-rate <FEE_RATE> --rune <RUNE>

Options:
      --fee-rate <FEE_RATE>        Use <FEE_RATE> sats/vbyte for mint transaction.
      --rune <RUNE>                Mint <RUNE>. May contain `.` or `•`as spacers.
      --postage <POSTAGE>          Include <AMOUNT> postage with mint output. [default: 10000sat]
      --destination <DESTINATION>  Send minted runes to <DESTINATION>.
  -h, --help                       Print help
# Offer commands

Usage: ord wallet offer <COMMAND>

Commands:
  accept  Accept offer to buy inscription
  create  Create offer to buy inscription
  help    Print this message or the help of the given subcommand(s)

Options:
  -h, --help  Print help
# List all unspent outputs in wallet

Usage: ord wallet outputs [OPTIONS]

Options:
  -r, --ranges  Show list of sat <RANGES> in outputs.
  -h, --help    Print help
# List pending etchings

Usage: ord wallet pending

Options:
  -h, --help  Print help
# Generate receive address

Usage: ord wallet receive [OPTIONS]

Options:
  -n, --number <NUMBER>  Generate <NUMBER> addresses.
  -h, --help             Print help
# Restore wallet

Usage: ord wallet restore [OPTIONS] --from <FROM>

Options:
      --from <FROM>              Restore wallet from <SOURCE> on stdin. [possible values: descriptor, mnemonic]
      --passphrase <PASSPHRASE>  Use <PASSPHRASE> when deriving wallet.
      --timestamp <TIMESTAMP>    Scan chain from <TIMESTAMP> onwards. Can be a unix timestamp in seconds or the string `now`, to skip scanning
  -h, --help                     Print help
# Resume pending etchings

Usage: ord wallet resume [OPTIONS]

Options:
      --dry-run      Don't broadcast transactions.
      --rune <RUNE>  Pending <RUNE> etching to resume.
  -h, --help         Print help
# List unspent runic outputs in wallet

Usage: ord wallet runics

Options:
  -h, --help  Print help
# List wallet satoshis

Usage: ord wallet sats [OPTIONS]

Options:
      --tsv <TSV>  Find satoshis listed in first column of tab-separated value file <TSV>.
      --all        Display list of all sat ranges in wallet.
  -h, --help       Print help
# Send sat or inscription

Usage: ord wallet send [OPTIONS] --fee-rate <FEE_RATE> <ADDRESS> <ASSET>

Arguments:
  <ADDRESS>  Recipient address
  <ASSET>    Outgoing asset formatted as a bitcoin amount, rune amount, sat name, satpoint, or inscription ID. Bitcoin amounts are `DECIMAL UNIT` where `UNIT` is one of `bit btc cbtc mbtc msat nbtc pbtc sat satoshi ubtc`. Rune amounts are `DECIMAL:RUNE` and respect divisibility

Options:
      --dry-run              Don't sign or broadcast transaction
      --fee-rate <FEE_RATE>  Use fee rate of <FEE_RATE> sats/vB
      --postage <AMOUNT>     Target <AMOUNT> postage with sent inscriptions. [default: 10000 sat]
  -h, --help                 Print help
# Sign message

Usage: ord wallet sign --signer <SIGNER> <--text <TEXT>|--file <FILE>>

Options:
      --signer <SIGNER>  Sign with public key associated with address, output, or inscription.
      --text <TEXT>      Sign <TEXT>.
      --file <FILE>      Sign contents of <FILE>.
  -h, --help             Print help
# Split outputs

Usage: ord wallet split [OPTIONS] --fee-rate <FEE_RATE> --splits <SPLIT_FILE>

Options:
      --dry-run              Don't sign or broadcast transaction
      --fee-rate <FEE_RATE>  Use fee rate of <FEE_RATE> sats/vB
      --postage <AMOUNT>     Include <AMOUNT> postage with change output. [default: 10000 sat]
      --splits <SPLIT_FILE>  Split outputs multiple inscriptions and rune defined in YAML <SPLIT_FILE>.
      --no-limit             Allow OP_RETURN greater than 83 bytes. Transactions over this limit are nonstandard and will not be relayed by bitcoind in its default configuration. Do not use this flag unless you understand the implications.
  -h, --help                 Print help