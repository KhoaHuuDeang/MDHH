"use client";

import React, { ChangeEvent, useRef } from "react";
import Image from "next/image";
import { getIcon } from "@/utils/getIcon";
import FieldRow from "./FieldRow";

interface UserData {
    displayName: string;
    username: string;
    email: string;
    phone?: string;
    role: string;
    birth?: string; // ISO or readable
    avatar?: string;
    banner?: string; // background image
    joinDate?: string;
}

interface UserProfileSectionProps {
    userData: UserData;
    editingField: string | null;
    tempValues: Record<string, string>;
    showSensitiveData: { email: boolean; phone?: boolean };
    onEdit: (field: string) => void;
    onSave: (field: string) => void;
    onCancel: () => void;
    onToggleSensitiveData: (field: "email" | "phone") => void;
    onSignOut?: () => void;
    onTempChange?: (field: string, value: string) => void;
    onAvatarChange?: (e: ChangeEvent<HTMLInputElement>) => void;
    onBackgroundChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}

function UserProfileSection({
    userData,
    editingField,
    tempValues,
    showSensitiveData,
    onEdit,
    onSave,
    onCancel,
    onToggleSensitiveData,
    onSignOut,
    onTempChange,
    onAvatarChange,
    onBackgroundChange,
}: UserProfileSectionProps) {

    const avatarRef = useRef<HTMLInputElement>(null);
    const backgroundRef = useRef<HTMLInputElement>(null);

    const handleAvatarClick = () => {
        avatarRef.current?.click();
    }

    const handleBackgroundClick = () => {
        backgroundRef.current?.click();
    }

    const maskEmail = (email: string) => {
        const [local, domain] = email.split("@");
        return `${"*".repeat(Math.max(4, local.length))}@${domain ?? ""}`;
    };

    return (
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            {/* Responsive banner với aspect ratio - Mobile First */}
            <div className="relative h-44 w-full md:h-56">
                <Image
                    src={userData.banner!}
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
                    onChange={onBackgroundChange}
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
                                    alt={`${userData.displayName}'s avatar`}
                                    fill
                                    sizes="(max-width: 640px) 80px, (max-width: 768px) 96px, 112px"
                                    className="object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#6A994E] to-[#386641] text-xl sm:text-2xl font-bold text-white">
                                    {userData.displayName?.charAt(0)}
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
                            onChange={onAvatarChange}
                            accept="image/*"
                        />
                    </div>

                    {/* Name & role section - Better responsive typography */}
                    <div className="flex-1 min-w-0"> {/* min-w-0 để prevent overflow */}
                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
                            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 truncate">
                                {userData.displayName}
                            </h1>
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1 rounded-lg bg-[#F0F8F2] px-2 py-1 text-xs font-medium text-[#386641] ring-1 ring-[#386641]/20">
                                    {getIcon("Shield", 14)} {userData.role}
                                </span>
                                {userData.joinDate && (
                                    <span className="text-xs text-gray-500">
                                        • Joined {userData.joinDate}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Mobile sign out button - Full width for easy tapping */}
                        {onSignOut && (
                            <button
                                onClick={onSignOut}
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
                    {onSignOut && (
                        <button
                            onClick={onSignOut}
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
                    {editingField === "displayName" ? (
                        <FieldRow
                            label="Display Name"
                            icon="User"
                            value={
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                                    <input
                                        type="text"
                                        value={tempValues.displayName ?? userData.displayName}
                                        onChange={(e) => onTempChange?.("displayName", e.target.value)}
                                        className="w-full sm:w-48 min-h-[44px] rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#6A994E] focus:ring-2 focus:ring-[#6A994E]/40"
                                    />
                                    <div className="flex gap-2 w-full sm:w-auto">
                                        <button
                                            onClick={() => onSave("displayName")}
                                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1 min-h-[44px] rounded-md bg-[#386641] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#2d4f31] focus:outline-none focus:ring-2 focus:ring-[#386641]"
                                        >
                                            {getIcon("Check", 16)} Save
                                        </button>
                                        <button
                                            onClick={onCancel}
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
                            value={<span className="font-medium">{userData.displayName}</span>}
                            action={
                                <button
                                    onClick={() => onEdit("displayName")}
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
                                            onClick={() => onToggleSensitiveData("email")}
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
                                value={<span className="font-medium">{userData.role}</span>}
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
                                                onChange={(e) => onTempChange?.("birth", e.target.value)}
                                                className="w-full min-h-[44px] rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#6A994E] focus:ring-2 focus:ring-[#6A994E]/40"
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => onSave("birth")}
                                                    className="flex-1 inline-flex items-center justify-center gap-1 min-h-[44px] rounded-md bg-[#386641] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#2d4f31] focus:outline-none focus:ring-2 focus:ring-[#386641]"
                                                >
                                                    {getIcon("Check", 16)} Save
                                                </button>
                                                <button
                                                    onClick={onCancel}
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
                                            onClick={() => onEdit("birth")}
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
                                    onClick={() => onToggleSensitiveData("email")}
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
                        value={<span className="font-medium">{userData.role}</span>}
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
                                        onChange={(e) => onTempChange?.("birth", e.target.value)}
                                        className="min-h-[44px] rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#6A994E] focus:ring-2 focus:ring-[#6A994E]/40"
                                    />
                                    <button
                                        onClick={() => onSave("birth")}
                                        className="inline-flex items-center gap-1 min-h-[44px] rounded-md bg-[#386641] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#2d4f31] focus:outline-none focus:ring-2 focus:ring-[#386641]"
                                    >
                                        {getIcon("Check", 16)} Save
                                    </button>
                                    <button
                                        onClick={onCancel}
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
                                    onClick={() => onEdit("birth")}
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