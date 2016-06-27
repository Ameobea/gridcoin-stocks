# Gridcoin Stock Simulator
This is an IRC-based stock market simulator that takes user deposits in gridcoin and allows users to play the stock market.  Users deposit gridcoin using the Gridcoin IRC tip bot and use this bot to open, close, and manage positions.  When users close a position, their profit is calculated in percentages based on the movement of the real asset and their accounts are credited the value of the position.  All positions are in gridcoins and their values change relative to the movement of the asset percent-wise.

# Use Instructions and Commands
The bot is accessible on Freenode through either the #gridcoin-games IRC channel or via direct message to AmeoBot.  All commands should be sent in the #gridcoin-games IRC channel or sent via PM to AmeoBot, as applicable.  All commands that start with `!stock` can be sent via PM to AmeoBot as well.

## Funding
To fund your trading account, send `!tip AmeoBot 100` in the #gridcoin-games channel with 100 replaced with however much you want to deposit.  You must first have deposited or received gridcoins with the tip bot in order to have funds for use with this application.  The tipped gridcoins will automatically be received by the bot and credited to your account.

## Withdrawing
To withdraw gridcoins, use the command `!stock withdraw 100` (with 100 replaced with the amount you want to withdraw).  This will trigger an instant tip to you via the tip bot.

## Opening Positions
To open a position, use the following command:

`!stock buy [ticker symbol] [amount in gridcoins]`
Example: `!stock buy GOOG 10` will open a long position in GOOG with a size of 10 gridcoins.

To "short" a stock, or make money when the price of the stock goes down, you can add the word `short` to the command.

Example: `!stock buy MSFT 10 short` will open up a short position in MSFT with a size of 10 gridcoins.

## Closing Positions
To close an open position, use this command:

`!stock sell [ticker symbol] [amount in gridcoins]`

Alternatively, you can use the keyword `all` in place of the amount in gridcoins to close the entire position.  Positions are closed in a First In First Out (FIFO) fashion, with older positions being closed before newer ones.

## Viewing Your Portfolio
To view your open positions and current profit/loss figures, use the `!stock positions` command.  This will output the result either to the channel or via PM, depending on the way the command was received.  You will see a list of your first 5 open positions, their profit and loss, as well as the profit and loss of your currently open positions and entire account since its creation.

# Problems + Questions
If the bot does anything you think it shouldn't or breaks in any way, please let me know either on IRC (Username Ameo), by leaving an issue here on Github, or by sending an email to me@ameo.link.  I keep full logs of everything the bot sees, sends, credits, and receives, and there are channel-wide logs for the #gridcoin-games channel.  Any cases of missing or stolen funds will be dealt with and refunded as appropriate.

That being said, please don't deposit more gridcoins than you can afford to lose; I provide no insurance for unfavorable market movements or gridcoins lost due to a mistake outside of my control.
