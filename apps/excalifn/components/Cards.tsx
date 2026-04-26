export const Card = ({ roomname, joinfuntion, deleterm }: { roomname: string, joinfuntion: () => void, deleterm: () => void }) => {
    return (
        <div className="group flex flex-shrink-0 items-center justify-between px-4 w-full rounded-xl h-[48px] bg-white/[0.03] border border-white/8 hover:border-purple-500/30 hover:bg-white/[0.06] transition-all duration-200">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500/60" />
                <span className="text-white/70 text-sm font-sans group-hover:text-white transition-colors duration-200">{roomname}</span>
            </div>
            <div className="flex gap-2">
                <button
                    onClick={joinfuntion}
                    className="h-7 px-3 rounded-lg text-xs font-sans font-medium text-white
                        bg-gradient-to-r from-purple-600/80 to-pink-600/80
                        hover:from-purple-500 hover:to-pink-500
                        transition-all duration-200 cursor-pointer"
                >
                    Join
                </button>
                <button
                    onClick={deleterm}
                    className="w-7 h-7 rounded-lg text-xs font-sans font-medium text-white/40 border border-white/10 hover:border-red-500/40 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 cursor-pointer flex items-center justify-center"
                >
                    ✕
                </button>
            </div>
        </div>
    )
}