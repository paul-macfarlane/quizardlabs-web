"use server";

import { auth } from "@/lib/auth";
import {
  EXPIRES_IN,
  generateDownloadUrl,
  generateUploadUrl,
} from "@/lib/r2-client";
import { headers } from "next/headers";

export async function getUploadUrl(filename: string, contentType: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    throw new Error("Unauthorized: You must be logged in to upload images");
  }

  const timestamp = Date.now();
  const userId = session.user.id;
  const key = `uploads/${userId}/${timestamp}-${filename}`;

  const uploadUrl = await generateUploadUrl(key, contentType, EXPIRES_IN);

  return {
    uploadUrl,
    key,
  };
}

export async function getDownloadUrl(key: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized: You must be logged in to view images");
  }

  const downloadUrl = await generateDownloadUrl(key, EXPIRES_IN);

  return {
    downloadUrl,
  };
}
