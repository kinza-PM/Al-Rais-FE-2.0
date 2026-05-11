import React, { useState, useRef, useEffect, useMemo } from "react";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import Input from "../components/atoms/Input";
import Button from "../components/atoms/Button";
import { Select } from "antd";
import toast from "react-hot-toast";
import { getTicketReasons, createTicket } from "../services/api/customerSupport";
import { useAuth } from "../features/auth/hooks/useAuth";

const CustomerSupportPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    reason: "",
  });
  const [phoneCountryCode, setPhoneCountryCode] = useState("+971");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [reasonOptions, setReasonOptions] = useState<{ value: string; label: string }[]>([]);
  const [reasonMap, setReasonMap] = useState<Record<string, string>>({}); // Map reason ID to reason name
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    phone: false,
    reason: false,
    message: false,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEmailValid = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const errors = useMemo(() => ({
    name: !formData.name.trim() ? "Name is required." : null,
    email: !formData.email.trim()
      ? "Email is required."
      : !isEmailValid(formData.email)
      ? "Enter a valid email address."
      : null,
    phone: !phoneNumber.trim() ? "Phone number is required." : null,
    reason: !formData.reason ? "Please select a reason." : null,
    message: !formData.message.trim() ? "Message is required." : null,
  }), [formData, phoneNumber]);

  useEffect(() => {
    const fetchReasons = async () => {
      try {
        const response = await getTicketReasons();
        const activeReasons = response.data
          .filter((item) => item.status === true)
          .map((item) => ({
            value: item.id,
            label: item.reason,
          }));
        setReasonOptions(activeReasons);
        
        // Build mapping of reason ID to reason name
        const map: Record<string, string> = {};
        response.data.forEach((item) => {
          map[item.id] = item.reason;
        });
        setReasonMap(map);
      } catch (error) {
        console.error("Failed to fetch ticket reasons:", error);
      }
    };
    fetchReasons();
  }, []);

  // Preload user data if authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || user.full_name || prev.name,
        email: user.email || prev.email,
      }));
      if (user.phone) {
        // Parse phone if it includes country code
        if (user.phone.startsWith("+")) {
          const match = user.phone.match(/^(\+\d{1,4})(\d+)$/);
          if (match) {
            setPhoneCountryCode(match[1]);
            setPhoneNumber(match[2]);
          } else {
            setPhoneNumber(user.phone);
          }
        } else {
          setPhoneNumber(user.phone);
        }
      }
    }
  }, [isAuthenticated, user]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (field: keyof typeof touched) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleReasonChange = (value: string) => {
    setFormData((prev) => ({ ...prev, reason: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const validFiles = Array.from(files).filter((file) => {
        const isValidType = ["image/jpeg", "image/png", "application/pdf"].includes(file.type);
        const isValidSize = file.size <= 15 * 1024 * 1024; // 15MB
        return isValidType && isValidSize;
      });
      setAttachments((prev) => [...prev, ...validFiles]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setTouched({ name: true, email: true, phone: true, reason: true, message: true });

    if (errors.name || errors.email || errors.phone || errors.reason || errors.message) {
      toast.error("Please fill in all required fields correctly.");
      return;
    }

    setLoading(true);
    try {
      await createTicket({
        name: formData.name,
        email: formData.email,
        contact: {
          code: phoneCountryCode,
          number: phoneNumber,
        },
        reason: reasonMap[formData.reason] || formData.reason,
        message: formData.message,
        attachments: attachments.length > 0 ? attachments : undefined,
      });
      // Only reset form on successful ticket creation
      setFormData({ name: "", email: "", message: "", reason: "" });
      setPhoneCountryCode("+971");
      setPhoneNumber("");
      setAttachments([]);
      setTouched({ name: false, email: false, phone: false, reason: false, message: false });
      toast.success("Your message has been sent successfully!");
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
      console.error("Create ticket error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E0F4FF] to-white ">
      {/* Header with gradient background */}
      <div className="py-10 px-4">
        <h2 className="text-center text-3xl font-semibold mb-3">
          Contact Support
        </h2>
        <p className="text-center text-md text-gray-500">
          We are always ready to help, hear your suggestions and inquiries.
        </p>
      </div>

      {/* Form Container — extra bottom padding clears fixed chat FAB over submit */}
      <div className="max-w-xl mx-auto px-4 pb-24 sm:pb-28">
        <div className="bg-white rounded-xl border border-[#E4E4E7] w-full px-6 py-8 -mt-2">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Your name */}
            <div>
              <label className="text-xs font-normal text-[#3D495C] mb-1 block">
                Your name
              </label>
              <Input
                type="text"
                name="name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleInputChange}
                onBlur={() => handleBlur("name")}
                rounded="xl"
              />
              {touched.name && errors.name && (
                <p className="text-xs text-red-500 mt-1">{errors.name}</p>
              )}
            </div>

            {/* Email for contact */}
            <div>
              <label className="text-xs font-normal text-[#3D495C] mb-1 block">
                Email for contact
              </label>
              <Input
                type="email"
                name="email"
                placeholder="example@email.com"
                value={formData.email}
                onChange={handleInputChange}
                onBlur={() => handleBlur("email")}
                rounded="xl"
              />
              {touched.email && errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email}</p>
              )}
            </div>

            {/* Phone for contact */}
            <div>
              <label className="text-xs font-normal text-[#3D495C] mb-1 block">
                Phone for contact
              </label>
              <div className="flex gap-2">
                <PhoneInput
                  defaultCountry="ae"
                  value={`${phoneCountryCode}${phoneNumber}`}
                  onChange={(phone, meta) => {
                    setPhoneCountryCode(`+${meta.country.dialCode}`);
                    setPhoneNumber(phone.replace(`+${meta.country.dialCode}`, ""));
                  }}
                  hideDropdown={false}
                  forceDialCode={true}
                  style={{
                    width: "100%",
                    display: "flex",
                    gap: "8px",
                  }}
                  countrySelectorStyleProps={{
                    buttonStyle: {
                      minWidth: "100px",
                      height: "40px",
                      borderRadius: "12px",
                      border: "1px solid #C2CAD6",
                      background: "white",
                      padding: "8px 12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "8px",
                    },
                  }}
                  inputStyle={{
                    width: "100%",
                    flex: 1,
                    height: "40px",
                    borderRadius: "12px",
                    border: "1px solid #C2CAD6",
                    padding: "8px 12px",
                    fontSize: "14px",
                    color: "#3D495C",
                    fontFamily: "inherit",
                  }}
                  inputProps={{
                    placeholder: "123 456 7890",
                    onBlur: () => handleBlur("phone"),
                  }}
                />
              </div>
              {touched.phone && errors.phone && (
                <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
              )}
            </div>

            {/* Select a reason */}
            <div>
              <label className="text-xs font-normal text-[#3D495C] mb-1 block">
                Select a reason
              </label>
              <Select
                placeholder="What's your reason for contacting us?"
                value={formData.reason || undefined}
                onChange={handleReasonChange}
                onBlur={() => handleBlur("reason")}
                options={reasonOptions}
                className="w-full h-10 support-select"
                suffixIcon={
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 20 20"
                    fill="none"
                  >
                    <path
                      d="M5 7.5l5 5 5-5"
                      stroke="#2351A3"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                }
              />
              <style>{`
                .support-select .ant-select-selector {
                  border-radius: 12px !important;
                  height: 40px !important;
                  border-color: #C2CAD6 !important;
                }
              `}</style>
              {touched.reason && errors.reason && (
                <p className="text-xs text-red-500 mt-1">{errors.reason}</p>
              )}
            </div>

            {/* Your message */}
            <div>
              <label className="text-xs font-normal text-[#3D495C] mb-1 block">
                Your message
              </label>
              <div className="relative">
                <textarea
                  name="message"
                  placeholder="Write something..."
                  value={formData.message}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur("message")}
                  maxLength={1000}
                  rows={4}
                  className="w-full px-3 py-2 border border-[#C2CAD6] rounded-xl text-sm text-[#3D495C] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#2351A3] focus:border-[#2351A3] resize-none"
                />
                <span className="absolute bottom-2 right-3 text-xs text-gray-400">
                  {formData.message.length}/1000
                </span>
              </div>
              {touched.message && errors.message && (
                <p className="text-xs text-red-500 mt-1">{errors.message}</p>
              )}
            </div>

            {/* Add attachments */}
            <div>
              <label className="text-xs font-normal text-[#3D495C] mb-1 block">
                Add attachments
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-between px-3 py-2 border border-[#C2CAD6] rounded-xl cursor-pointer hover:border-[#2351A3] transition-colors"
              >
                <span className="text-sm text-gray-400">Upload a file</span>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 16V8M12 8L9 11M12 8L15 11"
                    stroke="#2351A3"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z"
                    stroke="#2351A3"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
              <p className="text-xs text-gray-400 mt-1">
                JPGs, PDFs and PNGs are allowed. Max file size is 15 MBs
              </p>

              {/* Attached files list */}
              {attachments.length > 0 && (
                <div className="mt-2 space-y-1">
                  {attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg text-sm"
                    >
                      <span className="text-[#3D495C] truncate max-w-[200px]">
                        {file.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            {/* from #5282d8 to #091428 */}
            <div className="flex justify-center pt-4">
              <Button
                type="submit"
                disabled={loading}
                overrideClasses
                className="min-w-[140px] px-12 py-3 rounded-full font-semibold shadow-md border-0 transition-opacity hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundImage: "linear-gradient(90deg, #5282d8 0%, #091428 100%)",
                  color: "#ffffff",
                }}
              >
                {loading ? "Sending..." : "Send"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CustomerSupportPage;