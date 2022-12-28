const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');
require('dotenv').config()

const token = '5936516498:AAF30eMBr5GN630SadmFZf8JdnAdun6LUyY';

const bot = new TelegramBot(token, {polling: true});
const app = express();

app.use(express.json());
app.use(cors());

const webAppUrl = 'https://prismatic-marzipan-caaf15.netlify.app/';

bot.onText(/message/, async (msg) => {
    this.chatId = msg.chat.id;
    const text = msg.text;

    if (text === '/start') {
        // await bot.sendMessage(this.chatId, "Обери собі курс до душі", {
        //     reply_markup: {
        //         keyboard: [
        //            [{text: 'Огляд та оплата курсів', web_app: {url: webAppUrl}}],
        //         ]
        //     }
        // });
    }

});

app.post('/web-data', async (req, res) => {
    const {queryId, order} = req.body;
    global.CourseName = order.course_name;
    try {

        /*await bot.sendInvoice(this.chatId, order.course_name, '123', 'payload','632593626:TEST:sandbox_i41389891898', 'UAH', [{label: 'Ціна', amount: order.sum_to_pay*100}]);*/

        const url = await bot.createInvoiceLink(
            order.course_name,
            'Оплата за ' + order.descr,
            'payload',
            '635983722:LIVE:i60354245141',
            /*'632593626:TEST:sandbox_i41389891898',*/
            'UAH',
            [{label: 'Ціна', amount: order.sum_to_pay * 100}],
            {
                photo_url: 'https://webnauts.pro/tg_icons/paylogo.png',
                need_name: true,
                need_phone_number: true,
                need_shipping_address: false,
            }
        );
       /* await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Успешная покупка',
            input_message_content: {
                message_text: url,
            }
        });*/

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
    console.log(ctx);
    let tgLink = "<a href='https://t.me/" + ctx.chat.username + "'>" + ctx.chat.username + "</a>";
    let payDate = new Date(ctx.date * 1000);
    payDate.setMilliseconds(2 * 60 * 60 * 1000);
    await bot.sendMessage(
        1497795260,
        "Оплата за курс: " + CourseName + "\n" +
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
        "за курс " + CourseName + "\n" +
        "Якщо у вас виникли питання - звертайтесь до адміністратора \n" +
        "<a href='https://t.me/t_khimich'>Адміністратор</a>",
        {parse_mode: 'HTML'}
    );
})

bot.on("polling_error", console.log);

const PORT = process.env.PORT;

app.listen(PORT, () => console.log('server started on PORT ' + PORT));
