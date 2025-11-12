
import { promises as fs } from 'fs';
import path from 'path';
import { uploadFile, deleteFile } from './s3';

export interface ProcessedFile {
  cloud_storage_path: string;
  originalName: string;
  size: number;
  mimeType: string;
}

export async function saveUploadedFile(file: File): Promise<ProcessedFile> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const cloud_storage_path = await uploadFile(buffer, file.name);
  
  return {
    cloud_storage_path,
    originalName: file.name,
    size: file.size,
    mimeType: file.type
  };
}

export async function cleanupFile(cloud_storage_path: string): Promise<void> {
  try {
    await deleteFile(cloud_storage_path);
  } catch (error) {
    console.error(`Failed to cleanup file ${cloud_storage_path}:`, error);
  }
}

export async function cleanupFiles(cloud_storage_paths: string[]): Promise<void> {
  await Promise.all(cloud_storage_paths.map(cleanupFile));
}

export function getFileExtension(filename: string): string {
  return path.extname(filename).toLowerCase();
}

export function getFileNameWithoutExtension(filename: string): string {
  return path.basename(filename, path.extname(filename));
}

export function generateOutputFileName(originalName: string, newExtension: string): string {
  const nameWithoutExt = getFileNameWithoutExtension(originalName);
  return `${nameWithoutExt}${newExtension}`;
}

export function validateFileType(file: File, allowedTypes: string[]): boolean {
  const fileExtension = getFileExtension(file.name);
  return allowedTypes.includes(fileExtension);
}

export async function downloadFileFromS3(cloud_storage_path: string): Promise<Buffer> {
  const { downloadFile } = await import('./s3');
  return await downloadFile(cloud_storage_path);
}
