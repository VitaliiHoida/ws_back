const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');
require('dotenv').config()

const token = '5933906901:AAEFET9FVkomvLHysberxvskhhzdgmOSraI';

const bot = new TelegramBot(token, {polling: true});
const app = express();

app.use(express.json());
app.use(cors());

const webAppUrl = 'https://superb-bubblegum-2fe1c0.netlify.app/';

bot.on('message', async (msg) => {
    this.chatId = msg.chat.id;
    const text = msg.text;

    if (text === '/start') {
        await bot.sendMessage(this.chatId, 'Натискай кнопку "Оплатити" внизу ');
    }

});

app.post('/web-data', async (req, res) => {
    console.log(req);
    const {queryId, order} = req.body;

    global.name = order.name;
    global.text_sm = order.text_sm;
    global.sm = order.sm;
    global.text_lg = order.text_lg;
    global.lg = order.lg;
    order.addit ? global.additional = 'Додаткове обладнання потрібне' : global.additional = 'Додаткове обладнання не потрібне';
    try {

        const url = await bot.createInvoiceLink(
            order.name,
            order.text_sm + " " + order.sm + " " + order.text_lg + " " + order.lg,
            'payload',
            '632593626:TEST:sandbox_i61838863716',
            'UAH',
            [{label: 'Ціна', amount: order.sum_to_pay * 100}],
            {
                photo_url: 'https://webnauts.pro/tg_icons/paylogo.png',
                need_name: true,
                need_phone_number: true,
                need_shipping_address: false,
            }
        );

        return res.json(url);
    } catch (e) {
        console.log(e);
    }

})

bot.on('pre_checkout_query', (ctx) => {

    bot.answerPreCheckoutQuery( ctx.id, true).catch(error => {

    })
}) // ответ на предварительный запрос по оплате

bot.on('successful_payment', async (ctx, next) => { // ответ в случае положительной оплаты

    let tgLink = "<a href='https://t.me/" + ctx.chat.username + "'>" + ctx.chat.username + "</a>";
    let payDate = new Date(ctx.date * 1000);
    payDate.setMilliseconds(2 * 60 * 60 * 1000);
    await bot.sendMessage(
        1497795260,
        "Оплата за: " + name + "\n" +
        text_sm + ": " + sm + ". \n" +
        text_lg + ": " + lg + ". \n" +
        additional + ". \n" +
        "Сума:" + ctx.successful_payment.total_amount / 100 + "грн \n" +
        "ПІБ: " + ctx.successful_payment.order_info.name + "\n" +
        "Телефон: " + ctx.successful_payment.order_info.phone_number + "\n" +
        "Tg акаунт: " + tgLink + "\n" +
        "Номер квитанції LiqPay: " + ctx.successful_payment.provider_payment_charge_id +  "\n" +
        "Дата: " + payDate.toLocaleString(),
        {parse_mode: 'HTML'}
        );

    await bot.sendMessage(
        ctx.chat.id,
        "<b>Дякуємо!</b> \n" +
        "\n"+
        "Ви успішно оплатили " + ctx.successful_payment.total_amount / 100 + "грн \n" +
        "за " + name + ". \n" +
        text_sm + ": " + sm + ". \n" +
        text_lg + ": " + lg + ". \n" +
        additional + ". \n" +
        "Якщо у вас виникли питання - звертайтесь до адміністратора \n" +
        "<a href='https://t.me/t_khimich'>Адміністратор</a>",
        {parse_mode: 'HTML'}
    );
})

bot.on("polling_error", console.log);

const PORT = process.env.PORT;

app.listen(PORT, () => console.log('server started on PORT ' + PORT));
