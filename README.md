# kraken-trailing
App for placing trailing stop loss buy orders on Kraken exchange
## How to install
* Put your API key in `.env` files
```
KRAKEN_API_KEY=XXXX
KRAKEN_API_SECRET_KEY=XXXX
```
* Start the app with `docker-compose up -d --build`
## How to place orders
* Attach to the container with `docker attach kraken-trailing`
* Type `help` to see available commands
* Example: Place an order to buy 30 EUR worth of Cardano 5% above market price: `place ADA 30 5`
