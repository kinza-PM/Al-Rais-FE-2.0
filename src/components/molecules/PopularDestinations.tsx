import React from "react";
import Destination1 from '../../assets/images/destination1.png';
import Destination2 from '../../assets/images/destination2.png';
import Destination3 from '../../assets/images/destination3.png';
import Destination4 from '../../assets/images/destination4.png';

type Destination = {
    id: string;
    title: string;
    subtitle: string;
    image: string;
};

const DESTINATIONS: Destination[] = [
    {
        id: "1",
        title: "Penida island",
        subtitle: "Bali, Indonesia",
        image: Destination1,
    },
    {
        id: "2",
        title: "Marina Park",
        subtitle: "One Fullerton, Singapore",
        image: Destination2,
    },
    {
        id: "3",
        title: "Ko Samui",
        subtitle: "Ko Samui, Thailand",
        image: Destination3,
    },
    {
        id: "4",
        title: "Fulhadhoo",
        subtitle: "Baa Atoll, Maldives",
        image: Destination4,
    },
];

const PinIcon = () => (
    <svg width="18" height="17" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8.375 7.06186V12.7494C8.375 12.9151 8.44085 13.0741 8.55806 13.1913C8.67527 13.3085 8.83424 13.3744 9 13.3744C9.16576 13.3744 9.32473 13.3085 9.44194 13.1913C9.55915 13.0741 9.625 12.9151 9.625 12.7494V7.06186C10.3838 6.90698 11.058 6.47587 11.517 5.85212C11.976 5.22837 12.187 4.45641 12.1092 3.68591C12.0313 2.91541 11.6702 2.20125 11.0957 1.6819C10.5213 1.16255 9.77442 0.875 9 0.875C8.22558 0.875 7.47874 1.16255 6.90428 1.6819C6.32982 2.20125 5.96866 2.91541 5.89082 3.68591C5.81299 4.45641 6.02402 5.22837 6.483 5.85212C6.94199 6.47587 7.61622 6.90698 8.375 7.06186ZM9 2.12436C9.37084 2.12436 9.73335 2.23433 10.0417 2.44036C10.35 2.64638 10.5904 2.93922 10.7323 3.28183C10.8742 3.62444 10.9113 4.00144 10.839 4.36516C10.7666 4.72887 10.588 5.06296 10.3258 5.32519C10.0636 5.58741 9.72951 5.76599 9.3658 5.83834C9.00208 5.91068 8.62508 5.87355 8.28247 5.73164C7.93986 5.58972 7.64702 5.3494 7.44099 5.04106C7.23497 4.73271 7.125 4.3702 7.125 3.99936C7.125 3.50208 7.32254 3.02517 7.67417 2.67354C8.02581 2.32191 8.50272 2.12436 9 2.12436ZM17.75 12.7494C17.75 15.1853 13.2414 16.4994 9 16.4994C4.75859 16.4994 0.25 15.1853 0.25 12.7494C0.25 12.1447 0.547656 11.2548 1.96875 10.4517C2.92656 9.90952 4.24375 9.49311 5.77891 9.24702C5.86011 9.23419 5.94305 9.23749 6.02298 9.25672C6.10291 9.27594 6.17827 9.31073 6.24475 9.35908C6.31124 9.40743 6.36756 9.4684 6.41048 9.53852C6.4534 9.60863 6.4821 9.68652 6.49492 9.76772C6.50775 9.84893 6.50445 9.93186 6.48522 10.0118C6.466 10.0917 6.43121 10.1671 6.38286 10.2336C6.33451 10.3001 6.27354 10.3564 6.20342 10.3993C6.13331 10.4422 6.05542 10.4709 5.97422 10.4837C4.60391 10.7041 3.39609 11.0798 2.58203 11.5423C1.89453 11.929 1.5 12.3697 1.5 12.7494C1.5 13.7931 4.35313 15.2494 9 15.2494C13.6469 15.2494 16.5 13.7931 16.5 12.7494C16.5 12.3697 16.1055 11.929 15.418 11.5392C14.6008 11.0767 13.3961 10.7009 12.0258 10.4806C11.9429 10.4698 11.8629 10.4424 11.7908 10.4001C11.7186 10.3579 11.6557 10.3015 11.6057 10.2345C11.5557 10.1674 11.5197 10.091 11.4997 10.0098C11.4798 9.92859 11.4764 9.84419 11.4897 9.76161C11.5029 9.67904 11.5327 9.59998 11.5771 9.5291C11.6215 9.45822 11.6796 9.39698 11.7481 9.34899C11.8166 9.30101 11.8941 9.26725 11.9758 9.24974C12.0576 9.23222 12.1421 9.2313 12.2242 9.24702C13.7594 9.49311 15.0766 9.90952 16.0344 10.4517C17.4523 11.2548 17.75 12.1447 17.75 12.7494Z" fill="white" />
    </svg>

);

function DestinationCard({ d }: { d: Destination }) {
    return (
        <div className="group relative overflow-hidden rounded-2xl shadow-sm ring-1 ring-black/5 bg-white">
            {/* image height stays generous; adjust if you want */}
            <img
                src={d.image}
                alt={d.title}
                className="block w-full h-72 md:h-80 object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />

            {/* overlay wrapper with smaller height */}
            {/* lighter black blur band */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[88px] rounded-b-2xl
                bg-black/10 backdrop-blur-[3px] z-10" />


            {/* centered text inside the overlay */}
            <div className="absolute inset-x-0 bottom-0 h-[88px] z-20
                        flex flex-col items-center justify-center px-4 text-center text-white">
                <div className="flex items-center justify-center gap-2 text-[15px] md:text-xl font-semibold drop-shadow-sm">
                    <PinIcon />
                    <span>{d.title}</span>
                </div>
                <p className="mt-0.5 text-[12px] text-[rgba(228, 228, 231, 1)] md:text-sm opacity-90 drop-shadow-sm">{d.subtitle}</p>
            </div>
        </div>
    );
}



const PopularDestinationsFlexRow: React.FC = () => {
    return (
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 md:pt-16 pb-10">
            <p className="text-sm text-[rgba(61,73,92,1)]">Popular destinations</p>
            <h2 className="mt-3 text-3xl sm:text-5xl font-medium text-[rgba(10,12,15,1)]">
                Find your next adventure
            </h2>

            {/* FLEX — single row, no scroll */}
            <div className="mt-6 flex flex-nowrap gap-6 overflow-hidden">
                {DESTINATIONS.map((d) => (
                    <div
                        key={d.id}
                        className="min-w-0 basis-1/4 flex-1" // 4 equal columns, shrink allowed; stays one row
                    >
                        <DestinationCard d={d} />
                    </div>
                ))}
            </div>

            <div className="mt-8 flex justify-center">
                <button
                    type="button"
                    className="rounded-lg px-6 py-2 text-white bg-[rgba(35,81,163,1)] hover:bg-[rgba(35,81,163,0.92)] active:bg-[rgba(35,81,163,0.88)] shadow-sm ring-1 ring-black/5 focus:outline-none focus:ring-2 focus:ring-[rgba(35,81,163,0.5)]"
                >
                    Book a flight
                </button>

            </div>
        </div>
    );
};

export default PopularDestinationsFlexRow;
