"use client";

import React, { ChangeEvent, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { signOut } from "next-auth/react";
import { getIcon } from "@/utils/getIcon";
import FieldRow from "./FieldRow";
import useUserProfile from "@/hooks/useUserProfile";
import { userService } from "@/services/userService";

interface UserProfileSectionProps {
    userId: string;
}

function UserProfileSection({ userId }: UserProfileSectionProps) {

    const { optimisticData: userData, isLoading, updateProfile } = useUserProfile(userId);
    
    // Internal state management
    const [editingField, setEditingField] = useState<string | null>(null);
    const [tempValues, setTempValues] = useState<Record<string, string>>({});
    const [showSensitiveData, setShowSensitiveData] = useState({ email: false, phone: false });

    const avatarRef = useRef<HTMLInputElement>(null);
    const backgroundRef = useRef<HTMLInputElement>(null);

    // Internal handlers
    const handleEdit = useCallback((field: string) => {
        setEditingField(field);
        setTempValues((prev) => ({ ...prev, [field]: (userData as any)?.[field] as string ?? "" }));
    }, [userData]); // 
    const handleSave = useCallback(async (field: string) => {
        if (!userData) return;
        
        const value = tempValues[field];
        await updateProfile({ [field]: value });
        setEditingField(null);
    }, [tempValues, updateProfile, userData]); 

    const handleCancel = useCallback(() => {
        setEditingField(null);
        setTempValues({});
    }, []);

    const handleTempChange = useCallback((field: string, value: string) => {
        setTempValues((prev) => ({ ...prev, [field]: value }));
    }, []);

    const toggleSensitiveData = useCallback((field: "email" | "phone") => {
        setShowSensitiveData((prev) => ({ ...prev, [field]: !prev[field] }));
    }, []);

    const handleSignOut = useCallback(() => {
        signOut({ callbackUrl: "/auth" });
    }, []);

    const handleAvatarClick = useCallback(() => {
        avatarRef.current?.click();
    }, []);

    const handleBackgroundClick = useCallback(() => {
        backgroundRef.current?.click();
    }, []);

    const handleAvatarChange = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && userData) {
            try {
                // Upload file and get real S3 URL
                const publicUrl = await userService.uploadProfileImage(file, 'avatar');
                // Update profile with real URL
                await updateProfile({ avatar: publicUrl });
            } catch (error) {
                console.error('Avatar upload failed:', error);
            }
        }
    }, [userData, updateProfile]);

    const handleBackgroundChange = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && userData) {
            try {
                // Upload file and get real S3 URL
                const publicUrl = await userService.uploadProfileImage(file, 'banner');
                // Update profile with real URL
                await updateProfile({ banner: publicUrl });
            } catch (error) {
                console.error('Banner upload failed:', error);
            }
        }
    }, [userData, updateProfile]);

    const maskEmail = useCallback((email: string) => {
        const [local, domain] = email.split("@");
        return `${"*".repeat(Math.max(4, local.length))}@${domain ?? ""}`;
    }, []);
    if (isLoading || !userData) {
        return (
            <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="animate-pulse">
                    <div className="h-44 md:h-56 bg-gray-200" />
                    <div className="px-4 sm:px-6 pb-6 -mt-12 sm:-mt-14 md:-mt-16">
                        <div className="flex flex-col gap-4 md:flex-row md:items-end">
                            <div className="relative self-start">
                                <div className="h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28 bg-gray-300 rounded-full ring-4 ring-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="h-8 bg-gray-300 rounded mb-2 w-48" />
                                <div className="h-6 bg-gray-200 rounded w-32" />
                            </div>
                        </div>
                    </div>
                    <div className="px-4 sm:px-6 pb-6 space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-full" />
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-4 bg-gray-200 rounded w-1/2" />
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            {/* Responsive banner với aspect ratio - Mobile First */}
            <div className="relative h-44 w-full md:h-56">
                <Image
                    src={userData.banner || '/logo.svg'}
                    alt="Profile banner"
                    fill
                    sizes="100vw"
                    className="object-contain" // contain cho mobile, cover cho desktop
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30" aria-hidden />

                {/* Mobile-friendly edit button - WCAG AAA compliant */}
                <button
                    type="button"
                    onClick={handleBackgroundClick}
                    className="absolute right-3 top-3 sm:right-4 sm:top-4 
                             inline-flex items-center gap-2
                             min-h-[44px] min-w-[44px] px-4 py-2.5 
                             text-sm font-medium sm:text-xs sm:px-3 sm:py-1.5
                             rounded-lg border border-white/40 bg-black/30 text-white 
                             backdrop-blur-sm transition-all hover:bg-black/45 hover:shadow-md 
                             focus:outline-none focus:ring-2 focus:ring-white/40"
                    aria-label="Edit background image"
                >
                    {getIcon("Image", 16)}
                    <span className="hidden sm:inline">Edit Background</span>
                </button>

                {/* Hidden file input */}
                <input
                    type="file"
                    ref={backgroundRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleBackgroundChange}
                />
            </div>

            {/* Header: avatar + name + actions - Proper overlap calculation */}
            <div className="px-4 sm:px-6 pb-6 -mt-12 sm:-mt-14 md:-mt-16">
                <div className="flex flex-col gap-4 md:flex-row md:items-end">
                    {/* Avatar section */}
                    <div className="relative self-start">
                        <div className="relative h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28 
                                      overflow-hidden rounded-full ring-4 ring-white shadow-lg">
                            {userData.avatar ? (
                                <Image
                                    src={userData.avatar}
                                    alt={`${userData.displayname}'s avatar`}
                                    fill
                                    sizes="(max-width: 640px) 80px, (max-width: 768px) 96px, 112px"
                                    className="object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#6A994E] to-[#386641] text-xl sm:text-2xl font-bold text-white">
                                    {userData.displayname?.charAt(0)}
                                </div>
                            )}
                        </div>

                        {/* Camera button - WCAG compliant touch target */}
                        <button
                            type="button"
                            onClick={handleAvatarClick}
                            className="absolute -bottom-1 -right-1 
                                     min-h-[44px] min-w-[44px] h-10 w-10 sm:h-12 sm:w-12
                                     inline-flex items-center justify-center 
                                     rounded-full border border-white/60 bg-black/40 text-white 
                                     backdrop-blur-sm transition-all hover:bg-black/60 
                                     focus:outline-none focus:ring-2 focus:ring-white/40"
                            aria-label="Edit avatar"
                        >
                            {getIcon("Camera", 16)}
                        </button>

                        <input
                            type="file"
                            ref={avatarRef}
                            className="hidden"
                            onChange={handleAvatarChange}
                            accept="image/*"
                        />
                    </div>

                    {/* Name & role section - Better responsive typography */}
                    <div className="flex-1 min-w-0"> {/* min-w-0 để prevent overflow */}
                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
                            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 truncate">
                                {userData.displayname}
                            </h1>
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1 rounded-lg bg-[#F0F8F2] px-2 py-1 text-xs font-medium text-[#386641] ring-1 ring-[#386641]/20">
                                    {getIcon("Shield", 14)} {userData.roles.name}
                                </span>
                                {userData.created_at && (
                                    <span className="text-xs text-gray-500">
                                        • Joined {userData.created_at}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Mobile sign out button - Full width for easy tapping */}
                        {handleSignOut && (
                            <button
                                onClick={handleSignOut}
                                className="mt-3 w-full inline-flex items-center justify-center gap-2
                                         min-h-[44px] px-4 py-2.5 
                                         rounded-lg bg-red-600 text-white text-sm font-semibold
                                         shadow-sm transition-all hover:bg-red-700 hover:shadow-md 
                                         focus:outline-none focus:ring-2 focus:ring-red-400
                                         sm:hidden"
                                aria-label="Sign out of account"
                            >
                                {getIcon("LogOut", 16)} Sign out
                            </button>
                        )}
                    </div>

                    {/* Desktop sign out button */}
                    {handleSignOut && (
                        <button
                            onClick={handleSignOut}
                            className="hidden sm:inline-flex items-center gap-2 
                                     min-h-[44px] px-4 py-2 
                                     rounded-lg bg-red-600 text-white text-sm font-semibold 
                                     shadow-sm transition-all hover:bg-red-700 hover:shadow-md 
                                     focus:outline-none focus:ring-2 focus:ring-red-400"
                        >
                            {getIcon("LogOut", 16)} Sign out
                        </button>
                    )}
                </div>
            </div>

            {/* Progressive disclosure info grid */}
            <div className="px-4 sm:px-6 pb-6 space-y-6">
                {/* Essential info - always visible và 2 cột even trên mobile */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Display Name (editable) */}
                    {editingField === "displayname" ? (
                        <FieldRow
                            label="Display Name"
                            icon="User"
                            value={
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                                    <input
                                        type="text"
                                        value={tempValues.displayname ?? userData.displayname}
                                        onChange={(e) => handleTempChange?.("displayname", e.target.value)}
                                        className="w-full sm:w-48 min-h-[44px] rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#6A994E] focus:ring-2 focus:ring-[#6A994E]/40"
                                    />
                                    <div className="flex gap-2 w-full sm:w-auto">
                                        <button
                                            onClick={() => handleSave("displayname")}
                                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1 min-h-[44px] rounded-md bg-[#386641] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#2d4f31] focus:outline-none focus:ring-2 focus:ring-[#386641]"
                                        >
                                            {getIcon("Check", 16)} Save
                                        </button>
                                        <button
                                            onClick={handleCancel}
                                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1 min-h-[44px] rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
                                        >
                                            {getIcon("X", 16)} Cancel
                                        </button>
                                    </div>
                                </div>
                            }
                        />
                    ) : (
                        <FieldRow
                            label="Display Name"
                            icon="User"
                            value={<span className="font-medium">{userData.displayname}</span>}
                            action={
                                <button
                                    onClick={() => handleEdit("displayname")}
                                    className="inline-flex items-center gap-1 min-h-[44px] min-w-[44px] rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
                                >
                                    {getIcon("Pencil", 16)} <span className="hidden sm:inline">Edit</span>
                                </button>
                            }
                        />
                    )}

                    {/* Username (read-only) */}
                    <FieldRow
                        label="Username"
                        icon="AtSign"
                        value={<code className="text-sm text-gray-800 break-all">@{userData.username}</code>}
                        readOnly
                    />
                </div>

                {/* Secondary info - Progressive disclosure cho mobile */}
                <div className="sm:hidden">
                    <details className="group">
                        <summary className="flex items-center justify-between min-h-[44px] text-sm font-medium text-gray-700 cursor-pointer list-none p-3 rounded-lg border border-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300">
                            <span>More Information</span>
                            <svg
                                className="w-5 h-5 transition-transform group-open:rotate-180"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </summary>
                        <div className="mt-3 space-y-3 p-3 bg-gray-50 rounded-lg">
                            {/* Email */}
                            <FieldRow
                                label="Email"
                                icon="Mail"
                                value={
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                                        <span className="font-medium break-all text-sm">
                                            {showSensitiveData.email ? userData.email : maskEmail(userData.email)}
                                        </span>
                                        <button
                                            onClick={() => toggleSensitiveData("email")}
                                            className="inline-flex items-center gap-1 min-h-[44px] rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
                                        >
                                            {getIcon(showSensitiveData.email ? "EyeOff" : "Eye", 16)}
                                            {showSensitiveData.email ? "Hide" : "Reveal"}
                                        </button>
                                    </div>
                                }
                                readOnly
                            />

                            {/* Role */}
                            <FieldRow
                                label="Role"
                                icon="Shield"
                                value={<span className="font-medium">{userData.roles.name}</span>}
                                readOnly
                            />

                            {/* Birth */}
                            {editingField === "birth" ? (
                                <FieldRow
                                    label="Birth"
                                    icon="Calendar"
                                    value={
                                        <div className="flex flex-col gap-2">
                                            <input
                                                type="date"
                                                value={tempValues.birth ?? userData.birth ?? ""}
                                                onChange={(e) => handleTempChange?.("birth", e.target.value)}
                                                className="w-full min-h-[44px] rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#6A994E] focus:ring-2 focus:ring-[#6A994E]/40"
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleSave("birth")}
                                                    className="flex-1 inline-flex items-center justify-center gap-1 min-h-[44px] rounded-md bg-[#386641] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#2d4f31] focus:outline-none focus:ring-2 focus:ring-[#386641]"
                                                >
                                                    {getIcon("Check", 16)} Save
                                                </button>
                                                <button
                                                    onClick={handleCancel}
                                                    className="flex-1 inline-flex items-center justify-center gap-1 min-h-[44px] rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
                                                >
                                                    {getIcon("X", 16)} Cancel
                                                </button>
                                            </div>
                                        </div>
                                    }
                                />
                            ) : (
                                <FieldRow
                                    label="Birth"
                                    icon="Calendar"
                                    value={<span className="font-medium">{userData.birth || "—"}</span>}
                                    action={
                                        <button
                                            onClick={() => handleEdit("birth")}
                                            className="inline-flex items-center gap-1 min-h-[44px] rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
                                        >
                                            {getIcon("Pencil", 16)} Edit
                                        </button>
                                    }
                                />
                            )}
                        </div>
                    </details>
                </div>

                {/* Desktop grid - All fields visible */}
                <div className="hidden sm:grid sm:grid-cols-2 gap-3">
                    {/* Email */}
                    <FieldRow
                        label="Email"
                        icon="Mail"
                        value={
                            <div className="flex items-center gap-2">
                                <span className="font-medium truncate">
                                    {showSensitiveData.email ? userData.email : maskEmail(userData.email)}
                                </span>
                                <button
                                    onClick={() => toggleSensitiveData("email")}
                                    className="inline-flex items-center gap-1 min-h-[44px] min-w-[44px] rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
                                >
                                    {getIcon(showSensitiveData.email ? "EyeOff" : "Eye", 16)}
                                    <span className="hidden lg:inline">
                                        {showSensitiveData.email ? "Hide" : "Reveal"}
                                    </span>
                                </button>
                            </div>
                        }
                        readOnly
                    />

                    {/* Role */}
                    <FieldRow
                        label="Role"
                        icon="Shield"
                        value={<span className="font-medium">{userData.roles.name}</span>}
                        readOnly
                    />

                    {/* Birth */}
                    {editingField === "birth" ? (
                        <FieldRow
                            label="Birth"
                            icon="Calendar"
                            value={
                                <div className="flex items-center gap-2">
                                    <input
                                        type="date"
                                        value={tempValues.birth ?? userData.birth ?? ""}
                                        onChange={(e) => handleTempChange?.("birth", e.target.value)}
                                        className="min-h-[44px] rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#6A994E] focus:ring-2 focus:ring-[#6A994E]/40"
                                    />
                                    <button
                                        onClick={() => handleSave("birth")}
                                        className="inline-flex items-center gap-1 min-h-[44px] rounded-md bg-[#386641] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#2d4f31] focus:outline-none focus:ring-2 focus:ring-[#386641]"
                                    >
                                        {getIcon("Check", 16)} Save
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        className="inline-flex items-center gap-1 min-h-[44px] rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
                                    >
                                        {getIcon("X", 16)} Cancel
                                    </button>
                                </div>
                            }
                        />
                    ) : (
                        <FieldRow
                            label="Birth"
                            icon="Calendar"
                            value={<span className="font-medium">{userData.birth || "—"}</span>}
                            action={
                                <button
                                    onClick={() => handleEdit("birth")}
                                    className="inline-flex items-center gap-1 min-h-[44px] min-w-[44px] rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
                                >
                                    {getIcon("Pencil", 16)} <span className="hidden lg:inline">Edit</span>
                                </button>
                            }
                        />
                    )}
                </div>
            </div>
        </section>
    );
}

export default UserProfileSection;