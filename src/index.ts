const express = require('express')
const TelegramBot = require('node-telegram-bot-api')
const dotenv = require('dotenv')
const axios = require('axios')
const cron = require('node-cron')



dotenv.config();



const token = process.env.TELEGRAM_TOKEN;
const PORT = process.env.PORT
const CHATID = process.env.CHATID

const bot = new TelegramBot(token, { polling: true });
const app = express();
app.use(express.json());

const options = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: 'Current Price', callback_data: 'price' },
        ],
        [
            { text: 'Chat ID', callback_data: 'chat_id' },
        ],
      ],
    },
};

bot.onText(/\/start/, (msg: any) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Click me for more info.', options);
})

bot.on('callback_query', async (query: any) => {
    const chatId = query.message.chat.id;
  
    if (query.data === 'price') {
        const price = await getCTTPrice()
        bot.sendMessage(chatId, price);
    }

    if(query.data === 'chat_id') {
        bot.sendMessage(chatId, `Your Chat ID : ${chatId}`)
    }
  
    // Acknowledge the callback
    bot.answerCallbackQuery(query.id);
});


const getCTTPrice = async ()=> {
    try {
        const request = await axios.get("https://api.bybit.com/v5/market/tickers?category=spot&symbol=CTTUSDT")
        console.log(request)
        const ctt = request?.result?.list[0]
        const price = `Symbol: ${ctt.symbol} lowPrice24h: ${ctt.lowPrice24h} prevPrice24h: ${ctt.prevPrice24h}\n Current Price: ${ctt.lastPrice}`
        return price
    } catch (error: any) {
        console.log("error request api")
        return "error request api"
    }
}

// Schedule the task to run every 5 minutes
cron.schedule('*/1 * * * *', async () => {
    console.log('Fetching Bybit data...');
    const price = await getCTTPrice();
    bot.sendMessage(CHATID, price);
});

app.listen(PORT, () => {
    console.log(`Telegram Bot Server started on port ${PORT}`);
});

// getCTTPrice()


