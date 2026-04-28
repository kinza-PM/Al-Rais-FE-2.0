const EmptyAmenitiesStatus: React.FC<{ title: string, description: string }> = ({ title = "Facility details are being finalized by the property.", description = "This may take up to 24 hours." }) => {

    return (
        <div className="flex items-center gap-3">
            <div>
                <svg width="21" height="21" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.3333 26.6667C5.96933 26.6667 0 20.6973 0 13.3333C0 5.96933 5.96933 0 13.3333 0C20.6973 0 26.6667 5.96933 26.6667 13.3333C26.6667 20.6973 20.6973 26.6667 13.3333 26.6667ZM13.3333 24C16.1623 24 18.8754 22.8762 20.8758 20.8758C22.8762 18.8754 24 16.1623 24 13.3333C24 10.5044 22.8762 7.79125 20.8758 5.79086C18.8754 3.79047 16.1623 2.66667 13.3333 2.66667C10.5044 2.66667 7.79125 3.79047 5.79086 5.79086C3.79047 7.79125 2.66667 10.5044 2.66667 13.3333C2.66667 16.1623 3.79047 18.8754 5.79086 20.8758C7.79125 22.8762 10.5044 24 13.3333 24ZM12 6.66667H14.6667V9.33333H12V6.66667ZM12 12H14.6667V20H12V12Z" fill="#2351A3" />
                </svg>
            </div>
            <div>
                <h4 className="text-sm font-semibold text-[#0A0C0F]">{title}</h4>
                <p className="text-xs text-[#3D495C] max-w-sm break-words">
                    {description}
                </p>
            </div>
        </div>
    );
};

export default EmptyAmenitiesStatus;