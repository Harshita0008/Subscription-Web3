import requests
import re
from telegram import Update ,InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, ContextTypes
import datetime
import json

# Your bot token
TOKEN = "BOT_TOKEN"
# Your API endpoint
API_ENDPOINT = "YOUR_API_ENDPOINT"

#Graphql Endpoint
GRAPHQL_ENDPOINT = "https://api.studio.thegraph.com/query/64394/autopay/v0.0.1"

# Define a file to store addresses data
ADDRESSES_FILE = "./UserIDToAddress.json"

# Load addresses data from file
def load_addresses():
    try:
        with open(ADDRESSES_FILE, "r") as file:
            data = json.load(file)
            # Convert user_ids from string to integer
            data = {int(key): value for key, value in data.items()}
            return data
    except FileNotFoundError:
        return {}

# Save addresses data to file
def save_addresses(addresses):
    with open(ADDRESSES_FILE, "w") as file:
        json.dump(addresses, file)

# Load addresses data when the bot starts
user_addresses = load_addresses()
user_chat_ids=[]

print(user_addresses)
# Regular expression pattern for Ethereum wallet addresses
ETH_ADDRESS_PATTERN = r'^0x[a-fA-F0-9]{40}$'

# Define a function to validate Ethereum wallet addresses
def is_valid_ethereum_address(address):
    return re.match(ETH_ADDRESS_PATTERN, address) is not None

# Function to check API response and send notification to al

messages = {
    'en': {
        'welcome': "Hello, {}\n"
                   "This AutoPay bot🗞️🤖\n\n"
                   "You can get notifications and see payment history here. \n\n"
                   "Please continue to bind your wallet address like /bind address",
        'success_bind': "Your wallet address '{}' has been successfully bound to your user ID.",
        'invalid_address': "Invalid wallet address. Please provide a valid address.",
        'no_address': "No wallet address found for your user ID.",
        'your_address': "Your wallet address: {}",
        'help': "Available commands:\n"
                "/start - Start the bot\n"
                "/help - Show available commands\n"
                "/about - Display information about the bot\n"
                "/paymentHistory - View payment history\n"
                "/bind - Bind your wallet address\n"
                "/getBindedAddress - Get your binded wallet address\n"
                "/notification - Toggle notifications\n"
                "/setlang - Set language preference",
        'about': "AutoPay Bot\n"
                 "I am AutoPay Bot. I can help you with notifications.",
        'language_set': "Language set to {}",
        'invalid_language': "Invalid language. Please choose a supported language.",
        'missing_language_argument': "Please provide a language after the command, e.g., /setlang en or /setlang zh",
         'address_not_bound': "You haven't bound your Ethereum wallet address yet. Please use /bind <address> to bind your address first.",
        'no_payment_details_found': "No subscription payment details found.",
        'error_fetching_payment_details': "Error: Unable to fetch subscription payment details from GraphQL API",
        'transaction': "Transaction",
        'transaction_hash': "Transaction Hash",
        'payee': "Payee",
        'payment_amount': "Payment Amount",
        'payment_date': "Payment Date",
        'next_payment_date': "Next Payment Date"
    },
    'zh': {
        'welcome': "你好，{}\n"
                   "这是自动支付机器人🗞️🤖\n\n"
                   "您可以在这里接收通知并查看付款记录。\n\n"
                   "请继续绑定您的钱包地址，格式为 /bind 地址",
        'success_bind': "您的钱包地址 '{}' 已成功绑定到您的用户ID。",
        'invalid_address': "无效的钱包地址，请提供有效的地址。",
        'no_address': "未找到您用户ID的钱包地址。",
        'your_address': "您的钱包地址：{}",
        'help': "可用命令：\n"
                "/start - 启动机器人\n"
                "/help - 显示可用命令\n"
                "/about - 显示有关机器人的信息\n"
                "/paymentHistory - 查看付款记录\n"
                "/bind - 绑定您的钱包地址\n"
                "/getBindedAddress - 获取您绑定的钱包地址\n"
                "/notification - 切换通知\n"
                "/setlang - 设置语言首选项",
        'about': "自动支付机器人\n"
                 "我是自动支付机器人。我可以帮助您接收通知。",
        'language_set': "语言设置为 {}",
        'invalid_language': "无效的语言。请选择支持的语言。",
        'missing_language_argument': "请在命令后提供一种语言，例如，/setlang en 或 /setlang zh",
         'address_not_bound': "您尚未绑定您的以太坊钱包地址。 请先使用 /bind <address> 绑定您的地址。",
        'no_payment_details_found': "未找到订阅付款详细信息。",
        'error_fetching_payment_details': "错误：无法从 GraphQL API 获取订阅付款详细信息",
        'transaction': "交易",
        'transaction_hash': "交易哈希",
        'payee': "收款方",
        'payment_amount': "支付金额",
        'payment_date': "支付日期",
        'next_payment_date': "下次支付日期"
    }
}


# Function to send messages in the appropriate language
async def send_message(update, context, message_key, *args):
    language = context.user_data.get('language', 'en')
    message = messages[language].get(message_key, '')
    if message:
        await update.message.reply_text(message.format(*args))

# Modify your existing functions to use the send_message function
async def start(update, context):
    user = update.message.from_user
    await send_message(update, context, 'welcome', user.first_name)

async def bind(update: Update, context) -> None:
    user_id = update.message.from_user.id
    address = ' '.join(context.args)
    
    if address:
        if is_valid_ethereum_address(address):
            user_addresses[user_id] = address
            save_addresses(user_addresses)  # Save addresses to file
            await send_message(update, context, 'success_bind', address)
        else:
            await send_message(update, context, 'invalid_address')
    else:
        await send_message(update, context, 'no_address')

async def get_address(update: Update, context) -> None:
    user_id = update.message.from_user.id
    if user_id in user_addresses:
        address = user_addresses[user_id]
        await send_message(update, context, 'your_address', address)
    else:
        await send_message(update, context, 'no_address')

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await send_message(update, context, 'help')

async def about(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await send_message(update, context, 'about')

async def subscriptionMade(update , context):

    query = '''
    {
    subscriptionPaids(orderBy: id, first: 1, orderDirection: desc) {
    id
    customer
    paymentAmount
    payee
    }
    }
    '''
    payload = {'query': query}
    response = requests.post(GRAPHQL_ENDPOINT, json=payload)
    data = response.json()
    subs = data.get('data', {}).get('subscriptionPaids', [])
    customer = ''
    payee = ''

    if subs:
        for idx, sub in enumerate(subs, start=1):
            customer = sub['customer']
            payee = sub['payee']

    for user_id, address in user_addresses.items():
        if(customer == address):
            await context.bot.send_message(user_id, text=f"Subscription Paid for by the {payee}" )

async def set_language(update, context):
    user_data = context.user_data
    if not context.args:
        await send_message(update, context, 'missing_language_argument')
        return
    language = context.args[0].lower()
    if language in messages:
        user_data['language'] = language
        await send_message(update, context, 'language_set', language)
    else:
        await send_message(update, context, 'invalid_language')

#Function to handle the /paymentHistory command
async def paymentHistory(update: Update, context: ContextTypes.DEFAULT_TYPE):
    # Get the user's ID
    user_id = update.message.from_user.id
    
    # Check if the user has a bound address
    if user_id not in user_addresses:
        await send_message(update, context, 'address_not_bound')
        return
    
    # Get the user's bound address
    user_address = user_addresses[user_id]
    
    # Form the query using the user's bound address
    query = f'''
    {{
        subscriptionPaids(
            first: 10
            where: {{customer: "{user_address}"}}
        ) {{
            nextPaymentDate
            payee
            paymentAmount
            paymentDate
            transactionHash
        }}
    }}'''

    # Construct the request payload
    payload = {'query': query}
    response = requests.post(GRAPHQL_ENDPOINT, json=payload)
    
    if response.status_code == 200:
        # Parse the JSON response
        data = response.json()
        payments = data.get('data', {}).get('subscriptionPaids', [])

        if payments:
            for idx, payment in enumerate(payments, start=1):
                # Format the payment details into a message
                message = (
                    f"{messages[context.user_data.get('language', 'en')]['transaction']} {idx}:\n"
                    f"{messages[context.user_data.get('language', 'en')]['transaction_hash']}: {payment['transactionHash']}\n"
                    f"{messages[context.user_data.get('language', 'en')]['payee']}: {payment['payee']}\n"
                    f"{messages[context.user_data.get('language', 'en')]['payment_amount']}: {payment['paymentAmount']}\n"
                    f"{messages[context.user_data.get('language', 'en')]['payment_date']}: {datetime.datetime.fromtimestamp(int(payment['paymentDate'])).strftime('%Y-%m-%d %H:%M')}\n"
                    f"{messages[context.user_data.get('language', 'en')]['next_payment_date']}: {datetime.datetime.fromtimestamp(int(payment['nextPaymentDate'])).strftime('%Y-%m-%d %H:%M')}\n\n"
                )
                # Send the message to the user
                await update.message.reply_text(message)
        else:
            await send_message(update, context, 'no_payment_details_found')
    else:
        await send_message(update, context, 'error_fetching_payment_details')

async def notification(update , context):
    for user_id in user_addresses:
        try:
            await context.bot.send_message(chat_id=user_id, text="notification")
        except Exception as e:
            print(f"Failed to send message to user {user_id}: {e}")

    # await update.message.reply_text("Notification sent to all users.")
# Main function
def main():

        # Create the Application and pass it your bot's token.
    application = Application.builder().token(TOKEN).build()

    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("help", help_command))
    application.add_handler(CommandHandler("about", about))
    application.add_handler(CommandHandler("paymentHistory", paymentHistory))
    application.add_handler(CommandHandler("bind", bind))
    application.add_handler(CommandHandler("getBindedAddress", get_address))
    application.add_handler(CommandHandler("notification", notification))
    application.add_handler(CommandHandler("setlang", set_language))



    application.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == "__main__":
    main()
