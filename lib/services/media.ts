import {
  EXPIRES_IN,
  deleteObject,
  generateDownloadUrl,
  generateUploadUrl,
} from "@/lib/r2-client";
import { nanoid } from "nanoid";

export type MediaType = "question_image" | "question_audio" | "choice_audio";

export interface MediaUploadParams {
  type: MediaType;
  testId: string;
  questionId: string;
  choiceId?: string;
  contentType: string;
}

export interface MediaUploadResult {
  uploadUrl: string;
  key: string;
}

function generateMediaKey(
  params: Omit<MediaUploadParams, "contentType">,
): string {
  const { type, testId, questionId, choiceId } = params;
  const uuid = nanoid();
  const basePath = `tests/${testId}/questions/${questionId}`;

  switch (type) {
    case "question_image":
      return `${basePath}/images/${uuid}`;
    case "question_audio":
      return `${basePath}/audio/${uuid}`;
    case "choice_audio":
      if (!choiceId) {
        throw new Error("choiceId is required for choice_audio type");
      }
      return `${basePath}/choices/${choiceId}/audio/${uuid}`;
    default:
      throw new Error(`Unknown media type: ${type}`);
  }
}

export async function generateMediaUploadUrl(
  params: MediaUploadParams,
): Promise<MediaUploadResult> {
  const key = generateMediaKey(params);
  const uploadUrl = await generateUploadUrl(
    key,
    params.contentType,
    EXPIRES_IN,
  );

  return {
    uploadUrl,
    key,
  };
}

export async function deleteMedia(key: string): Promise<void> {
  await deleteObject(key);
}

async function generateMediaDownloadUrl(key: string): Promise<string> {
  return await generateDownloadUrl(key, EXPIRES_IN);
}

export async function signMediaUrl(
  key: string | null | undefined,
): Promise<string | null> {
  if (!key) return null;
  return generateMediaDownloadUrl(key);
}
