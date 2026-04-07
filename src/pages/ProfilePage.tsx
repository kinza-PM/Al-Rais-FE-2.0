import React, { useRef, useState } from "react";
import { Button } from "../components";
import ProfileMilesSummary from "../components/molecules/ProfileMilesSummary";
import LoyaltyPrograms from "../components/molecules/LoyaltyPrograms";
import ProfileFavouriteHotels from "../components/molecules/ProfileFavouriteHotels";
import { useAuth } from "../features/auth/hooks/useAuth";
import toast from "react-hot-toast";
import { Form, Input, Modal } from "antd";
import * as RemoteUserService from "../services/api/remoteUserService";
import { useUserProfileStore } from "../store/userProfileStore";
import ProfileBasicsTab from "../components/molecules/ProfileBasicsTab";

const tabs = ["Basics", "Favorites", "Air miles", "Payments", "Account"] as const;

const ProfilePage: React.FC = () => {
  const [active, setActive] = useState<(typeof tabs)[number]>("Favorites");
  const { user } = useAuth();
  const [editOpen, setEditOpen] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [editForm] = Form.useForm();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const {
    remoteUser, setRemoteUser,
    avatarUrl, setAvatarUrl,
    loading: loadingProfile,
    initials, displayName
  } = useUserProfileStore();

  const displayEmail = remoteUser?.email || user?.email || "";
  const displayPhone = remoteUser?.phoneNumber || user?.phone || "";

  const openEdit = () => {
    editForm.setFieldsValue({
      name: remoteUser?.name || user?.full_name || user?.name || "",
      email: remoteUser?.email || user?.email || "",
      phoneNumber: remoteUser?.phoneNumber || user?.phone || "",
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
        }
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
        }
      );

      setRemoteUser(updated);

      const av = await RemoteUserService.getAvatarViewUrl(
        remoteUser.userId,
        remoteUser.createdAt
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
    <div className="mx-auto flex w-full max-w-screen-2xl flex-col items-center px-16 py-8">
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

      <div className="mt-6 w-full max-w-[720px] max-[625px]:max-w-full max-[625px]:-mx-3 max-[625px]:w-[calc(100%+1.5rem)]">
        <div
          role="tablist"
          aria-label="Profile sections"
          className="flex w-full items-center rounded-2xl ring-1 ring-[#C2CAD6] bg-white p-1 shadow-sm max-[625px]:p-1 max-[625px]:gap-1"
        >
          {tabs.map((t) => {
            const selected = active === t;
            return (
              <Button
                key={t}
                type="button"
                aria-selected={selected}
                onClick={() => setActive(t)}
                className={[
                  "flex-1 rounded-xl px-6 py-2 text-[14px] font-medium transition-colors max-[625px]:px-3 max-[625px]:py-2 max-[625px]:text-[13px]",
                  selected ? "bg-[#2351A3] text-white shadow-sm" : "text-[#3D495C]"
                ].join(" ")}
                overrideClasses
              >
                {t}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="mt-8 w-full">
        {active === "Basics" && (
          <ProfileBasicsTab />
        )}

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
          <div className="text-sm text-[#3D495C]">Payments content…</div>
        )}

        {active === "Account" && (
          <div className="text-sm text-[#3D495C]">Account content…</div>
        )}
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
                name: v.name?.trim() || null,
                email: v.email?.trim() || null,
                phoneNumber: v.phoneNumber?.trim() || null,
              } as any
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
            name="name"
            label="Name"
            rules={[{ required: true, message: "Name is required" }]}
          >
            <Input placeholder="Your name" />
          </Form.Item>

          <Form.Item name="email" label="Email">
            <Input placeholder="you@example.com" />
          </Form.Item>

          <Form.Item name="phoneNumber" label="Phone number">
            <Input placeholder="+9715xxxxxxx" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProfilePage;