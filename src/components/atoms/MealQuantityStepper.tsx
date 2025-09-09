type MealQuantityStepperProps = {
    qty: number;
    onInc: () => void;
    onDec: () => void;
    className?: string;
};

export default function MealQuantityStepper({ qty, onInc, onDec, className = "" }: MealQuantityStepperProps) {
    if (!qty) return null;
    return (
        <div className={`ml-3 inline-flex items-center gap-2 ${className}`}>
            <button
                type="button"
                onClick={onDec}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#2351A3] text-white hover:brightness-95"
            >
                <span className="-mt-[2px] text-lg leading-none">−</span>
            </button>
            <span className="w-8 text-center text-[14px] font-medium text-[#0A0C0F]">
                {String(qty).padStart(2, "0")}
            </span>
            <button
                type="button"
                onClick={onInc}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#2351A3] text-white hover:brightness-95"
            >
                <span className="-mt-[1px] text-lg leading-none">+</span>
            </button>
        </div>
    );
}
