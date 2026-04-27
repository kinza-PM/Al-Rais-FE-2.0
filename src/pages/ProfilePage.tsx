import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components";
import ProfileMilesSummary from "../components/molecules/ProfileMilesSummary";
import LoyaltyPrograms from "../components/molecules/LoyaltyPrograms";
import ProfileFavouriteHotels from "../components/molecules/ProfileFavouriteHotels";
import { useAuth } from "../features/auth/hooks/useAuth";
import toast from "react-hot-toast";
import { DatePicker, Form, Input, Modal, Select } from "antd";
import * as RemoteUserService from "../services/api/remoteUserService";
import { useUserProfileStore } from "../store/userProfileStore";
import ProfileBasicsTab from "../components/molecules/ProfileBasicsTab";
import ProfileSavedTravelersTab from "../components/molecules/ProfileSavedTravelersTab";

const tabs = [
  "Basics",
  "Favorites",
  "Air miles",
  "Payments",
  "Account",
  "Saved Travelers",
] as const;

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

const EmptySectionState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
}) => (
  <div className="mx-auto flex w-full max-w-[1080px] items-center justify-center px-4">
    <div className="w-full rounded-2xl border border-[#E4E4E7] bg-white px-6 py-12 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#EEF3FF] text-[#2351A3]">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M12 17v.01M12 13a3 3 0 1 0-3-3"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      </div>
      <h3 className="text-[20px] font-semibold text-[#0A0C0F]">{title}</h3>
      <p className="mx-auto mt-2 max-w-[540px] text-[14px] text-[#3D495C]">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button
          type="button"
          onClick={onAction}
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-[#2351A3] px-6 py-2 text-[14px] font-semibold text-white hover:opacity-95"
          overrideClasses
        >
          {actionLabel}
        </Button>
      )}
    </div>
  </div>
);

function profileTabClass(selected: boolean): string {
  return [
    "box-border flex h-[39px] min-w-[108px] shrink-0 cursor-pointer items-center justify-center rounded-tl-[16px] rounded-tr-[16px] rounded-bl-none rounded-br-none border-0 px-[20px] py-[10px] text-[14px] font-medium leading-none tracking-normal transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#2351A3] focus-visible:ring-offset-2",
    selected ? "bg-[#2351A3] text-white" : "bg-[#E4E4E7] text-[#0A0C0F]",
  ].join(" ");
}

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [active, setActive] = useState<(typeof tabs)[number]>("Favorites");
  const { user } = useAuth();
  const [editOpen, setEditOpen] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [editForm] = Form.useForm();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const {
    remoteUser,
    setRemoteUser,
    avatarUrl,
    setAvatarUrl,
    loading: loadingProfile,
    initials,
    displayName,
  } = useUserProfileStore();

  const displayEmail = remoteUser?.email || user?.email || "";
  const displayPhone = remoteUser?.phoneNumber || user?.phone || "";
  const hasBasicsData = Boolean(
    String(remoteUser?.name || user?.full_name || user?.name || "").trim() ||
      String(displayEmail).trim() ||
      String(displayPhone).trim(),
  );

  const openEdit = () => {
    const fullName = remoteUser?.name || user?.full_name || user?.name || "";
    const parts = fullName.split(/\s+/).filter(Boolean);
    const firstName = parts[0] ?? "";
    const lastName = parts.slice(1).join(" ");
    const genderRaw = String((remoteUser as any)?.gender ?? "")
      .trim()
      .toUpperCase();
    editForm.setFieldsValue({
      firstName,
      lastName,
      dob: null,
      email: remoteUser?.email || user?.email || "",
      phoneNumber: remoteUser?.phoneNumber || user?.phone || "",
      gender: genderRaw === "F" ? "female" : "male",
      passportNumber: "",
      issuingCountry: "United Arab Emirates",
      expiryDate: null,
    });
    setEditOpen(true);
  };

  const onPickAvatar = () => {
    fileInputRef.current?.click();
  };

  const onAvatarSelected = async (file?: File | null) => {
    if (!file) return;
    if (!remoteUser) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }

    setUploadingAvatar(true);
    try {
      const presign = await RemoteUserService.presignAvatarUpload(
        remoteUser.userId,
        remoteUser.createdAt,
        {
          contentType: file.type,
          fileName: file.name,
        },
      );

      const putRes = await fetch(presign.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!putRes.ok) throw new Error("Upload failed");

      const updated = await RemoteUserService.updateUser(
        remoteUser.userId,
        remoteUser.createdAt,
        {
          avatarKey: presign.key,
        },
      );

      setRemoteUser(updated);

      const av = await RemoteUserService.getAvatarViewUrl(
        remoteUser.userId,
        remoteUser.createdAt,
      );
      setAvatarUrl(av.url);

      toast.success("Profile picture updated.");
    } catch (e: any) {
      toast.error(e?.message || "Failed to upload profile picture.");
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-screen-2xl flex-col items-center py-8">
      <section className="w-full max-w-md rounded-2xl border border-[#E4E4E7] bg-white px-10 py-8 text-center shadow-sm">
        <div className="mx-auto mb-4 h-40 w-40 overflow-hidden relative">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="profile"
              className="h-full w-full object-cover rounded-full"
            />
          ) : (
            <div className="h-full w-full rounded-full bg-[#2351A3] flex items-center justify-center">
              <span className="text-white font-semibold text-[42px] tracking-wide select-none">
                {initials}
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={onPickAvatar}
            disabled={uploadingAvatar || loadingProfile}
            className="absolute bottom-2 right-2 rounded-full bg-white/90 border border-[#E4E4E7] px-3 py-1 text-[12px] text-[#2351A3] font-semibold"
          >
            {uploadingAvatar ? "Uploading..." : "Change"}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => void onAvatarSelected(e.target.files?.[0] ?? null)}
          />
        </div>

        <p className="text-[14px] text-[#3D495C]">{displayName}</p>

        <div className="mt-2 space-y-1 text-[14px] text-[#3D495C]">
          <p className="break-all cursor-text">{displayEmail}</p>
          <p className="cursor-text">{displayPhone}</p>
        </div>

        <Button
          type="button"
          onClick={openEdit}
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-[#2351A3] px-8 py-2 text-[14px] font-semibold text-white"
          overrideClasses
        >
          {loadingProfile ? "Loading..." : "Edit profile"}
        </Button>
      </section>

      <div className="mt-6 flex w-full justify-center">
        <div
          role="tablist"
          aria-label="Profile sections"
          className="flex flex-wrap items-center justify-center gap-[10px]"
        >
          {tabs.map((t) => {
            const selected = active === t;
            return (
              <Button
                overrideClasses
                key={t}
                type="button"
                // role="tab"
                aria-selected={selected}
                onClick={() => setActive(t)}
                className={profileTabClass(selected)}
              >
                {t}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="mt-0 flex w-full justify-center">
        <div
          aria-hidden="true"
          className="rounded-tl-[16px] rounded-tr-[16px]"
          style={{
            width: "100%",
            maxWidth: 1368,
            height: 10,
            background: "linear-gradient(180deg, #C4CFE1 0%, #DEF7FE 100%)",
            backdropFilter: "blur(5px)",
          }}
        />
      </div>

      <div className="mt-8 w-full">
        {active === "Basics" &&
          (hasBasicsData ? (
            <ProfileBasicsTab />
          ) : (
            <EmptySectionState
              title="No profile info found"
              description="It looks like your basic details haven't been set up yet."
              actionLabel="Complete Profile"
              onAction={openEdit}
            />
          ))}

        {active === "Favorites" && <ProfileFavouriteHotels />}

        {active === "Air miles" && (
          <>
            <ProfileMilesSummary />
            <div className="mt-6">
              <LoyaltyPrograms />
            </div>
          </>
        )}

        {active === "Payments" && (
          <EmptySectionState
            title="No payment history"
            description="You haven't made any transactions or added a payment method yet."
            actionLabel="Add Payment Method"
            onAction={() => navigate("/payments-help")}
          />
        )}

        {active === "Account" && (
          <EmptySectionState
            title="Account details missing"
            description="We couldn't find any account-specific data for this user."
            actionLabel="Refresh Page"
            onAction={() => window.location.reload()}
          />
        )}
        {active === "Saved Travelers" && <ProfileSavedTravelersTab />}
      </div>

      <Modal
        title="Edit profile"
        open={editOpen}
        onCancel={() => setEditOpen(false)}
        okText="Save"
        confirmLoading={savingEdit}
        onOk={async () => {
          if (!remoteUser) return;
          const v = await editForm.validateFields();
          setSavingEdit(true);
          try {
            const updated = await RemoteUserService.updateUser(
              remoteUser.userId,
              remoteUser.createdAt,
              {
                name:
                  `${String(v.firstName ?? "").trim()} ${String(v.lastName ?? "").trim()}`.trim() ||
                  null,
                email: v.email?.trim() || null,
                phoneNumber: v.phoneNumber?.trim() || null,
              } as any,
            );
            setRemoteUser(updated);
            toast.success("Profile updated.");
            setEditOpen(false);
          } catch (e: any) {
            toast.error(e?.message || "Failed to update profile.");
          } finally {
            setSavingEdit(false);
          }
        }}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            name="firstName"
            label="First Name"
            rules={[{ required: true, message: "First name is required" }]}
          >
            <Input placeholder="First name" />
          </Form.Item>

          <Form.Item name="lastName" label="Last Name">
            <Input placeholder="Last name" />
          </Form.Item>

          <Form.Item name="dob" label="Date of birth">
            <DatePicker style={{ width: "100%" }} format="DD-MM-YYYY" />
          </Form.Item>

          <Form.Item name="email" label="Email">
            <Input placeholder="you@example.com" />
          </Form.Item>

          <Form.Item name="phoneNumber" label="Phone number">
            <Input placeholder="+9715xxxxxxx" />
          </Form.Item>

          <Form.Item name="gender" label="Gender">
            <Select
              options={[
                { value: "male", label: "Male" },
                { value: "female", label: "Female" },
              ]}
            />
          </Form.Item>

          <Form.Item name="passportNumber" label="Passport Number">
            <Input placeholder="Passport number" />
          </Form.Item>

          <Form.Item name="issuingCountry" label="Issuing Country">
            <Select
              options={[
                {
                  value: "United Arab Emirates",
                  label: "United Arab Emirates",
                },
                { value: "Saudi Arabia", label: "Saudi Arabia" },
                { value: "Pakistan", label: "Pakistan" },
                { value: "India", label: "India" },
              ]}
            />
          </Form.Item>

          <Form.Item name="expiryDate" label="Expiry Date">
            <DatePicker style={{ width: "100%" }} format="DD-MM-YYYY" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProfilePage;
