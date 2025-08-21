import readyToFlyBgImg from "../../assets/images/readyToFlyBgImg.png";
import Plane_Image from "../../assets/images/Plane_Image.png";

const ReadyToFlySection: React.FC = () => {
  return (
    <>
      <section className="bg-[#FFFFFF] pt-20">
        <div className="relative w-full max-w-[1040px] !mt-20 m-auto">
          <img
            src={Plane_Image}
            alt=""
            className="absolute w-[600px] top-[-160px] left-[-218px]"
          />
        </div>
      </section>
      <section
        style={{ backgroundImage: `url(${readyToFlyBgImg})` }}
        className="bg-no-repeat bg-center bg-cover py-20px"
      >
        <div>
          <div className="w-full max-w-[1040px] !mt-20 !mb-20 m-auto">
            <h5 className="text-[40px] leading-[100%] text-center text-[#FFFFFF] mt-20 mb-5">
              Ready to take a trip around <br />
              the world with us?
            </h5>
            <p className="text-[12px] text-[#FFFFFF] text-center max-w-[374px] !mb-10 m-auto">
              Book your travel with our reliable, transparent platform that is
              committed to customer satisfaction.
            </p>

            <div className="flex justify-center mt-1">
              <button className="h-8 px-6 rounded-md bg-[#FFFFFF] text-[#2351A3] text-[12px] font-medium shadow-sm">
                Book a flight
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ReadyToFlySection;
