import React from "react";
import ReadyToFlySection from "../components/molecules/ReadyToFlySection";
import Footer from "../components/organisms/Footer"; 

const CookiesPolicyPage: React.FC = () => {
  return (
    <div className="w-full">
      {/* Navbar will be here - assuming it's in your layout component */}
      
      {/* Cookies Policy Content Section - Exact as per images */}
      <section className="w-full py-16 md:py-24">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex flex-col items-center">
            {/* Main content container with 578px width as specified */}
            <div className="w-full max-w-[578px] mx-auto">
              {/* Main Heading */}
              <h1
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 500,
                  fontSize: 42,
                  lineHeight: "100%",
                  color: "#1A1E26",
                  textAlign: "center",
                  marginBottom: 24,
                  width: 471,
                  height: 86,
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              >
                Our Cookies Policy
              </h1>

              {/* Last Updated */}
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 600,
                  fontSize: 18,
                  lineHeight: "100%",
                  color: "#1A1E26",
                  marginBottom: 32,
                  textAlign: "left",
                }}
              >
                Last Updated: 25 - Feb - 2026
              </p>

              {/* Introduction Paragraph */}
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 400,
                  fontSize: 18,
                  lineHeight: "100%",
                  color: "#4A4E57",
                  marginBottom: 48,
                  textAlign: "left",
                }}
              >
                At Al-Rias, we believe in being clear and open about how we collect and use data related to you. This policy provides detailed information about how and when we use cookies on our website.
              </p>

              {/* Section 1: What is a Cookie? */}
              <div className="mb-12">
                <h2
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 700,
                    fontSize: 18,
                    lineHeight: "100%",
                    color: "#1A1E26",
                    marginBottom: 16,
                  }}
                >
                  1. What is a Cookie?
                </h2>
                <p
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 400,
                    fontSize: 18,
                    lineHeight: "100%",
                    color: "#4A4E57",
                    margin: 0,
                  }}
                >
                  A cookie is a small text file that is placed on your hard drive by a web page server. Cookies contain information that can later be read by a web server in the domain that issued the cookie to you. They cannot be used to run programs or deliver viruses to your computer.
                </p>
              </div>

              {/* Section 2: How We Use Cookies */}
              <div className="mb-12">
                <h2
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 500,
                    fontSize: 18,
                    lineHeight: "100%",
                    color: "#1A1E26",
                    marginBottom: 16,
                  }}
                >
                  2. How We Use Cookies
                </h2>
                <p
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 400,
                    fontSize: 18,
                    lineHeight: "100%",
                    color: "#4A4E57",
                    marginBottom: 24,
                  }}
                >
                  We use cookies to enhance your power browsing experience. Specifically, we use them for:
                </p>
                
                {/* Updated with left margin and bullet points */}
                <div className="space-y-4 ml-6">
                  <div className="flex items-start">
                    <span className="mr-3 text-[#4A4E57]">•</span>
                    <div>
                      <span
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontWeight: 600,
                          fontSize: 18,
                          lineHeight: "100%",
                          color: "#1A1E26",
                        }}
                      >
                        Essential Operations:{' '}
                      </span>
                      <span
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontWeight: 400,
                          fontSize: 18,
                          lineHeight: "100%",
                          color: "#4A4E57",
                        }}
                      >
                        Keeping you signed in and remembering your preferences.
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <span className="mr-3 text-[#4A4E57]">•</span>
                    <div>
                      <span
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontWeight: 600,
                          fontSize: 18,
                          lineHeight: "100%",
                          color: "#1A1E26",
                        }}
                      >
                        Performance:{' '}
                      </span>
                      <span
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontWeight: 400,
                          fontSize: 18,
                          lineHeight: "100%",
                          color: "#4A4E57",
                        }}
                      >
                        Understanding how you use our site so we can make it faster and easier to navigate.
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <span className="mr-3 text-[#4A4E57]">•</span>
                    <div>
                      <span
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontWeight: 600,
                          fontSize: 18,
                          lineHeight: "100%",
                          color: "#1A1E26",
                        }}
                      >
                        Analytics:{' '}
                      </span>
                      <span
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontWeight: 400,
                          fontSize: 18,
                          lineHeight: "100%",
                          color: "#4A4E57",
                        }}
                      >
                        Tracking which pages are popular so we can create more of the content you love.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Types of Cookies We Use */}
              <div className="mb-12">
                <h2
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 500,
                    fontSize: 18,
                    lineHeight: "100%",
                    color: "#1A1E26",
                    marginBottom: 16,
                  }}
                >
                  3. Types of Cookies We Use
                </h2>
                
                <div className="space-y-4 ml-6">
                  <div className="flex items-start">
                    <span className="mr-3 text-[#4A4E57]">•</span>
                    <div>
                      <span
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontWeight: 600,
                          fontSize: 18,
                          lineHeight: "100%",
                          color: "#1A1E26",
                        }}
                      >
                        Strictly Necessary:{' '}
                      </span>
                      <span
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontWeight: 400,
                          fontSize: 18,
                          lineHeight: "100%",
                          color: "#4A4E57",
                        }}
                      >
                        Required for the website to function (e.g., security and login).
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <span className="mr-3 text-[#4A4E57]">•</span>
                    <div>
                      <span
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontWeight: 600,
                          fontSize: 18,
                          lineHeight: "100%",
                          color: "#1A1E26",
                        }}
                      >
                        Functional:{' '}
                      </span>
                      <span
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontWeight: 400,
                          fontSize: 18,
                          lineHeight: "100%",
                          color: "#4A4E57",
                        }}
                      >
                        Remembers your settings, like language or region.
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <span className="mr-3 text-[#4A4E57]">•</span>
                    <div>
                      <span
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontWeight: 600,
                          fontSize: 18,
                          lineHeight: "100%",
                          color: "#1A1E26",
                        }}
                      >
                        Analytical:{' '}
                      </span>
                      <span
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontWeight: 400,
                          fontSize: 18,
                          lineHeight: "100%",
                          color: "#4A4E57",
                        }}
                      >
                        Helps us count visitors and see how they move around the site.
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <span className="mr-3 text-[#4A4E57]">•</span>
                    <div>
                      <span
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontWeight: 600,
                          fontSize: 18,
                          lineHeight: "100%",
                          color: "#1A1E26",
                        }}
                      >
                        Marketing:{' '}
                      </span>
                      <span
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontWeight: 400,
                          fontSize: 18,
                          lineHeight: "100%",
                          color: "#4A4E57",
                        }}
                      >
                        Used to deliver advertisements that are relevant to your interests.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider Line */}
              <hr className="my-12 border-t border-gray-200" />

              {/* Section 4: Your Choices */}
              <div className="mb-12">
                <h2
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 500,
                    fontSize: 18,
                    lineHeight: "100%",
                    color: "#1A1E26",
                    marginBottom: 16,
                  }}
                >
                  4. Your Choices
                </h2>
                <p
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 400,
                    fontSize: 18,
                    lineHeight: "100%",
                    color: "#4A4E57",
                    marginBottom: 16,
                  }}
                >
                  Most web browsers automatically accept cookies, but you can usually modify your browser setting to decline cookies if you prefer.
                </p>
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                  <p
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 600,
                      fontSize: 18,
                      lineHeight: "100%",
                      color: "#856404",
                      margin: 0,
                    }}
                  >
                    Note:{' '}
                    <span
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 400,
                        fontSize: 18,
                        lineHeight: "100%",
                        color: "#856404",
                      }}
                    >
                      If you choose to decline cookies, you may not be able to sign in or use other interactive features of our site that depend on cookies.
                    </span>
                  </p>
                </div>
              </div>

              {/* Section 5: Changes to This Policy */}
              <div className="mb-12">
                <h2
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 500,
                    fontSize: 18,
                    lineHeight: "100%",
                    color: "#1A1E26",
                    marginBottom: 16,
                  }}
                >
                  5. Changes to This Policy
                </h2>
                <p
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 400,
                    fontSize: 18,
                    lineHeight: "100%",
                    color: "#4A4E57",
                    margin: 0,
                  }}
                >
                  We may update this policy from time to time to reflect changes in technology or legislation. We encourage you to check back periodically to stay informed.
                </p>
              </div>

              {/* Divider Line */}
              <hr className="my-12 border-t border-gray-200" />

              {/* Contact Section */}
              <div className="text-center">
                <h2
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 500,
                    fontSize: 18,
                    lineHeight: "100%",
                    color: "#1A1E26",
                    marginBottom: 16,
                  }}
                >
                  Contact Us:
                </h2>
                <p
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 400,
                    fontSize: 18,
                    lineHeight: "100%",
                    color: "#4A4E57",
                    marginBottom: 16,
                  }}
                >
                  If you have any questions about our use of cookies, please contact us at:
                </p>
                <a 
                  href="mailto:contact@al-rais.com"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 500,
                    fontSize: 18,
                    lineHeight: "100%",
                    color: "#2351A3",
                    textDecoration: "underline",
                  }}
                >
                  contact@al-rais.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ready to Fly Section */}
      <ReadyToFlySection />

    </div>
  );
};

export default CookiesPolicyPage;