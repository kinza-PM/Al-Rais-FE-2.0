import React from "react";
import "../../assets/css/travel.css";
import { Col, Row, Checkbox } from "antd";
import type { CheckboxProps } from "antd";

type PricingDetailCardProps = {
  passSome: any[];
};

const PricingDetailCard: React.FC<PricingDetailCardProps> = ({ passSome }) => {
  console.log("passSome", passSome);

  const CrossIcon = () => (
    <svg
      width="21"
      height="20"
      viewBox="0 0 21 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10.667 1.875C9.06002 1.875 7.48914 2.35152 6.15299 3.24431C4.81684 4.1371 3.77544 5.40605 3.16047 6.8907C2.54551 8.37535 2.38461 10.009 2.69812 11.5851C3.01162 13.1612 3.78545 14.6089 4.92175 15.7452C6.05805 16.8815 7.50579 17.6554 9.08189 17.9689C10.658 18.2824 12.2916 18.1215 13.7763 17.5065C15.2609 16.8916 16.5299 15.8502 17.4227 14.514C18.3155 13.1779 18.792 11.607 18.792 10C18.7897 7.84581 17.933 5.78051 16.4097 4.25727C14.8865 2.73403 12.8212 1.87727 10.667 1.875ZM13.6092 12.0578C13.6673 12.1159 13.7133 12.1848 13.7447 12.2607C13.7762 12.3366 13.7923 12.4179 13.7923 12.5C13.7923 12.5821 13.7762 12.6634 13.7447 12.7393C13.7133 12.8152 13.6673 12.8841 13.6092 12.9422C13.5511 13.0003 13.4822 13.0463 13.4063 13.0777C13.3304 13.1092 13.2491 13.1253 13.167 13.1253C13.0849 13.1253 13.0036 13.1092 12.9277 13.0777C12.8518 13.0463 12.7829 13.0003 12.7248 12.9422L10.667 10.8836L8.60918 12.9422C8.55111 13.0003 8.48218 13.0463 8.40631 13.0777C8.33044 13.1092 8.24912 13.1253 8.167 13.1253C8.08487 13.1253 8.00356 13.1092 7.92769 13.0777C7.85181 13.0463 7.78288 13.0003 7.72481 12.9422C7.66674 12.8841 7.62068 12.8152 7.58925 12.7393C7.55782 12.6634 7.54165 12.5821 7.54165 12.5C7.54165 12.4179 7.55782 12.3366 7.58925 12.2607C7.62068 12.1848 7.66674 12.1159 7.72481 12.0578L9.7834 10L7.72481 7.94219C7.60753 7.82491 7.54165 7.66585 7.54165 7.5C7.54165 7.33415 7.60753 7.17509 7.72481 7.05781C7.84208 6.94054 8.00114 6.87465 8.167 6.87465C8.33285 6.87465 8.49191 6.94054 8.60918 7.05781L10.667 9.11641L12.7248 7.05781C12.7829 6.99974 12.8518 6.95368 12.9277 6.92225C13.0036 6.89083 13.0849 6.87465 13.167 6.87465C13.2491 6.87465 13.3304 6.89083 13.4063 6.92225C13.4822 6.95368 13.5511 6.99974 13.6092 7.05781C13.6673 7.11588 13.7133 7.18482 13.7447 7.26069C13.7762 7.33656 13.7923 7.41788 13.7923 7.5C13.7923 7.58212 13.7762 7.66344 13.7447 7.73931C13.7133 7.81518 13.6673 7.88412 13.6092 7.94219L11.5506 10L13.6092 12.0578Z"
        fill="#EA0029"
      />
    </svg>
  );

  const baggage: CheckboxProps["onChange"] = (e) => {
    console.log(`checked = ${e.target.checked}`);
  };

  const OkCheckIcon = () => (
    <svg
      width="17"
      height="18"
      viewBox="0 0 17 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.667 0.875C7.06002 0.875 5.48914 1.35152 4.15299 2.24431C2.81684 3.1371 1.77544 4.40605 1.16047 5.8907C0.545513 7.37535 0.384611 9.00901 0.698115 10.5851C1.01162 12.1612 1.78545 13.6089 2.92175 14.7452C4.05805 15.8815 5.50579 16.6554 7.08189 16.9689C8.65798 17.2824 10.2916 17.1215 11.7763 16.5065C13.2609 15.8916 14.5299 14.8502 15.4227 13.514C16.3155 12.1779 16.792 10.607 16.792 9C16.7897 6.84581 15.933 4.78051 14.4097 3.25727C12.8865 1.73403 10.8212 0.877275 8.667 0.875ZM12.2342 7.56719L7.85918 11.9422C7.80114 12.0003 7.73221 12.0464 7.65633 12.0779C7.58046 12.1093 7.49913 12.1255 7.417 12.1255C7.33486 12.1255 7.25353 12.1093 7.17766 12.0779C7.10178 12.0464 7.03285 12.0003 6.97481 11.9422L5.09981 10.0672C4.98253 9.94991 4.91665 9.79085 4.91665 9.625C4.91665 9.45915 4.98253 9.30009 5.09981 9.18281C5.21708 9.06554 5.37614 8.99965 5.542 8.99965C5.70785 8.99965 5.86691 9.06554 5.98418 9.18281L7.417 10.6164L11.3498 6.68281C11.4079 6.62474 11.4768 6.57868 11.5527 6.54725C11.6286 6.51583 11.7099 6.49965 11.792 6.49965C11.8741 6.49965 11.9554 6.51583 12.0313 6.54725C12.1072 6.57868 12.1761 6.62474 12.2342 6.68281C12.2923 6.74088 12.3383 6.80982 12.3697 6.88569C12.4012 6.96156 12.4173 7.04288 12.4173 7.125C12.4173 7.20712 12.4012 7.28844 12.3697 7.36431C12.3383 7.44018 12.2923 7.50912 12.2342 7.56719Z"
        fill="#00B868"
      />
    </svg>
  );

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
            <Row>
              <Col span={8} className="">
                <div className="priceCardHeadings">
                  <p>Economy lite</p>
                </div>
                <div className="parahAlign">
                  <OkCheckIcon />
                  <p>01 item (e.g., small backpack, laptop bag)</p>
                </div>
                <div className="parahAlign">
                  <CrossIcon />
                </div>
                <div className="parahAlign">
                  <CrossIcon />
                  <p>Assigned at check-in</p>
                </div>
                <div className="parahAlign">
                  <CrossIcon />
                  <p>with very high fee</p>
                </div>
                <div className="parahAlign">
                  <CrossIcon />
                </div>
                <div className="cardPrice">
                  <p>
                    $48<span>/per seat</span>
                  </p>
                  <Checkbox className="baggageCheckbox" onChange={baggage}>
                    Select this option
                  </Checkbox>
                </div>
              </Col>
              <Col span={8} className="">
                <div className="priceCardHeadings">
                  <p>Economy Standard</p>
                </div>
                <div className="parahAlign">
                  <OkCheckIcon />
                  <p>01 item (e.g., small backpack, laptop bag)</p>
                </div>
                <div className="parahAlign">
                  <CrossIcon />
                  <p>01 item (up to 20kg)</p>
                </div>
                <div className="parahAlign">
                  <OkCheckIcon />
                  <p>Standard (free)</p>
                </div>
                <div className="parahAlign">
                  <OkCheckIcon />
                  <p>$4 + fare difference</p>
                </div>
                <div className="parahAlign">
                  <CrossIcon />
                </div>
                <div className="cardPrice">
                  <p>
                    $52<span>/per seat</span>
                  </p>
                  <Checkbox className="baggageCheckbox" onChange={baggage}>
                    This option is selected
                  </Checkbox>
                </div>
              </Col>
              <Col span={8} className="">
                <div className="priceCardHeadings">
                  <p>Economy Flex</p>
                </div>
                <div className="parahAlign">
                  <OkCheckIcon />
                  <p>01 item (e.g., small backpack, laptop bag)</p>
                </div>
                <div className="parahAlign">
                  <CrossIcon />
                  <p>02 items (up to 20kg each)</p>
                </div>
                <div className="parahAlign">
                  <OkCheckIcon />
                  <p>Any (free, including preferred seats)</p>
                </div>
                <div className="parahAlign">
                  <OkCheckIcon />
                  <p>Free (fare differences may apply)</p>
                </div>
                <div className="parahAlign">
                  <OkCheckIcon />
                  <p>with a small fee</p>
                </div>
                <div className="cardPrice">
                  <p>
                    $52<span>/per seat</span>
                  </p>
                  <Checkbox className="baggageCheckbox" onChange={baggage}>
                    Select this option
                  </Checkbox>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default PricingDetailCard;
