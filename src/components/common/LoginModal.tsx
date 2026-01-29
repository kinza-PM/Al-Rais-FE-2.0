import { Modal } from "antd";
import Button from "../atoms/Button";
import TailwindCustomInput from "./TailwindCustomInput";
import { useMemo, useState } from "react";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function LoginModal({ showModal }: { showModal?: boolean }) {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [usePhone, setUsePhone] = useState(false);
    const [loginMessage, setLoginMessage] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { login, loading, error } = useAuth();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const isEmailValid = (value: string) => {
        const trimmed = value.trim();
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginMessage(null);

        if (!isFormValid) {
            return;
        }

        if (!formData.email || !formData.password) return;

        const result = await login(formData);
        if (result.success) {
            // Don't hard-reload the app; it causes jarring UX and can re-trigger bootstrap calls.
            // Close happens naturally because parent drives `showModal` from auth state.
            setLoginMessage("Login successful");
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        }
    };

    const isFormValid = useMemo(() => {
        const emailTrim = formData.email.trim();
        const passTrim = formData.password.trim();

        if (!emailTrim || !passTrim) return false;
        if (!usePhone && !isEmailValid(emailTrim)) return false;
        return true;
    }, [formData, usePhone]);

    const openSignupPage = () => {
        navigate("/auth", { state: { mode: "signup" } });
    };

    return (
        <Modal
            closable={false}
            open={showModal}
            footer={null}
            centered={true}
            className="compareModal"
        >
            <div className="flex flex-col items-center">
                <div className="w-full px-6 py-4">
                    <h2 className="text-center text-lg font-semibold">Sign in to continue your booking</h2>
                </div>


                <div className="mt-6 w-full flex justify-center">
                    <div className="inline-flex rounded-full bg-gray-100 p-1 shadow-sm">
                        <Button
                            aria-pressed="true"
                            className={`px-5 py-2 rounded-full text-sm font-medium ${!usePhone ? 'bg-primary text-white shadow' : 'bg-transparent text-gray-700'}`}
                            type="button"
                            overrideClasses
                            onClick={() => setUsePhone(false)}
                        >
                            Email
                        </Button>
                        <Button
                            aria-pressed="false"
                            className={`px-5 py-2 rounded-full text-sm font-medium ${usePhone ? 'bg-primary text-white shadow' : 'bg-transparent text-gray-700'}`}
                            type="button"
                            overrideClasses
                            onClick={() => setUsePhone(true)}
                        >
                            Phone
                        </Button>
                    </div>
                </div>


                <div className="w-full max-w-md px-6 pb-6">
                    <div className="bg-white rounded-2xl p-6">
                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">{usePhone ? 'Phone' : 'Email'}</label>
                                <TailwindCustomInput
                                    type={usePhone ? 'tel' : 'email'}
                                    name="email"
                                    placeholder={usePhone ? 'Enter your phone number' : 'Enter your email'}
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full rounded-lg border border-gray-200 px-4 py-3 placeholder-gray-400 focus:outline-none"
                                />
                            </div>


                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                                <div className="relative">
                                    <TailwindCustomInput
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        placeholder="Password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className="w-full rounded-lg border border-gray-200 px-4 py-3 pr-12 placeholder-gray-400 focus:outline-none"
                                    />
                                    <span className="absolute right-3 top-7 -translate-y-1/2 text-sm text-gray-500 hover:text-gray-700 cursor-pointer" aria-hidden="true" onClick={togglePasswordVisibility}>
                                        {showPassword ? (
                                            <svg width="20" height="14" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M19.3211 6.74688C19.2937 6.68516 18.632 5.21719 17.1609 3.74609C15.2008 1.78594 12.725 0.75 9.99999 0.75C7.27499 0.75 4.79921 1.78594 2.83905 3.74609C1.36796 5.21719 0.703118 6.6875 0.678899 6.74688C0.643362 6.82681 0.625 6.91331 0.625 7.00078C0.625 7.08826 0.643362 7.17476 0.678899 7.25469C0.706243 7.31641 1.36796 8.78359 2.83905 10.2547C4.79921 12.2141 7.27499 13.25 9.99999 13.25C12.725 13.25 15.2008 12.2141 17.1609 10.2547C18.632 8.78359 19.2937 7.31641 19.3211 7.25469C19.3566 7.17476 19.375 7.08826 19.375 7.00078C19.375 6.91331 19.3566 6.82681 19.3211 6.74688ZM9.99999 12C7.5953 12 5.49452 11.1258 3.75546 9.40234C3.0419 8.69273 2.43483 7.88356 1.95312 7C2.4347 6.11636 3.04179 5.30717 3.75546 4.59766C5.49452 2.87422 7.5953 2 9.99999 2C12.4047 2 14.5055 2.87422 16.2445 4.59766C16.9595 5.307 17.5679 6.11619 18.0508 7C17.4875 8.05156 15.0336 12 9.99999 12ZM9.99999 3.25C9.25831 3.25 8.53329 3.46993 7.9166 3.88199C7.29992 4.29404 6.81927 4.87971 6.53544 5.56494C6.25162 6.25016 6.17735 7.00416 6.32205 7.73159C6.46674 8.45902 6.82389 9.1272 7.34834 9.65165C7.87279 10.1761 8.54097 10.5333 9.2684 10.6779C9.99583 10.8226 10.7498 10.7484 11.4351 10.4645C12.1203 10.1807 12.7059 9.70007 13.118 9.08339C13.5301 8.4667 13.75 7.74168 13.75 7C13.749 6.00576 13.3535 5.05253 12.6505 4.34949C11.9475 3.64645 10.9942 3.25103 9.99999 3.25ZM9.99999 9.5C9.50554 9.5 9.02219 9.35338 8.61107 9.07867C8.19994 8.80397 7.87951 8.41352 7.69029 7.95671C7.50107 7.49989 7.45157 6.99723 7.54803 6.51227C7.64449 6.02732 7.88259 5.58186 8.23222 5.23223C8.58186 4.8826 9.02731 4.6445 9.51227 4.54804C9.99722 4.45157 10.4999 4.50108 10.9567 4.6903C11.4135 4.87952 11.804 5.19995 12.0787 5.61107C12.3534 6.0222 12.5 6.50555 12.5 7C12.5 7.66304 12.2366 8.29893 11.7678 8.76777C11.2989 9.23661 10.663 9.5 9.99999 9.5Z" fill="#2351A3" />
                                            </svg>

                                        ) : (
                                            <svg width="18" height="9" viewBox="0 0 18 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M16.8125 6.67193C16.7411 6.71264 16.6624 6.73887 16.5808 6.74912C16.4993 6.75937 16.4165 6.75344 16.3373 6.73167C16.258 6.7099 16.1839 6.67272 16.119 6.62225C16.0542 6.57178 15.9999 6.50902 15.9593 6.43755L14.475 3.8438C13.612 4.4273 12.66 4.86687 11.6562 5.14537L12.1148 7.89693C12.1283 7.97793 12.1258 8.06081 12.1073 8.14082C12.0887 8.22083 12.0546 8.29641 12.0069 8.36323C11.9592 8.43006 11.8987 8.48681 11.829 8.53027C11.7593 8.57372 11.6818 8.60301 11.6007 8.61646C11.5674 8.62191 11.5337 8.62479 11.5 8.62505C11.3521 8.62483 11.2091 8.5722 11.0964 8.47651C10.9837 8.38081 10.9085 8.24826 10.8843 8.1024L10.4336 5.40084C9.48293 5.53313 8.51856 5.53313 7.56793 5.40084L7.11715 8.1024C7.09289 8.24852 7.01753 8.38129 6.90449 8.47701C6.79145 8.57274 6.64809 8.6252 6.49996 8.62505C6.46541 8.62491 6.43093 8.62204 6.39684 8.61646C6.31582 8.60301 6.23825 8.57372 6.16856 8.53027C6.09887 8.48681 6.03843 8.43006 5.99068 8.36323C5.94294 8.29641 5.90884 8.22083 5.89032 8.14082C5.87181 8.06081 5.86924 7.97793 5.88277 7.89693L6.34371 5.14537C5.3403 4.86599 4.38887 4.42563 3.52652 3.84146L2.04684 6.43755C1.96396 6.58197 1.8271 6.68755 1.66637 6.73107C1.50565 6.77458 1.33422 6.75247 1.1898 6.66959C1.04539 6.58671 0.939806 6.44985 0.896291 6.28913C0.852777 6.1284 0.874893 5.95697 0.957773 5.81255L2.52027 3.07818C1.97144 2.60402 1.46677 2.08105 1.01246 1.51568C0.955803 1.45242 0.912632 1.37828 0.885582 1.29778C0.858532 1.21728 0.84817 1.13211 0.85513 1.04748C0.862089 0.962842 0.886224 0.880512 0.926061 0.805514C0.965898 0.730515 1.0206 0.664422 1.08683 0.611268C1.15306 0.558114 1.22943 0.519015 1.31127 0.496357C1.39311 0.473698 1.47872 0.467957 1.56285 0.479482C1.64699 0.491008 1.72789 0.519559 1.80063 0.563393C1.87336 0.607226 1.9364 0.665422 1.9859 0.734429C3.28277 2.33912 5.55152 4.25005 8.99996 4.25005C12.4484 4.25005 14.7171 2.33677 16.014 0.734429C16.063 0.66401 16.1259 0.604413 16.1988 0.559345C16.2718 0.514277 16.3532 0.484704 16.4381 0.472464C16.5229 0.460224 16.6094 0.46558 16.6921 0.488199C16.7749 0.510818 16.852 0.550215 16.9189 0.60394C16.9857 0.657665 17.0408 0.724568 17.0806 0.800487C17.1205 0.876406 17.1443 0.959716 17.1506 1.04524C17.1569 1.13075 17.1455 1.21665 17.1172 1.29759C17.0888 1.37852 17.0442 1.45276 16.9859 1.51568C16.5316 2.08105 16.0269 2.60402 15.4781 3.07818L17.0406 5.81255C17.0825 5.88383 17.1099 5.96273 17.1211 6.04466C17.1324 6.1266 17.1272 6.20995 17.106 6.28989C17.0848 6.36982 17.0479 6.44475 16.9975 6.51033C16.9471 6.57591 16.8842 6.63084 16.8125 6.67193Z" fill="#2351A3" />
                                            </svg>
                                        )}
                                    </span>
                                </div>
                            </div>

                            {error && <p className="text-red-500 text-sm">{error}</p>}
                            {loginMessage && <p className="text-green-500 text-sm">{loginMessage}</p>}

                            <div>
                                <Button
                                    type="submit"
                                    disabled={!isFormValid || !!loading?.login}
                                    aria-disabled={!isFormValid || !!loading?.login}
                                    className="w-full rounded-xl py-3 font-semibold bg-primary text-white hover:brightness-95 active:brightness-90 transition"
                                >
                                    {loading?.login ? 'Logging in...' : 'Login'}
                                </Button>
                            </div>

                            <div className="text-center text-sm text-gray-500">
                                Don&apos;t have an account?{' '}
                                <Button type="button" className="text-blue-600 hover:underline" onClick={() => openSignupPage()} overrideClasses>
                                    Create account
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </Modal>
    )
}