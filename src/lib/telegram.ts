import axios from 'axios';

/**
 * Sends a notification message to a Telegram chat via Bot API.
 * 
 * @param botToken - The Telegram Bot API token.
 * @param chatId - The target Chat ID.
 * @param message - The text content to send (supports Markdown).
 */
export async function sendTelegramMessage(botToken: string, chatId: string, message: string) {
    if (!botToken || !chatId) {
        console.warn('⚠️ [Telegram] Missing credentials. Skip notification.');
        return;
    }

    console.log(`🚀 [Telegram] Attempting to dispatch alert to Chat: ${chatId.slice(0, 4)}...`);

    try {
        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
        const response = await axios.post(url, {
            chat_id: chatId,
            text: message,
            parse_mode: 'Markdown',
        });
        
        console.log('✅ [Telegram] Alert delivered successfully:', response.data.ok);
    } catch (error: any) {
        const status = error.response?.status;
        const errorData = error.response?.data;
        const errorMsg = errorData?.description || error.message;

        console.error(`❌ [Telegram] Dispatch failure (Status: ${status}):`, errorMsg);
    }
}
