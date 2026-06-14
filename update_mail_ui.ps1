$file = "App.tsx"
$lines = Get-Content $file -Encoding UTF8

$startIdx = -1
for ($i = 0; $i -lt $lines.Length; $i++) {
    if ($lines[$i] -match "activeProfileTab === 'mail' && \(") {
        $startIdx = $i
        break
    }
}
if ($startIdx -lt 0) { Write-Host "ERROR: Not found"; exit 1 }

$endIdx = -1
$depth = 0
for ($i = $startIdx; $i -lt $lines.Length; $i++) {
    foreach ($ch in $lines[$i].ToCharArray()) {
        if ($ch -eq '(' -or $ch -eq '{') { $depth++ }
        if ($ch -eq ')' -or $ch -eq '}') { $depth-- }
    }
    if ($i -gt $startIdx -and $depth -le 0) {
        $endIdx = $i
        break
    }
}

Write-Host "Replacing Mail Tab ui: lines $($startIdx+1) to $($endIdx+1)"

$replacement = @(
'                            {activeProfileTab === ''mail'' && (',
'                                <div className="h-full flex flex-col overflow-y-auto bg-[#efe1bd] text-black border-4 border-[#8b5a2b] shadow-inner relative p-4 rounded-sm"',
'                                    style={{',
'                                        backgroundImage: "url(''https://www.transparenttextures.com/patterns/aged-paper.png'')",',
'                                        boxShadow: "inset 0 0 50px rgba(0,0,0,0.5), 0 10px 15px rgba(0,0,0,0.5)"',
'                                    }}',
'                                >',
'                                    {/* Red Wax Seal */}',
'                                    <div className="absolute top-2 right-2 w-24 h-24 bg-red-700 rounded-full flex items-center justify-center text-center shadow-lg border-2 border-red-900 z-10"',
'                                         style={{ ',
'                                             boxShadow: "inset 0px 0px 20px rgba(0,0,0,0.6), 2px 4px 6px rgba(0,0,0,0.4)",',
'                                             transform: "rotate(15deg)"',
'                                         }}>',
'                                        <div className="w-20 h-20 border-2 border-red-800 rounded-full flex items-center justify-center p-1">',
'                                            <span className="text-[10px] uppercase font-bold text-red-100 opacity-90 leading-tight select-none">Basingse<br/>Crypto<br/>Sity</span>',
'                                        </div>',
'                                    </div>',
'',
'                                    <h2 className="text-2xl font-bold mb-4 font-serif text-[#5c3a21] border-b border-[#a88a6d] pb-2 uppercase tracking-wider pl-2 w-3/4">Королевская Почта</h2>',
'',
'                                    {privateChats.length === 0 ? (',
'                                        <div className="flex flex-col items-center justify-center h-full text-[#8b6a4b]">',
'                                            <LettersIcon className="w-16 h-16 mb-4 opacity-50" />',
'                                            <p className="font-serif italic font-bold">Ваш почтовый ящик пуст.</p>',
'                                        </div>',
'                                    ) : (',
'                                        <div className="space-y-4 pt-2 px-2 pb-10">',
'                                            {privateChats.map(chat => {',
'                                                const otherUser = Object.values(allUsers).find(u => u.uid === chat.otherUserId);',
'                                                return (',
'                                                    <div',
'                                                        key={chat.lastMessage.chatId || Math.random().toString()}',
'                                                        onClick={() => {',
'                                                            setActivePrivateChat(chat.otherUserId);',
'                                                            setActivePrivateChatId(chat.lastMessage.chatId);',
'                                                            setIsAnonymousMessage(chat.lastMessage.chatId?.endsWith(''_anon'') || false);',
'                                                            setShowPrivateChatModal(true);',
'                                                            setShowProfileModal(false);',
'                                                        }}',
'                                                        className="relative bg-[#fdf6e3] p-4 rounded-sm cursor-pointer hover:bg-[#fff9ed] transition-colors flex items-center gap-4 group shadow-md border border-[#c2b280]"',
'                                                        style={{',
'                                                            backgroundImage: "url(''https://www.transparenttextures.com/patterns/cream-paper.png'')",',
'                                                            boxShadow: "2px 2px 8px rgba(0,0,0,0.2)"',
'                                                        }}',
'                                                    >',
'                                                        {/* Scroll End Effects */}',
'                                                        <div className="absolute left-[-10px] top-1/2 -translate-y-1/2 w-4 h-[110%] bg-gradient-to-r from-[#d4bc8b] to-[#fdf6e3] rounded-l-full shadow-md border-y border-l border-[#8b5a2b]"></div>',
'                                                        <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 w-4 h-[110%] bg-gradient-to-l from-[#d4bc8b] to-[#fdf6e3] rounded-r-full shadow-md border-y border-r border-[#8b5a2b]"></div>',
'',
'                                                        {/* Left Side: Avatar & Stats */}',
'                                                        <div className="flex flex-col items-center min-w-[80px] z-10">',
'                                                            {chat.otherUserId === ''anonymous'' ? (',
'                                                                <div className="w-12 h-12 rounded-full flex items-center justify-center border-2 border-[#8b5a2b] bg-[#d4c399]">',
'                                                                    <span className="text-3xl">🕵️</span>',
'                                                                </div>',
'                                                            ) : otherUser?.avatar ? (',
'                                                                <img src={otherUser.avatar} alt="avatar" className="w-12 h-12 rounded-full object-cover border-2 border-[#8b5a2b]" referrerPolicy="no-referrer" />',
'                                                            ) : (',
'                                                                <div className="w-12 h-12 rounded-full bg-[#d4c399] flex items-center justify-center border-2 border-[#8b5a2b]">',
'                                                                    <UserIcon className="w-7 h-7 text-[#5c3a21]" />',
'                                                                </div>',
'                                                            )}',
'                                                            ',
'                                                            {chat.otherUserId !== ''anonymous'' && (',
'                                                                <div className="mt-1 flex items-center bg-[#5c3a21] px-1 rounded text-white text-[10px] font-bold shadow-inner" aria-label={`Уровень ${otherUser?.level || 1}`}>',
'                                                                    <span>Ур. {otherUser?.level || 1}</span>',
'                                                                </div>',
'                                                            )}',
'                                                        </div>',
'',
'                                                        {/* Right Side: Msg Text Block */}',
'                                                        <div className="flex-1 min-w-0 pl-2 z-10">',
'                                                            <div className="flex justify-between items-baseline mb-1">',
'                                                                <span ',
'                                                                    className="font-bold text-[#5c3a21] truncate font-serif text-lg group-hover:underline decoration-dashed decoration-2 underline-offset-4"',
'                                                                    onClick={(e) => {',
'                                                                        if (chat.otherUserId !== ''anonymous'' && otherUser) {',
'                                                                            e.stopPropagation();',
'                                                                            handleOpenAnotherUserProfile(otherUser.uid);',
'                                                                        }',
'                                                                    }}',
'                                                                >',
'                                                                    {chat.otherUserId === ''anonymous'' ? ''Аноним'' : (otherUser?.name || ''Неизвестный'')}',
'                                                                    {chat.lastMessage.chatId?.endsWith(''_anon'') && chat.otherUserId !== ''anonymous'' && <span className="text-red-700 ml-2 text-sm italic font-serif">(Анонимно)</span>}',
'                                                                </span>',
'',
'                                                                {/* Optional Stats */}',
'                                                                {chat.otherUserId !== ''anonymous'' && otherUser && (',
'                                                                    <div className="flex text-[11px] space-x-3 text-[#7a5938] font-bold bg-[#e8d5a5] px-2 rounded-full border border-[#d4bc8b]">',
'                                                                        <span title="Слава">🏆 {otherUser.glory || 0}</span>',
'                                                                        <span title="Репутация">⭐ {otherUser.reputation || 0}</span>',
'                                                                    </div>',
'                                                                )}',
'                                                            </div>',
'                                                            ',
'                                                            <div className="bg-[#e8d5a5] p-2 rounded border border-[#d4bc8b] text-[#3a200e] text-sm overflow-hidden text-ellipsis shadow-inner whitespace-nowrap italic font-serif">',
'                                                                <span className="font-bold text-[#8b5a2b]">{chat.lastMessage.senderId === user?.uid ? ''Вы: '' : ''}</span>',
'                                                                {chat.lastMessage.text}',
'                                                            </div>',
'                                                            <div className="flex justify-between items-center mt-1">',
'                                                                <span className="text-[10px] text-[#8b6a4b] font-bold italic pl-1">Свиток получен...</span>',
'                                                                <span className="text-[10px] text-[#8b6a4b] font-bold px-1">{new Date(chat.lastMessage.timestamp).toLocaleString()}</span>',
'                                                            </div>',
'                                                        </div>',
'                                                        {chat.unreadCount > 0 && (',
'                                                            <div className="absolute top-[-8px] right-2 bg-red-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-md border border-white z-20">',
'                                                                {chat.unreadCount} Новых',
'                                                            </div>',
'                                                        )}',
'                                                    </div>',
'                                                );',
'                                            })}',
'                                        </div>',
'                                    )}',
'                                </div>',
'                            )}'
)

$newLines = @()
$newLines += $lines[0..($startIdx - 1)]
$newLines += $replacement
$newLines += $lines[($endIdx + 1)..($lines.Length - 1)]

Set-Content -Path $file -Value $newLines -Encoding UTF8
Write-Host "SUCCESS: Updated Mail UI"
