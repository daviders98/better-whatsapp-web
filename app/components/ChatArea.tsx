export default function ChatArea({ chatId, onBack }: { chatId: string, onBack: () => void }) {
  return (
    <div className="h-full flex flex-col">

      <div className="
        border-b p-4 flex items-center gap-3
        bg-white dark:bg-[#202c33] 
        text-gray-900 dark:text-gray-100
        border-gray-300 dark:border-gray-700
      ">
        
        <button 
          onClick={onBack}
          className="md:hidden text-xl px-2"
        >
          ←
        </button>

        <span>Chat with {chatId}</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-4">
        {/* messages */}
      </div>

      {/* Input */}
      <div className="
        p-3 border-t 
        bg-white dark:bg-[#202c33] 
        border-gray-300 dark:border-gray-700
      ">
        <input
          className="
            w-full rounded p-2 
            bg-gray-100 dark:bg-[#2a3942]
            text-gray-900 dark:text-gray-100
            border border-gray-300 dark:border-gray-700
          "
          placeholder="Type a message"
        />
      </div>
    </div>
  );
}
