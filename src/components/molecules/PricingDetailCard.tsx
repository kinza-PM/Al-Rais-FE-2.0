import React, { useState } from "react";
import "../../assets/css/travel.css";
import CrossIcon from "../../assets/svgs/redCross.svg";
import OkCheckIcon from "../../assets/svgs/greenTic.svg";
import { Col, Row, Radio } from "antd";

type PricingDetailCardProps = {
  passSome: any[];
};

const PricingDetailCard: React.FC<PricingDetailCardProps> = ({ passSome }) => {
  const [selectedPlan, setSelectedPlan] = useState("economyStandard");

  return (
    <div className="">
      <div className="pricingCardsWrap">
        <Row>
          <Col span={3} className="">
            <div className="emptyLabel">
              <p>&nbsp;</p>
            </div>
            <div className="priceCardLabel">
              <p>Personal Items</p>
            </div>
            <div className="priceCardLabel">
              <p>Baggage</p>
            </div>
            <div className="priceCardLabel">
              <p>Seat Selection</p>
            </div>
            <div className="priceCardLabel">
              <p>Changes</p>
            </div>
            <div className="priceCardLabel">
              <p>Refundable</p>
            </div>
            <div className="priceCardLabel">
              <p>&nbsp;</p>
            </div>
          </Col>
          <Col span={21} className="">
            {passSome.map((item, index) => (
              <Row>
                <Col
                  key={index}
                  span={8}
                  className={selectedPlan === "economyLite" ? "activeCard" : ""}
                >
                  <div className="priceCardHeadings">
                    <p>Economy lite</p>
                  </div>
                  <div className="parahAlign">
                    <img src={OkCheckIcon} alt="" />
                    <p>{item.price.economyLite.personalItem}</p>
                  </div>
                  <div className="parahAlign">
                    <img src={CrossIcon} alt="" />
                    <p>{item.price.economyLite.baggage}</p>
                  </div>
                  <div className="parahAlign">
                    <img src={CrossIcon} alt="" />
                    <p>{item.price.economyLite.seatSelection}</p>
                  </div>
                  <div className="parahAlign">
                    <img src={CrossIcon} alt="" />
                    <p>{item.price.economyLite.Changes}</p>
                  </div>
                  <div className="parahAlign">
                    <img src={CrossIcon} alt="" />
                    <p>{item.price.economyLite.Refundable}</p>
                  </div>

                  <div className="cardPrice">
                    <p>
                      ${item.price.economyLite.price}
                      <span>/per seat</span>
                    </p>
                    <Radio
                      className={`baggageRadio ${
                        selectedPlan === "economyLite" ? "active" : ""
                      }`}
                      checked={selectedPlan === "economyLite"}
                      onChange={() => setSelectedPlan("economyLite")}
                    >
                      {selectedPlan === "economyLite"
                        ? "This option is selected"
                        : "Select this option"}
                    </Radio>
                  </div>
                </Col>
                <Col
                  key={index}
                  span={8}
                  className={
                    selectedPlan === "economyStandard" ? "activeCard" : ""
                  }
                >
                  <div className="priceCardHeadings">
                    <p>Economy Standard</p>
                  </div>
                  <div className="parahAlign">
                    <img src={OkCheckIcon} alt="" />
                    <p>{item.price.economyStandard.personalItem}</p>
                  </div>
                  <div className="parahAlign">
                    <img src={CrossIcon} alt="" />
                    <p>{item.price.economyStandard.baggage}</p>
                  </div>
                  <div className="parahAlign">
                    <img src={OkCheckIcon} alt="" />
                    <p>{item.price.economyStandard.seatSelection}</p>
                  </div>
                  <div className="parahAlign">
                    <img src={OkCheckIcon} alt="" />
                    <p>{item.price.economyStandard.Changes}</p>
                  </div>
                  <div className="parahAlign">
                    <img src={CrossIcon} alt="" />
                    {item.price.economyStandard.Refundable}
                  </div>

                  <div className="cardPrice">
                    <p>
                      ${item.price.economyStandard.price}
                      <span>/per seat</span>
                    </p>
                    <Radio
                      className={`baggageRadio ${
                        selectedPlan === "economyStandard" ? "active" : ""
                      }`}
                      checked={selectedPlan === "economyStandard"}
                      onChange={() => setSelectedPlan("economyStandard")}
                    >
                      {selectedPlan === "economyStandard"
                        ? "This option is selected"
                        : "Select this option"}
                    </Radio>
                  </div>
                </Col>
                <Col
                  key={index}
                  span={8}
                  className={selectedPlan === "economyFlex" ? "activeCard" : ""}
                >
                  <div className="priceCardHeadings">
                    <p>Economy Flex</p>
                  </div>
                  <div className="parahAlign">
                    <img src={OkCheckIcon} alt="" />
                    <p>{item.price.economyFlex.personalItem}</p>
                  </div>
                  <div className="parahAlign">
                    <img src={CrossIcon} alt="" />
                    <p>{item.price.economyFlex.baggage}</p>
                  </div>
                  <div className="parahAlign">
                    <img src={OkCheckIcon} alt="" />
                    <p>{item.price.economyFlex.seatSelection}</p>
                  </div>
                  <div className="parahAlign">
                    <img src={OkCheckIcon} alt="" />
                    <p>{item.price.economyFlex.Changes}</p>
                  </div>
                  <div className="parahAlign">
                    <img src={OkCheckIcon} alt="" />
                    <p>{item.price.economyFlex.Refundable}</p>
                  </div>

                  <div className="cardPrice">
                    <p>
                      ${item.price.economyFlex.price}
                      <span>/per seat</span>
                    </p>
                    <Radio
                      className={`baggageRadio ${
                        selectedPlan === "economyFlex" ? "active" : ""
                      }`}
                      checked={selectedPlan === "economyFlex"}
                      onChange={() => setSelectedPlan("economyFlex")}
                    >
                      {selectedPlan === "economyFlex"
                        ? "This option is selected"
                        : "Select this option"}
                    </Radio>
                  </div>
                </Col>
              </Row>
            ))}
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default PricingDetailCard;
