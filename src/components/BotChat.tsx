'use client'

import { useState } from 'react'
import {
  Webchat,
  WebchatProvider,
} from '@botpress/webchat'

export const BotChat = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false)

  const config: any = {
    botName: 'CareBot',
    botConversationDescription: 'Your AI healthcare assistant 🩺',
    clientId: 'efde2354-f813-4bae-b91b-a105629805b3', // ⬅️ Paste from Botpress here
    themeName: 'prism', // or 'classic'
    stylesheet:
      'https://webchat-styler-css.botpress.app/prod/default.css',
  }

  return (
    <WebchatProvider client={config.clientId} configuration={config}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-4 right-4 bg-primary text-white px-4 py-2 rounded-lg z-50 shadow-lg"
      >
        {isOpen ? 'Close Chat' : 'Open Assistant 💬'}
      </button>

      {isOpen && (
        <div className="fixed bottom-20 right-4 w-[350px] h-[500px] bg-background border rounded-xl shadow-xl overflow-hidden z-40">
          <Webchat configuration={config} />
        </div>
      )}
    </WebchatProvider>
  )
}

export default BotChat
